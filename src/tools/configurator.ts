import { z } from 'zod';
import { registerGroup } from '../groups.js';
import { pluginGet } from '../plugin-client.js';
import { validateArgs, withErrorHandling } from '../utils.js';

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
      handler: async (_args: Record<string, unknown>) =>
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
      handler: async (_args: Record<string, unknown>) =>
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
      handler: async (_args: Record<string, unknown>) =>
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
      handler: async (_args: Record<string, unknown>) =>
        withErrorHandling(async () => {
          const data = await pluginGet('additional-services');
          return { content: [{ type: 'text', text: JSON.stringify(data.data, null, 2) }] };
        }),
    },
  ],
});
