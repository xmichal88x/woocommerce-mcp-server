import { z } from 'zod';
import { registerGroup } from '../groups.js';
import { getClient, isReadOnly } from '../client.js';

import { extractPagination } from '../types.js';
import { readOnlyError, validateArgs, withErrorHandling } from '../utils.js';

registerGroup({
  name: 'taxes',
  tools: [
    // ── Tax Classes ──
    {
      name: 'taxes_classes_list',
      description: 'List tax classes',
      inputSchema: {
        type: 'object',
        properties: {},
      },
      handler: async (_args) =>
        withErrorHandling(async () => {
          const client = getClient();
          const { data } = await client.get('taxes/classes', {});
          return {
            content: [{ type: 'text', text: JSON.stringify({ tax_classes: data }, null, 2) }],
          };
        }),
    },
    {
      name: 'taxes_classes_create',
      description: 'Create a tax class',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Tax class name' },
        },
        required: ['name'],
      },
      handler: async (args) => {
        if (isReadOnly()) return readOnlyError();
        return withErrorHandling(async () => {
          const v = validateArgs(z.object({ name: z.string().min(1) }), args);
          const client = getClient();
          const { data } = await client.post('taxes/classes', v);
          return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        });
      },
    },
    {
      name: 'taxes_classes_delete',
      description: 'Delete a tax class by slug',
      inputSchema: {
        type: 'object',
        properties: {
          slug: { type: 'string', description: 'Tax class slug' },
        },
        required: ['slug'],
      },
      handler: async (args) => {
        if (isReadOnly()) return readOnlyError();
        return withErrorHandling(async () => {
          const v = validateArgs(z.object({ slug: z.string().min(1) }), args);
          const client = getClient();
          const { data } = await client.delete(`taxes/classes/${v.slug}`, {});
          return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        });
      },
    },

    // ── Tax Rates ──
    {
      name: 'taxes_rates_list',
      description: 'List tax rates with optional filtering',
      inputSchema: {
        type: 'object',
        properties: {
          page: { type: 'integer', description: 'Page number' },
          per_page: { type: 'integer', description: 'Items per page (max 100)', default: 10 },
          class: { type: 'string', description: 'Tax class slug' },
          orderby: { type: 'string', enum: ['id', 'order', 'name'], description: 'Sort field' },
          order: { type: 'string', enum: ['asc', 'desc'], description: 'Sort direction' },
        },
      },
      handler: async (args) =>
        withErrorHandling(async () => {
          const client = getClient();
          const v = validateArgs(
            z.object({
              page: z.number().int().optional(),
              per_page: z.number().int().optional(),
              class: z.string().optional(),
              orderby: z.enum(['id', 'order', 'name']).optional(),
              order: z.enum(['asc', 'desc']).optional(),
            }),
            args,
          );
          const params: Record<string, unknown> = { ...v };
          const { data, headers } = await client.get('taxes/rates', params);
          const pagination = extractPagination(headers);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  { tax_rates: data, total: pagination.total, totalPages: pagination.totalPages },
                  null,
                  2,
                ),
              },
            ],
          };
        }),
    },
    {
      name: 'taxes_rates_get',
      description: 'Get a single tax rate by ID',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'Tax rate ID' },
        },
        required: ['id'],
      },
      handler: async (args) =>
        withErrorHandling(async () => {
          const v = validateArgs(z.object({ id: z.number().int().positive() }), args);
          const client = getClient();
          const { data } = await client.get(`taxes/rates/${v.id}`, {});
          return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        }),
    },
    {
      name: 'taxes_rates_create',
      description: 'Create a tax rate',
      inputSchema: {
        type: 'object',
        properties: {
          country: { type: 'string', description: 'Country code (ISO 3166-1 alpha-2)' },
          state: { type: 'string', description: 'State code' },
          postcode: { type: 'string', description: 'Postcode / ZIP' },
          city: { type: 'string', description: 'City name' },
          rate: { type: 'string', description: 'Tax rate percentage' },
          name: { type: 'string', description: 'Tax rate name' },
          priority: { type: 'integer', description: 'Tax priority (1-based)' },
          compound: { type: 'boolean', description: 'Whether tax is compound' },
          shipping: { type: 'boolean', description: 'Whether tax applies to shipping' },
          class: { type: 'string', description: 'Tax class slug' },
          postcodes: { type: 'array', items: { type: 'string' }, description: 'Postcodes / ZIPs' },
          cities: { type: 'array', items: { type: 'string' }, description: 'City names' },
        },
        required: ['country', 'rate', 'name'],
      },
      handler: async (args) => {
        if (isReadOnly()) return readOnlyError();
        return withErrorHandling(async () => {
          const v = validateArgs(
            z.object({
              country: z.string().min(1),
              rate: z.string().min(1),
              name: z.string().min(1),
              state: z.string().optional(),
              postcode: z.string().optional(),
              city: z.string().optional(),
              priority: z.number().int().optional(),
              compound: z.boolean().optional(),
              shipping: z.boolean().optional(),
              class: z.string().optional(),
              postcodes: z.array(z.string()).optional(),
              cities: z.array(z.string()).optional(),
            }),
            args,
          );
          const client = getClient();
          const { data } = await client.post('taxes/rates', v);
          return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        });
      },
    },
    {
      name: 'taxes_rates_update',
      description: 'Update a tax rate',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'Tax rate ID' },
          country: { type: 'string', description: 'Country code (ISO 3166-1 alpha-2)' },
          state: { type: 'string', description: 'State code' },
          postcode: { type: 'string', description: 'Postcode / ZIP' },
          city: { type: 'string', description: 'City name' },
          rate: { type: 'string', description: 'Tax rate percentage' },
          name: { type: 'string', description: 'Tax rate name' },
          priority: { type: 'integer', description: 'Tax priority (1-based)' },
          compound: { type: 'boolean', description: 'Whether tax is compound' },
          shipping: { type: 'boolean', description: 'Whether tax applies to shipping' },
          class: { type: 'string', description: 'Tax class slug' },
          postcodes: { type: 'array', items: { type: 'string' }, description: 'Postcodes / ZIPs' },
          cities: { type: 'array', items: { type: 'string' }, description: 'City names' },
        },
        required: ['id'],
      },
      handler: async (args) => {
        if (isReadOnly()) return readOnlyError();
        return withErrorHandling(async () => {
          const v = validateArgs(
            z.object({
              id: z.number().int().positive(),
              country: z.string().optional(),
              state: z.string().optional(),
              postcode: z.string().optional(),
              city: z.string().optional(),
              rate: z.string().optional(),
              name: z.string().optional(),
              priority: z.number().int().optional(),
              compound: z.boolean().optional(),
              shipping: z.boolean().optional(),
              class: z.string().optional(),
              postcodes: z.array(z.string()).optional(),
              cities: z.array(z.string()).optional(),
            }),
            args,
          );
          const client = getClient();
          const { id, ...data } = v;
          const { data: result } = await client.put(`taxes/rates/${id}`, data);
          return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
        });
      },
    },
    {
      name: 'taxes_rates_delete',
      description: 'Delete a tax rate',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'Tax rate ID' },
        },
        required: ['id'],
      },
      handler: async (args) => {
        if (isReadOnly()) return readOnlyError();
        return withErrorHandling(async () => {
          const v = validateArgs(z.object({ id: z.number().int().positive() }), args);
          const client = getClient();
          const { data } = await client.delete(`taxes/rates/${v.id}`, {});
          return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        });
      },
    },
  ],
});
