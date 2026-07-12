import { z } from 'zod';
import { registerGroup } from '../groups.js';
import { isReadOnly } from '../client.js';
import { pluginGet, pluginPost } from '../plugin-client.js';
import { readOnlyError, validateArgs, withErrorHandling } from '../utils.js';

registerGroup({
  name: 'panel',
  tools: [
    {
      name: 'products_lite_list',
      description: 'List products with minimal data (lightweight)',
      inputSchema: {
        type: 'object',
        properties: {
          limit: { type: 'integer', description: 'Number of products to return' },
          page: { type: 'integer', description: 'Page number' },
        },
      },
      handler: async (args) =>
        withErrorHandling(async () => {
          const v = validateArgs(
            z.object({
              limit: z.number().int().optional(),
              page: z.number().int().optional(),
            }),
            args,
          );
          const data = await pluginGet('products-lite', v);
          return { content: [{ type: 'text', text: JSON.stringify(data.data, null, 2) }] };
        }),
    },
    {
      name: 'products_popular_get',
      description: 'Get popular/featured products with popularity scores',
      inputSchema: {
        type: 'object',
        properties: {
          per_page: { type: 'integer', description: 'Items per page (1-50)' },
        },
      },
      handler: async (args) =>
        withErrorHandling(async () => {
          const v = validateArgs(
            z.object({
              per_page: z.number().int().min(1).max(50).optional(),
            }),
            args,
          );
          const data = await pluginGet('products-popular', v);
          return { content: [{ type: 'text', text: JSON.stringify(data.data, null, 2) }] };
        }),
    },
    {
      name: 'answers_mark_best',
      description: 'Mark an answer as best answer for a question',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'Answer ID' },
          is_best: { type: 'boolean', description: 'Mark as best answer' },
        },
        required: ['id', 'is_best'],
      },
      handler: async (args) => {
        if (isReadOnly()) return readOnlyError();
        return withErrorHandling(async () => {
          const v = validateArgs(
            z.object({
              id: z.number().int().positive(),
              is_best: z.boolean(),
            }),
            args,
          );
          const data = await pluginPost(`answers/${v.id}/best`, { is_best: v.is_best });
          return { content: [{ type: 'text', text: JSON.stringify(data.data, null, 2) }] };
        });
      },
    },
    {
      name: 'faq_list',
      description: 'List FAQ entries for a product',
      inputSchema: {
        type: 'object',
        properties: {
          product_id: { type: 'integer', description: 'Product ID' },
          category: { type: 'string', description: 'FAQ category filter' },
        },
        required: ['product_id'],
      },
      handler: async (args) =>
        withErrorHandling(async () => {
          const v = validateArgs(
            z.object({
              product_id: z.number().int().positive(),
              category: z.string().optional(),
            }),
            args,
          );
          const { product_id, ...params } = v;
          const data = await pluginGet(`products/${product_id}/faq`, params);
          return { content: [{ type: 'text', text: JSON.stringify(data.data, null, 2) }] };
        }),
    },
    {
      name: 'faq_categories_list',
      description: 'List FAQ categories',
      inputSchema: {
        type: 'object',
        properties: {},
      },
      handler: async (_args: Record<string, unknown>) =>
        withErrorHandling(async () => {
          const data = await pluginGet('faq-categories');
          return { content: [{ type: 'text', text: JSON.stringify(data.data, null, 2) }] };
        }),
    },
    {
      name: 'production_csv_status_get',
      description: 'Get CSV production file generation status for an order',
      inputSchema: {
        type: 'object',
        properties: {
          order_id: { type: 'integer', description: 'Order ID' },
        },
        required: ['order_id'],
      },
      handler: async (args) =>
        withErrorHandling(async () => {
          const v = validateArgs(z.object({ order_id: z.number().int().positive() }), args);
          const data = await pluginGet('order-csv-status', { order_id: v.order_id });
          return { content: [{ type: 'text', text: JSON.stringify(data.data, null, 2) }] };
        }),
    },
    {
      name: 'company_info_get',
      description: 'Get company information (name, address, NIP, email, phone)',
      inputSchema: {
        type: 'object',
        properties: {},
      },
      handler: async (_args: Record<string, unknown>) =>
        withErrorHandling(async () => {
          const data = await pluginGet('company');
          return { content: [{ type: 'text', text: JSON.stringify(data.data, null, 2) }] };
        }),
    },
    {
      name: 'features_get',
      description: 'Get feature flags (FAQ, QA, reviews enabled/disabled)',
      inputSchema: {
        type: 'object',
        properties: {},
      },
      handler: async (_args: Record<string, unknown>) =>
        withErrorHandling(async () => {
          const data = await pluginGet('features');
          return { content: [{ type: 'text', text: JSON.stringify(data.data, null, 2) }] };
        }),
    },
  ],
});
