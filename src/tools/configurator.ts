import { z } from 'zod';
import { registerGroup } from '../groups.js';
import { getClient } from '../client.js';
import { pluginGet } from '../plugin-client.js';
import { validateArgs, withErrorHandling, assertWriteAccess } from '../utils.js';

registerGroup({
  name: 'configurator',
  tools: [
    {
      name: 'product_schema_get',
      description: 'Get configurator schema for a product by SKU',
      inputSchema: {
        type: 'object',
        properties: {
          sku: { type: 'string', description: 'Product SKU' },
        },
        required: ['sku'],
      },
      handler: async (args) =>
        withErrorHandling(async () => {
          const v = validateArgs(z.object({ sku: z.string().min(1) }), args);
          const data = await pluginGet('product-schema', { sku: v.sku });
          return { content: [{ type: 'text', text: JSON.stringify(data.data, null, 2) }] };
        }),
    },
    {
      name: 'tools_list',
      description: 'List active CNC AlphaCAM tools',
      inputSchema: {
        type: 'object',
        properties: {},
      },
      handler: async (_args) =>
        withErrorHandling(async () => {
          const data = await pluginGet('tools');
          return { content: [{ type: 'text', text: JSON.stringify(data.data, null, 2) }] };
        }),
    },
    {
      name: 'edge_type_tools_list',
      description: 'List edge type to tool mappings',
      inputSchema: {
        type: 'object',
        properties: {},
      },
      handler: async (_args) =>
        withErrorHandling(async () => {
          const data = await pluginGet('edge-type-tools');
          return { content: [{ type: 'text', text: JSON.stringify(data.data, null, 2) }] };
        }),
    },
    {
      name: 'tool_lists_list',
      description: 'List named tool lists',
      inputSchema: {
        type: 'object',
        properties: {},
      },
      handler: async (_args) =>
        withErrorHandling(async () => {
          const data = await pluginGet('tool-lists');
          return { content: [{ type: 'text', text: JSON.stringify(data.data, null, 2) }] };
        }),
    },
    {
      name: 'additional_services_list',
      description: 'List additional services (finishing options)',
      inputSchema: {
        type: 'object',
        properties: {},
      },
      handler: async (_args) =>
        withErrorHandling(async () => {
          const data = await pluginGet('additional-services');
          return { content: [{ type: 'text', text: JSON.stringify(data.data, null, 2) }] };
        }),
    },
    {
      name: 'products_configurator_update',
      description:
        'Update configurator parameters for a panel product. Sets frontend name, price per m2, parameter schema, default tool and available tools.',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'Product ID' },
          frontend_name: {
            type: 'string',
            description: 'Display name in configurator (e.g. "Dąb 18mm")',
          },
          price_per_m2: {
            type: 'string',
            description: 'Price per square meter in PLN (e.g. "450")',
          },
          configurator_params: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', description: 'Parameter identifier (e.g. "width")' },
                label: { type: 'string', description: 'Display label (e.g. "Szerokość")' },
                type: {
                  type: 'string',
                  enum: ['range', 'select', 'number', 'text', 'checkbox'],
                  description: 'Parameter type',
                },
                min: { type: 'number', description: 'Minimum value (range/number)' },
                max: { type: 'number', description: 'Maximum value (range/number)' },
                step: { type: 'number', description: 'Step value (range)' },
                default: { description: 'Default value' },
                options: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: { value: {}, label: { type: 'string' } },
                  },
                  description: 'Options (for select type)',
                },
                unit: { type: 'string', description: 'Unit (e.g. "mm")' },
              },
              required: ['id', 'label', 'type'],
            },
            description: 'Configurator parameter definitions',
          },
          default_tool_id: { type: 'string', description: 'Default CNC tool ID' },
          available_tools: {
            type: 'array',
            items: { type: 'string' },
            description: 'Allowed tool IDs',
          },
        },
        required: ['id'],
      },
      handler: async (args) =>
        withErrorHandling(async () => {
          assertWriteAccess();
          const v = validateArgs(
            z
              .object({
                id: z.number().int().positive(),
                frontend_name: z.string().optional(),
                price_per_m2: z.string().optional(),
                configurator_params: z
                  .array(
                    z.object({
                      id: z.string().min(1),
                      label: z.string().min(1),
                      type: z.enum(['range', 'select', 'number', 'text', 'checkbox']),
                      min: z.number().optional(),
                      max: z.number().optional(),
                      step: z.number().optional(),
                      default: z.unknown().optional(),
                      options: z
                        .array(z.object({ value: z.unknown(), label: z.string() }))
                        .optional(),
                      unit: z.string().optional(),
                    }),
                  )
                  .optional(),
                default_tool_id: z.string().optional(),
                available_tools: z.array(z.string()).optional(),
              })
              .strict(),
            args,
          );

          const client = getClient();

          const meta_data: { key: string; value: unknown }[] = [];
          if (v.frontend_name !== undefined)
            meta_data.push({ key: '_pcb_frontend_name', value: v.frontend_name });
          if (v.price_per_m2 !== undefined)
            meta_data.push({ key: '_price_per_m2', value: v.price_per_m2 });
          if (v.configurator_params !== undefined) {
            const existing = await client.get(`products/${v.id}`, {
              _fields: 'meta_data',
            });
            const existingRaw =
              (
                (existing.data as Record<string, unknown>).meta_data as
                  | { key: string; value: unknown }[]
                  | undefined
              )?.find((m) => m.key === '_pcb_configurator_params')?.value ?? '[]';
            const existingParams: Record<string, unknown>[] =
              typeof existingRaw === 'string' ? JSON.parse(existingRaw) : existingRaw;
            const mergedParams = [...existingParams];
            for (const incoming of v.configurator_params) {
              const idx = mergedParams.findIndex((p) => p.id === incoming.id);
              if (idx !== -1) {
                mergedParams[idx] = { ...mergedParams[idx], ...incoming };
              } else {
                mergedParams.push(incoming);
              }
            }
            meta_data.push({
              key: '_pcb_configurator_params',
              value: JSON.stringify(mergedParams),
            });
          }
          if (v.default_tool_id !== undefined)
            meta_data.push({ key: '_pcb_default_tool_id', value: v.default_tool_id });
          if (v.available_tools !== undefined)
            meta_data.push({ key: '_pcb_available_tools', value: v.available_tools });

          const { data } = await client.put(`products/${v.id}`, { meta_data });
          return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        }),
    },
  ],
});
