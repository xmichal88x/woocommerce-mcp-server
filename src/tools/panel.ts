import { z } from 'zod';
import { registerGroup } from '../groups.js';
import { isReadOnly } from '../client.js';
import { pluginGet, pluginPost, pluginPut, pluginDelete } from '../plugin-client.js';
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
              limit: z.number().int().min(1).max(100).optional(),
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
          const data = await pluginGet(`order-csv-status/${v.order_id}`);
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
    {
      name: 'admin_reviews_list',
      description: 'List product reviews (admin)',
      inputSchema: {
        type: 'object',
        properties: {
          status: { type: 'string', description: 'Filter by status: all/approved/hold/spam/trash' },
          product_id: { type: 'integer', description: 'Filter by product ID' },
          page: { type: 'integer', description: 'Page number' },
          per_page: { type: 'integer', description: 'Items per page (1-100)' },
          search: { type: 'string', description: 'Search term' },
        },
      },
      handler: async (args) =>
        withErrorHandling(async () => {
          const v = validateArgs(
            z.object({
              status: z.enum(['all', 'approved', 'hold', 'spam', 'trash']).optional(),
              product_id: z.number().int().positive().optional(),
              page: z.number().int().optional(),
              per_page: z.number().int().min(1).max(100).optional(),
              search: z.string().optional(),
            }),
            args,
          );
          const data = await pluginGet('admin/products-reviews', v);
          return { content: [{ type: 'text', text: JSON.stringify(data.data, null, 2) }] };
        }),
    },
    {
      name: 'admin_review_moderate',
      description: 'Moderate a product review (approve/hold/spam/trash)',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'Review ID' },
          status: { type: 'string', description: 'New status: approved/hold/spam/trash' },
        },
        required: ['id', 'status'],
      },
      handler: async (args) => {
        if (isReadOnly()) return readOnlyError();
        return withErrorHandling(async () => {
          const v = validateArgs(
            z.object({
              id: z.number().int().positive(),
              status: z.enum(['approved', 'hold', 'spam', 'trash']),
            }),
            args,
          );
          const data = await pluginPost(`admin/products-reviews/${v.id}/moderate`, {
            status: v.status,
          });
          return { content: [{ type: 'text', text: JSON.stringify(data.data, null, 2) }] };
        });
      },
    },
    {
      name: 'admin_questions_list',
      description: 'List product questions (admin)',
      inputSchema: {
        type: 'object',
        properties: {
          status: { type: 'string', description: 'Filter by status' },
          product_id: { type: 'integer', description: 'Filter by product ID' },
          page: { type: 'integer', description: 'Page number' },
          per_page: { type: 'integer', description: 'Items per page (1-100)' },
          search: { type: 'string', description: 'Search term' },
        },
      },
      handler: async (args) =>
        withErrorHandling(async () => {
          const v = validateArgs(
            z.object({
              status: z.string().optional(),
              product_id: z.number().int().positive().optional(),
              page: z.number().int().optional(),
              per_page: z.number().int().min(1).max(100).optional(),
              search: z.string().optional(),
            }),
            args,
          );
          const data = await pluginGet('admin/products-questions', v);
          return { content: [{ type: 'text', text: JSON.stringify(data.data, null, 2) }] };
        }),
    },
    {
      name: 'admin_question_answer',
      description: 'Answer a product question (admin)',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'Question ID' },
          content: {
            type: 'string',
            description: 'Answer content (min 10 characters)',
            minLength: 10,
          },
        },
        required: ['id', 'content'],
      },
      handler: async (args) => {
        if (isReadOnly()) return readOnlyError();
        return withErrorHandling(async () => {
          const v = validateArgs(
            z.object({
              id: z.number().int().positive(),
              content: z.string().min(10),
            }),
            args,
          );
          const data = await pluginPost(`admin/products-questions/${v.id}/answer`, {
            content: v.content,
          });
          return { content: [{ type: 'text', text: JSON.stringify(data.data, null, 2) }] };
        });
      },
    },
    {
      name: 'admin_faq_create',
      description: 'Create a new FAQ entry (admin)',
      inputSchema: {
        type: 'object',
        properties: {
          question: { type: 'string', description: 'FAQ question' },
          answer: { type: 'string', description: 'FAQ answer' },
          product_id: { type: 'integer', description: 'Associated product ID' },
          category: { type: 'string', description: 'FAQ category' },
          order: { type: 'integer', description: 'Display order' },
        },
        required: ['question', 'answer'],
      },
      handler: async (args) => {
        if (isReadOnly()) return readOnlyError();
        return withErrorHandling(async () => {
          const v = validateArgs(
            z.object({
              question: z.string().min(1),
              answer: z.string().min(1),
              product_id: z.number().int().positive().optional(),
              category: z.string().optional(),
              order: z.number().int().optional(),
            }),
            args,
          );
          const data = await pluginPost('admin/faq', v);
          return { content: [{ type: 'text', text: JSON.stringify(data.data, null, 2) }] };
        });
      },
    },
    {
      name: 'admin_faq_update',
      description: 'Update an existing FAQ entry (admin)',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'FAQ ID' },
          question: { type: 'string', description: 'FAQ question' },
          answer: { type: 'string', description: 'FAQ answer' },
          product_id: { type: 'integer', description: 'Associated product ID' },
          category: { type: 'string', description: 'FAQ category' },
          order: { type: 'integer', description: 'Display order' },
        },
        required: ['id'],
      },
      handler: async (args) => {
        if (isReadOnly()) return readOnlyError();
        return withErrorHandling(async () => {
          const v = validateArgs(
            z.object({
              id: z.number().int().positive(),
              question: z.string().min(1).optional(),
              answer: z.string().min(1).optional(),
              product_id: z.number().int().positive().optional(),
              category: z.string().optional(),
              order: z.number().int().optional(),
            }),
            args,
          );
          const { id, ...body } = v;
          const data = await pluginPut(`admin/faq/${id}`, body);
          return { content: [{ type: 'text', text: JSON.stringify(data.data, null, 2) }] };
        });
      },
    },
    {
      name: 'admin_faq_delete',
      description: 'Delete a FAQ entry (admin)',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'FAQ ID' },
        },
        required: ['id'],
      },
      handler: async (args) => {
        if (isReadOnly()) return readOnlyError();
        return withErrorHandling(async () => {
          const v = validateArgs(
            z.object({
              id: z.number().int().positive(),
            }),
            args,
          );
          const data = await pluginDelete(`admin/faq/${v.id}`);
          return { content: [{ type: 'text', text: JSON.stringify(data.data, null, 2) }] };
        });
      },
    },
    {
      name: 'admin_popularity_settings_get',
      description: 'Get popularity score calculation settings',
      inputSchema: {
        type: 'object',
        properties: {},
      },
      handler: async (_args: Record<string, unknown>) =>
        withErrorHandling(async () => {
          const data = await pluginGet('admin/popularity-settings');
          return { content: [{ type: 'text', text: JSON.stringify(data.data, null, 2) }] };
        }),
    },
    {
      name: 'admin_popularity_settings_update',
      description: 'Update popularity score calculation settings',
      inputSchema: {
        type: 'object',
        properties: {
          sales_weight: { type: 'number', description: 'Sales weight (0-10)' },
          rating_weight: { type: 'number', description: 'Rating weight (0-20)' },
          review_weight: { type: 'number', description: 'Review weight (0-5)' },
          cache_ttl: { type: 'integer', description: 'Cache TTL in minutes (0-1440)' },
        },
      },
      handler: async (args) => {
        if (isReadOnly()) return readOnlyError();
        return withErrorHandling(async () => {
          const v = validateArgs(
            z.object({
              sales_weight: z.number().min(0).max(10).optional(),
              rating_weight: z.number().min(0).max(20).optional(),
              review_weight: z.number().min(0).max(5).optional(),
              cache_ttl: z.number().int().min(0).max(1440).optional(),
            }),
            args,
          );
          const data = await pluginPut('admin/popularity-settings', v);
          return { content: [{ type: 'text', text: JSON.stringify(data.data, null, 2) }] };
        });
      },
    },
  ],
});
