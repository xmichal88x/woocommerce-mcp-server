import { z } from 'zod';
import { validateArgs, withErrorHandling } from '../utils.js';
import { registerGroup } from '../groups.js';
import { getClient } from '../client.js';

registerGroup({
  name: 'reports',
  tools: [
    {
      name: 'reports_sales',
      description: 'Get sales report summary',
      inputSchema: {
        type: 'object',
        properties: {
          date_min: { type: 'string', description: 'Start date (YYYY-MM-DD)' },
          date_max: { type: 'string', description: 'End date (YYYY-MM-DD)' },
          period: {
            type: 'string',
            enum: ['year', 'last_month', 'this_month', 'last_week', 'this_week', '7day', '30day'],
            description: 'Report period',
          },
          date_context: {
            type: 'string',
            description: 'Date context for comparison (e.g. before/during)',
          },
        },
      },
      handler: async (args) =>
        withErrorHandling(async () => {
          const client = getClient();
          const v = validateArgs(
            z.object({
              date_min: z.string().optional(),
              date_max: z.string().optional(),
              period: z
                .enum([
                  'year',
                  'last_month',
                  'this_month',
                  'last_week',
                  'this_week',
                  '7day',
                  '30day',
                ])
                .optional(),
              date_context: z.string().optional(),
            }),
            args,
          );
          const params: Record<string, unknown> = { ...v };
          const { data } = await client.get('reports/sales', params);
          return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        }),
    },
    {
      name: 'reports_top_sellers',
      description: 'Get top selling products',
      inputSchema: {
        type: 'object',
        properties: {
          period: {
            type: 'string',
            enum: ['year', 'last_month', 'this_month', 'last_week', 'this_week', '7day', '30day'],
            description: 'Report period',
          },
          date_min: { type: 'string', description: 'Start date (YYYY-MM-DD)' },
          date_max: { type: 'string', description: 'End date (YYYY-MM-DD)' },
          limit: { type: 'integer', description: 'Maximum number of items to return', default: 10 },
        },
      },
      handler: async (args) =>
        withErrorHandling(async () => {
          const client = getClient();
          const v = validateArgs(
            z.object({
              period: z
                .enum([
                  'year',
                  'last_month',
                  'this_month',
                  'last_week',
                  'this_week',
                  '7day',
                  '30day',
                ])
                .optional(),
              date_min: z.string().optional(),
              date_max: z.string().optional(),
              limit: z.number().int().optional(),
            }),
            args,
          );
          const params: Record<string, unknown> = { ...v };
          const { data } = await client.get('reports/top_sellers', params);
          return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        }),
    },
    {
      name: 'reports_products',
      description: 'Get products report',
      inputSchema: {
        type: 'object',
        properties: {
          period: {
            type: 'string',
            enum: ['year', 'last_month', 'this_month', 'last_week', 'this_week', '7day', '30day'],
            description: 'Report period',
          },
          date_min: { type: 'string', description: 'Start date (YYYY-MM-DD)' },
          date_max: { type: 'string', description: 'End date (YYYY-MM-DD)' },
        },
      },
      handler: async (args) =>
        withErrorHandling(async () => {
          const client = getClient();
          const v = validateArgs(
            z.object({
              period: z
                .enum([
                  'year',
                  'last_month',
                  'this_month',
                  'last_week',
                  'this_week',
                  '7day',
                  '30day',
                ])
                .optional(),
              date_min: z.string().optional(),
              date_max: z.string().optional(),
            }),
            args,
          );
          const params: Record<string, unknown> = { ...v };
          const { data } = await client.get('reports/products', params);
          return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        }),
    },
    {
      name: 'reports_orders',
      description: 'Get orders report',
      inputSchema: {
        type: 'object',
        properties: {
          period: {
            type: 'string',
            enum: ['year', 'last_month', 'this_month', 'last_week', 'this_week', '7day', '30day'],
            description: 'Report period',
          },
          date_min: { type: 'string', description: 'Start date (YYYY-MM-DD)' },
          date_max: { type: 'string', description: 'End date (YYYY-MM-DD)' },
        },
      },
      handler: async (args) =>
        withErrorHandling(async () => {
          const client = getClient();
          const v = validateArgs(
            z.object({
              period: z
                .enum([
                  'year',
                  'last_month',
                  'this_month',
                  'last_week',
                  'this_week',
                  '7day',
                  '30day',
                ])
                .optional(),
              date_min: z.string().optional(),
              date_max: z.string().optional(),
            }),
            args,
          );
          const params: Record<string, unknown> = { ...v };
          const { data } = await client.get('reports/orders', params);
          return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        }),
    },
    {
      name: 'reports_customers',
      description: 'Get customers report',
      inputSchema: {
        type: 'object',
        properties: {
          period: {
            type: 'string',
            enum: ['year', 'last_month', 'this_month', 'last_week', 'this_week', '7day', '30day'],
            description: 'Report period',
          },
          date_min: { type: 'string', description: 'Start date (YYYY-MM-DD)' },
          date_max: { type: 'string', description: 'End date (YYYY-MM-DD)' },
        },
      },
      handler: async (args) =>
        withErrorHandling(async () => {
          const client = getClient();
          const v = validateArgs(
            z.object({
              period: z
                .enum([
                  'year',
                  'last_month',
                  'this_month',
                  'last_week',
                  'this_week',
                  '7day',
                  '30day',
                ])
                .optional(),
              date_min: z.string().optional(),
              date_max: z.string().optional(),
            }),
            args,
          );
          const params: Record<string, unknown> = { ...v };
          const { data } = await client.get('reports/customers', params);
          return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        }),
    },
    {
      name: 'reports_coupons',
      description: 'Get coupons report',
      inputSchema: {
        type: 'object',
        properties: {
          period: {
            type: 'string',
            enum: ['year', 'last_month', 'this_month', 'last_week', 'this_week', '7day', '30day'],
            description: 'Report period',
          },
          date_min: { type: 'string', description: 'Start date (YYYY-MM-DD)' },
          date_max: { type: 'string', description: 'End date (YYYY-MM-DD)' },
          coupon: {
            type: 'array',
            items: { type: 'string' },
            description: 'Coupon codes to filter by',
          },
        },
      },
      handler: async (args) =>
        withErrorHandling(async () => {
          const client = getClient();
          const v = validateArgs(
            z.object({
              period: z
                .enum([
                  'year',
                  'last_month',
                  'this_month',
                  'last_week',
                  'this_week',
                  '7day',
                  '30day',
                ])
                .optional(),
              date_min: z.string().optional(),
              date_max: z.string().optional(),
              coupon: z.array(z.string()).optional(),
            }),
            args,
          );
          const params: Record<string, unknown> = { ...v };
          const { data } = await client.get('reports/coupons', params);
          return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        }),
    },
    {
      name: 'reports_stock',
      description: 'Get stock report',
      inputSchema: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['all', 'low', 'outofstock', 'instock'],
            description: 'Stock type filter',
            default: 'all',
          },
        },
      },
      handler: async (args) =>
        withErrorHandling(async () => {
          const client = getClient();
          const v = validateArgs(
            z.object({
              type: z.enum(['all', 'low', 'outofstock', 'instock']).optional(),
            }),
            args,
          );
          const params: Record<string, unknown> = { ...v };
          const { data } = await client.get('reports/stock', params);
          return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        }),
    },
    {
      name: 'reports_revenue',
      description: 'Get revenue stats (total_sales, net_revenue, etc.)',
      inputSchema: {
        type: 'object',
        properties: {
          period: {
            type: 'string',
            enum: ['year', 'last_month', 'this_month', 'last_week', 'this_week', '7day', '30day'],
            description: 'Report period',
          },
          date_min: { type: 'string', description: 'Start date (YYYY-MM-DD)' },
          date_max: { type: 'string', description: 'End date (YYYY-MM-DD)' },
        },
      },
      handler: async (args) =>
        withErrorHandling(async () => {
          const client = getClient();
          const v = validateArgs(
            z.object({
              period: z
                .enum([
                  'year',
                  'last_month',
                  'this_month',
                  'last_week',
                  'this_week',
                  '7day',
                  '30day',
                ])
                .optional(),
              date_min: z.string().optional(),
              date_max: z.string().optional(),
            }),
            args,
          );
          const params: Record<string, unknown> = { ...v };
          const { data } = await client.get('reports/revenue/stats', params);
          return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        }),
    },
  ],
});
