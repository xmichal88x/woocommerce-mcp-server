import { z } from 'zod';
import { registerGroup } from '../groups.js';
import { getClient } from '../client.js';
import { validateArgs, withErrorHandling, assertWriteAccess } from '../utils.js';

registerGroup({
  name: 'shipping',
  tools: [
    // ── Shipping Zones CRUD ──
    {
      name: 'shipping_zones_list',
      description: 'List shipping zones',
      inputSchema: {
        type: 'object',
        properties: {},
      },
      handler: async (_args) =>
        withErrorHandling(async () => {
          const client = getClient();
          const { data } = await client.get('shipping/zones', {});
          return { content: [{ type: 'text', text: JSON.stringify({ zones: data }, null, 2) }] };
        }),
    },
    {
      name: 'shipping_zones_get',
      description: 'Get a single shipping zone by ID',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'Shipping zone ID' },
        },
        required: ['id'],
      },
      handler: async (args) =>
        withErrorHandling(async () => {
          const v = validateArgs(z.object({ id: z.number().int().positive() }), args);
          const client = getClient();
          const { data } = await client.get(`shipping/zones/${v.id}`, {});
          return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        }),
    },
    {
      name: 'shipping_zones_create',
      description: 'Create a shipping zone',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Shipping zone name' },
          order: { type: 'integer', description: 'Zone order (lower first)' },
        },
        required: ['name'],
      },
      handler: async (args) =>
        withErrorHandling(async () => {
          assertWriteAccess();
          const v = validateArgs(
            z.object({
              name: z.string().min(1),
              order: z.number().int().optional(),
            }),
            args,
          );
          const client = getClient();
          const { data } = await client.post('shipping/zones', v);
          return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        }),
    },
    {
      name: 'shipping_zones_update',
      description: 'Update a shipping zone',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'Shipping zone ID' },
          name: { type: 'string', description: 'Shipping zone name' },
          order: { type: 'integer', description: 'Zone order (lower first)' },
        },
        required: ['id'],
      },
      handler: async (args) =>
        withErrorHandling(async () => {
          assertWriteAccess();
          const v = validateArgs(
            z.object({
              id: z.number().int().positive(),
              name: z.string().min(1).optional(),
              order: z.number().int().optional(),
            }),
            args,
          );
          const client = getClient();
          const { id, ...data } = v;
          const { data: result } = await client.put(`shipping/zones/${id}`, data);
          return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
        }),
    },
    {
      name: 'shipping_zones_delete',
      description: 'Delete a shipping zone',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'Shipping zone ID' },
        },
        required: ['id'],
      },
      handler: async (args) =>
        withErrorHandling(async () => {
          assertWriteAccess();
          const v = validateArgs(z.object({ id: z.number().int().positive() }), args);
          const client = getClient();
          const { data } = await client.delete(`shipping/zones/${v.id}`, {});
          return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        }),
    },

    // ── Shipping Zone Methods ──
    {
      name: 'shipping_zone_methods_list',
      description: 'List shipping methods for a zone',
      inputSchema: {
        type: 'object',
        properties: {
          zone_id: { type: 'integer', description: 'Shipping zone ID' },
        },
        required: ['zone_id'],
      },
      handler: async (args) =>
        withErrorHandling(async () => {
          const v = validateArgs(z.object({ zone_id: z.number().int().positive() }), args);
          const client = getClient();
          const { zone_id } = v;
          const { data } = await client.get(`shipping/zones/${zone_id}/methods`, {});
          return { content: [{ type: 'text', text: JSON.stringify({ methods: data }, null, 2) }] };
        }),
    },
    {
      name: 'shipping_zone_methods_get',
      description: 'Get a single shipping zone method',
      inputSchema: {
        type: 'object',
        properties: {
          zone_id: { type: 'integer', description: 'Shipping zone ID' },
          method_id: { type: 'integer', description: 'Shipping method instance ID' },
        },
        required: ['zone_id', 'method_id'],
      },
      handler: async (args) =>
        withErrorHandling(async () => {
          const v = validateArgs(
            z.object({
              zone_id: z.number().int().positive(),
              method_id: z.number().int().positive(),
            }),
            args,
          );
          const client = getClient();
          const { data } = await client.get(
            `shipping/zones/${v.zone_id}/methods/${v.method_id}`,
            {},
          );
          return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        }),
    },
    {
      name: 'shipping_zone_methods_create',
      description: 'Add a shipping method to a zone',
      inputSchema: {
        type: 'object',
        properties: {
          zone_id: { type: 'integer', description: 'Shipping zone ID' },
          method_id: {
            type: 'string',
            description: 'Shipping method type (e.g. free_shipping, flat_rate, local_pickup)',
          },
          title: { type: 'string', description: 'Method title' },
          order: { type: 'integer', description: 'Method order (lower first)' },
          enabled: { type: 'boolean', description: 'Enable the method', default: true },
          settings: { type: 'object', description: 'Method settings (varies by method type)' },
        },
        required: ['zone_id', 'method_id'],
      },
      handler: async (args) =>
        withErrorHandling(async () => {
          assertWriteAccess();
          const v = validateArgs(
            z.object({
              zone_id: z.number().int().positive(),
              method_id: z.string().min(1),
              title: z.string().optional(),
              order: z.number().int().optional(),
              enabled: z.boolean().optional(),
              settings: z.record(z.unknown()).optional(),
            }),
            args,
          );
          const client = getClient();
          const { zone_id, ...data } = v;
          const { data: result } = await client.post(`shipping/zones/${zone_id}/methods`, data);
          return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
        }),
    },
    {
      name: 'shipping_zone_methods_update',
      description: 'Update a shipping zone method',
      inputSchema: {
        type: 'object',
        properties: {
          zone_id: { type: 'integer', description: 'Shipping zone ID' },
          method_id: { type: 'integer', description: 'Shipping method instance ID' },
          title: { type: 'string', description: 'Method title' },
          order: { type: 'integer', description: 'Method order (lower first)' },
          enabled: { type: 'boolean', description: 'Enable the method' },
          settings: { type: 'object', description: 'Method settings (varies by method type)' },
        },
        required: ['zone_id', 'method_id'],
      },
      handler: async (args) =>
        withErrorHandling(async () => {
          assertWriteAccess();
          const v = validateArgs(
            z.object({
              zone_id: z.number().int().positive(),
              method_id: z.number().int().positive(),
              title: z.string().optional(),
              order: z.number().int().optional(),
              enabled: z.boolean().optional(),
              settings: z.record(z.unknown()).optional(),
            }),
            args,
          );
          const client = getClient();
          const { zone_id, method_id, ...data } = v;
          const { data: result } = await client.put(
            `shipping/zones/${zone_id}/methods/${method_id}`,
            data,
          );
          return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
        }),
    },
    {
      name: 'shipping_zone_methods_delete',
      description: 'Delete a shipping zone method',
      inputSchema: {
        type: 'object',
        properties: {
          zone_id: { type: 'integer', description: 'Shipping zone ID' },
          method_id: { type: 'integer', description: 'Shipping method instance ID' },
        },
        required: ['zone_id', 'method_id'],
      },
      handler: async (args) =>
        withErrorHandling(async () => {
          assertWriteAccess();
          const v = validateArgs(
            z.object({
              zone_id: z.number().int().positive(),
              method_id: z.number().int().positive(),
            }),
            args,
          );
          const client = getClient();
          const { data } = await client.delete(
            `shipping/zones/${v.zone_id}/methods/${v.method_id}`,
            {},
          );
          return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        }),
    },

    // ── Shipping Zone Locations ──
    {
      name: 'shipping_zone_locations_list',
      description: 'List locations for a shipping zone',
      inputSchema: {
        type: 'object',
        properties: {
          zone_id: { type: 'integer', description: 'Shipping zone ID' },
        },
        required: ['zone_id'],
      },
      handler: async (args) =>
        withErrorHandling(async () => {
          const v = validateArgs(z.object({ zone_id: z.number().int().positive() }), args);
          const client = getClient();
          const { zone_id } = v;
          const { data } = await client.get(`shipping/zones/${zone_id}/locations`, {});
          return {
            content: [{ type: 'text', text: JSON.stringify({ locations: data }, null, 2) }],
          };
        }),
    },
  ],
});
