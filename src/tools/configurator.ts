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
      name: 'edge_types_list',
      description: 'List all edge type profiles with labels',
      inputSchema: {
        type: 'object',
        properties: {},
      },
      handler: async (_args) =>
        withErrorHandling(async () => {
          const data = await pluginGet('edge-types');
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
        'Update configurator parameters for a panel product. Sets frontend name, price per m2, parameter schema, CSV config, default tool and available tools.',
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
                frontend_visible: {
                  type: 'boolean',
                  description: 'Show parameter in frontend configurator',
                },
                options: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Options as strings (e.g. ["1 - Z projektu", "2 - Profil 2"])',
                },
                unit: { type: 'string', description: 'Unit (e.g. "mm")' },
              },
              required: ['id', 'label', 'type'],
            },
            description: 'Configurator parameter definitions',
          },
          csv_structure: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  description: 'Column identifier (e.g. "width_mm", "height_mm", "sku")',
                },
                group_nested: {
                  type: 'string',
                  description:
                    'Comma-separated child param IDs for container/group columns (e.g. "edge_type,groove_depth,groove_spacing")',
                },
              },
              required: ['id'],
            },
            description:
              'CSV column structure for production file (AlphaCAM). Simple: {"id":"width_mm"}. Container: {"id":"edge_params","group_nested":"edge_type,groove_depth"}',
          },
          csv_separator: {
            type: 'string',
            description: 'CSV separator character (e.g. ",")',
          },
          csv_group_separator: {
            type: 'string',
            description: 'CSV group separator character (e.g. ";")',
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
                price_per_m2: z
                  .string()
                  .regex(/^\d+([.,]\d{1,2})?$/)
                  .optional(),
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
                      frontend_visible: z.boolean().optional(),
                      options: z.array(z.string()).optional(),
                      unit: z.string().optional(),
                    }),
                  )
                  .optional(),
                csv_structure: z
                  .array(
                    z.object({
                      id: z.string().min(1),
                      group_nested: z.string().optional(),
                    }),
                  )
                  .optional(),
                csv_separator: z.string().optional(),
                csv_group_separator: z.string().optional(),
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
                  { key: string; value: unknown }[] | undefined
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

            const needsEdgeOptions = v.configurator_params.some(
              (p) => p.id === 'edge_type' && p.options === undefined,
            );
            if (needsEdgeOptions) {
              const edgeTypeIdx = mergedParams.findIndex((p) => p.id === 'edge_type');
              if (edgeTypeIdx !== -1) {
                try {
                  const edgeData = await pluginGet('edge-types');
                  const edgeTypes = (edgeData.data ?? {}) as Record<string, string>;
                  mergedParams[edgeTypeIdx].options = Object.entries(edgeTypes).map(
                    ([key, label]) => `${key} - ${label}`,
                  );
                } catch {
                  // Plugin endpoint not available yet — skip auto-population
                }
              }
            }

            meta_data.push({
              key: '_pcb_configurator_params',
              value: JSON.stringify(mergedParams),
            });
          }
          if (v.csv_structure !== undefined)
            meta_data.push({ key: '_pcb_csv_structure', value: v.csv_structure });
          if (v.csv_separator !== undefined)
            meta_data.push({ key: '_pcb_csv_separator', value: v.csv_separator });
          if (v.csv_group_separator !== undefined)
            meta_data.push({ key: '_pcb_csv_group_separator', value: v.csv_group_separator });
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
