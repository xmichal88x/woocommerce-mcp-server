import { z } from 'zod';
import { isIPv4 } from 'net';
import { getWpClient } from '../plugin-client.js';
import { registerGroup } from '../groups.js';
import { isReadOnly } from '../client.js';
import { readOnlyError, validateArgs, withErrorHandling } from '../utils.js';

registerGroup({
  name: 'media',
  tools: [
    {
      name: 'media_list',
      description: 'List media files in the library',
      inputSchema: {
        type: 'object',
        properties: {
          page: { type: 'integer', description: 'Page number' },
          per_page: { type: 'integer', description: 'Items per page (max 100)' },
          search: { type: 'string', description: 'Search term' },
          media_type: {
            type: 'string',
            enum: ['image', 'video', 'audio', 'application'],
            description: 'Filter by media type',
          },
        },
      },
      handler: async (args) =>
        withErrorHandling(async () => {
          const v = validateArgs(
            z.object({
              page: z.number().int().optional(),
              per_page: z.number().int().optional(),
              search: z.string().optional(),
              media_type: z.enum(['image', 'video', 'audio', 'application']).optional(),
            }),
            args,
          );
          const client = getWpClient();
          const response = await client.get('media', { params: v });
          const data = response.data;
          const total = parseInt(String(response.headers['x-wp-total'] || '0'), 10) || 0;
          const totalPages = parseInt(String(response.headers['x-wp-totalpages'] || '0'), 10) || 0;
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({ media: data, total, totalPages }, null, 2),
              },
            ],
          };
        }),
    },
    {
      name: 'media_upload',
      description: 'Upload an image to the media library from a URL',
      inputSchema: {
        type: 'object',
        properties: {
          source: { type: 'string', description: 'URL of the image to download and upload' },
          name: { type: 'string', description: 'Custom filename (defaults to filename from URL)' },
          alt_text: { type: 'string', description: 'Alt text for the image' },
        },
        required: ['source'],
      },
      handler: async (args) => {
        if (isReadOnly()) return readOnlyError();
        return withErrorHandling(async () => {
          const v = validateArgs(
            z.object({
              source: z.string().url(),
              name: z.string().optional(),
              alt_text: z.string().optional(),
            }),
            args,
          );
          const parsedUrl = new URL(v.source);
          const hostname = parsedUrl.hostname;

          if (isIPv4(hostname)) {
            const firstOctet = parseInt(hostname.split('.')[0], 10);
            const secondOctet = parseInt(hostname.split('.')[1] || '0', 10);
            const isPrivate =
              hostname === '127.0.0.1' ||
              hostname === '0.0.0.0' ||
              firstOctet === 10 ||
              (firstOctet === 172 && secondOctet >= 16 && secondOctet <= 31) ||
              (firstOctet === 192 && secondOctet === 168);
            if (isPrivate) {
              throw new Error(`Private IP '${hostname}' is not allowed as image source`);
            }
          }

          const lower = hostname.toLowerCase();
          if (
            lower === 'localhost' ||
            lower === '127.0.0.1' ||
            lower === '0.0.0.0' ||
            lower === '[::1]'
          ) {
            throw new Error(`Address '${hostname}' is not allowed as image source`);
          }

          if (hostname.includes(':')) {
            const v6lower = hostname.toLowerCase();
            const isPrivateIPv6 =
              v6lower.startsWith('fc') ||
              v6lower.startsWith('fd') ||
              v6lower.startsWith('fe8') ||
              v6lower.startsWith('fe9') ||
              v6lower.startsWith('fea') ||
              v6lower.startsWith('feb');
            if (isPrivateIPv6) {
              throw new Error(`Private IPv6 address '${hostname}' is not allowed as image source`);
            }
          }

          const imageResp = await fetch(v.source);
          const buffer = Buffer.from(await imageResp.arrayBuffer());
          const contentType = String(imageResp.headers.get('content-type') || 'image/jpeg');
          if (!contentType.startsWith('image/')) {
            throw new Error(`Invalid content type '${contentType}'. Only image types are allowed.`);
          }
          const filename = v.name || v.source.split('/').pop() || 'upload.jpg';

          const wpClient = getWpClient();

          const uploadResp = await wpClient.post('media', buffer, {
            headers: {
              'Content-Type': contentType,
              'Content-Disposition': `attachment; filename="${filename}"`,
            },
            maxContentLength: 10 * 1024 * 1024, // 10MB
            maxBodyLength: 10 * 1024 * 1024, // 10MB
          });

          if (v.alt_text && uploadResp.data?.id) {
            await wpClient.post(
              `media/${(uploadResp.data as { id: number }).id}`,
              { alt_text: v.alt_text },
              { headers: { 'Content-Type': 'application/json' } },
            );
          }

          return {
            content: [{ type: 'text', text: JSON.stringify(uploadResp.data, null, 2) }],
          };
        });
      },
    },
    {
      name: 'media_delete',
      description: 'Delete a media file from the library',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'Media ID' },
          force: { type: 'boolean', description: 'Force delete (skip trash)', default: true },
        },
        required: ['id'],
      },
      handler: async (args) => {
        if (isReadOnly()) return readOnlyError();
        return withErrorHandling(async () => {
          const v = validateArgs(
            z.object({ id: z.number().int().positive(), force: z.boolean().optional() }),
            args,
          );
          const client = getWpClient();
          const params: Record<string, unknown> = { force: true };
          if (v.force !== undefined) params.force = v.force;
          const response = await client.delete(`media/${v.id}`, { params });
          return {
            content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }],
          };
        });
      },
    },
  ],
});
