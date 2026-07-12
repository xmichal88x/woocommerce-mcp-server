import { z } from 'zod';
import { registerGroup } from '../groups.js';
import { getClient, isReadOnly } from '../client.js';

import { makeListHandler, readOnlyError, validateArgs, withErrorHandling } from '../utils.js';

registerGroup({
  name: 'coupons',
  tools: [
    {
      name: 'coupons_list',
      description: 'List coupons with optional filtering',
      inputSchema: {
        type: 'object',
        properties: {
          page: { type: 'integer', description: 'Page number' },
          per_page: { type: 'integer', description: 'Items per page (max 100)', default: 10 },
          search: { type: 'string', description: 'Search term' },
          code: { type: 'string', description: 'Filter by coupon code' },
          exclude: { type: 'array', items: { type: 'integer' }, description: 'Exclude coupon IDs' },
          include: { type: 'array', items: { type: 'integer' }, description: 'Include coupon IDs' },
          after: { type: 'string', description: 'Filter by date after (ISO8601)' },
          before: { type: 'string', description: 'Filter by date before (ISO8601)' },
          orderby: {
            type: 'string',
            enum: ['date', 'id', 'code', 'amount', 'type'],
            description: 'Sort field',
          },
          order: { type: 'string', enum: ['asc', 'desc'], description: 'Sort direction' },
        },
      },
      handler: makeListHandler(
        'coupons',
        z.object({
          page: z.number().int().optional(),
          per_page: z.number().int().optional(),
          search: z.string().optional(),
          code: z.string().optional(),
          exclude: z.array(z.number().int()).optional(),
          include: z.array(z.number().int()).optional(),
          after: z.string().optional(),
          before: z.string().optional(),
          orderby: z.enum(['date', 'id', 'code', 'amount', 'type']).optional(),
          order: z.enum(['asc', 'desc']).optional(),
        }),
        'coupons',
      ),
    },
    {
      name: 'coupons_get',
      description: 'Get a single coupon by ID',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'Coupon ID' },
        },
        required: ['id'],
      },
      handler: async (args) =>
        withErrorHandling(async () => {
          const v = validateArgs(z.object({ id: z.number().int().positive() }), args);
          const client = getClient();
          const { data } = await client.get(`coupons/${v.id}`, {});
          return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        }),
    },
    {
      name: 'coupons_create',
      description: 'Create a new coupon',
      inputSchema: {
        type: 'object',
        properties: {
          code: { type: 'string', description: 'Coupon code' },
          discount_type: {
            type: 'string',
            enum: ['percent', 'fixed_cart', 'fixed_product'],
            description: 'Discount type',
            default: 'fixed_cart',
          },
          amount: { type: 'string', description: 'Coupon amount' },
          minimum_amount: { type: 'string', description: 'Minimum order amount' },
          maximum_amount: { type: 'string', description: 'Maximum order amount' },
          individual_use: { type: 'boolean', description: 'Individual use only' },
          exclude_sale_items: { type: 'boolean', description: 'Exclude sale items' },
          product_ids: {
            type: 'array',
            items: { type: 'integer' },
            description: 'Product IDs the coupon applies to',
          },
          excluded_product_ids: {
            type: 'array',
            items: { type: 'integer' },
            description: 'Excluded product IDs',
          },
          product_categories: {
            type: 'array',
            items: { type: 'integer' },
            description: 'Category IDs the coupon applies to',
          },
          excluded_product_categories: {
            type: 'array',
            items: { type: 'integer' },
            description: 'Excluded category IDs',
          },
          usage_limit: { type: 'integer', description: 'Usage limit per coupon' },
          usage_limit_per_user: { type: 'integer', description: 'Usage limit per user' },
          limit_usage_to_x_items: { type: 'integer', description: 'Limit usage to X items' },
          free_shipping: { type: 'boolean', description: 'Enable free shipping' },
          email_restrictions: {
            type: 'array',
            items: { type: 'string' },
            description: 'Email restrictions',
          },
          date_expires: { type: 'string', description: 'Expiry date (ISO8601)' },
          description: { type: 'string', description: 'Coupon description' },
          meta_data: {
            type: 'array',
            items: { type: 'object', properties: { key: { type: 'string' }, value: {} } },
            description: 'Meta data',
          },
        },
        required: ['code'],
      },
      handler: async (args) => {
        if (isReadOnly()) return readOnlyError();
        return withErrorHandling(async () => {
          const v = validateArgs(
            z.object({
              code: z.string().min(1),
              discount_type: z.enum(['percent', 'fixed_cart', 'fixed_product']).optional(),
              amount: z.string().optional(),
              minimum_amount: z.string().optional(),
              maximum_amount: z.string().optional(),
              individual_use: z.boolean().optional(),
              exclude_sale_items: z.boolean().optional(),
              product_ids: z.array(z.number().int()).optional(),
              excluded_product_ids: z.array(z.number().int()).optional(),
              product_categories: z.array(z.number().int()).optional(),
              excluded_product_categories: z.array(z.number().int()).optional(),
              usage_limit: z.number().int().optional(),
              usage_limit_per_user: z.number().int().optional(),
              limit_usage_to_x_items: z.number().int().optional(),
              free_shipping: z.boolean().optional(),
              email_restrictions: z.array(z.string()).optional(),
              date_expires: z.string().optional(),
              description: z.string().optional(),
              meta_data: z.array(z.object({ key: z.string(), value: z.unknown() })).optional(),
            }),
            args,
          );
          const client = getClient();
          const { data } = await client.post('coupons', v);
          return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        });
      },
    },
    {
      name: 'coupons_update',
      description: 'Update an existing coupon',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'Coupon ID' },
          code: { type: 'string', description: 'Coupon code' },
          discount_type: {
            type: 'string',
            enum: ['percent', 'fixed_cart', 'fixed_product'],
            description: 'Discount type',
          },
          amount: { type: 'string', description: 'Coupon amount' },
          minimum_amount: { type: 'string', description: 'Minimum order amount' },
          maximum_amount: { type: 'string', description: 'Maximum order amount' },
          individual_use: { type: 'boolean', description: 'Individual use only' },
          exclude_sale_items: { type: 'boolean', description: 'Exclude sale items' },
          product_ids: {
            type: 'array',
            items: { type: 'integer' },
            description: 'Product IDs the coupon applies to',
          },
          excluded_product_ids: {
            type: 'array',
            items: { type: 'integer' },
            description: 'Excluded product IDs',
          },
          product_categories: {
            type: 'array',
            items: { type: 'integer' },
            description: 'Category IDs the coupon applies to',
          },
          excluded_product_categories: {
            type: 'array',
            items: { type: 'integer' },
            description: 'Excluded category IDs',
          },
          usage_limit: { type: 'integer', description: 'Usage limit per coupon' },
          usage_limit_per_user: { type: 'integer', description: 'Usage limit per user' },
          limit_usage_to_x_items: { type: 'integer', description: 'Limit usage to X items' },
          free_shipping: { type: 'boolean', description: 'Enable free shipping' },
          email_restrictions: {
            type: 'array',
            items: { type: 'string' },
            description: 'Email restrictions',
          },
          date_expires: { type: 'string', description: 'Expiry date (ISO8601)' },
          description: { type: 'string', description: 'Coupon description' },
          meta_data: {
            type: 'array',
            items: { type: 'object', properties: { key: { type: 'string' }, value: {} } },
            description: 'Meta data',
          },
        },
        required: ['id'],
      },
      handler: async (args) => {
        if (isReadOnly()) return readOnlyError();
        return withErrorHandling(async () => {
          const v = validateArgs(
            z.object({
              id: z.number().int().positive(),
              code: z.string().min(1).optional(),
              discount_type: z.enum(['percent', 'fixed_cart', 'fixed_product']).optional(),
              amount: z.string().optional(),
              minimum_amount: z.string().optional(),
              maximum_amount: z.string().optional(),
              individual_use: z.boolean().optional(),
              exclude_sale_items: z.boolean().optional(),
              product_ids: z.array(z.number().int()).optional(),
              excluded_product_ids: z.array(z.number().int()).optional(),
              product_categories: z.array(z.number().int()).optional(),
              excluded_product_categories: z.array(z.number().int()).optional(),
              usage_limit: z.number().int().optional(),
              usage_limit_per_user: z.number().int().optional(),
              limit_usage_to_x_items: z.number().int().optional(),
              free_shipping: z.boolean().optional(),
              email_restrictions: z.array(z.string()).optional(),
              date_expires: z.string().optional(),
              description: z.string().optional(),
              meta_data: z.array(z.object({ key: z.string(), value: z.unknown() })).optional(),
            }),
            args,
          );
          const client = getClient();
          const { id, ...data } = v;
          const { data: result } = await client.put(`coupons/${id}`, data);
          return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
        });
      },
    },
    {
      name: 'coupons_delete',
      description: 'Delete a coupon',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'Coupon ID' },
          force: { type: 'boolean', description: 'Force delete (skip trash)', default: true },
        },
        required: ['id'],
      },
      handler: async (args) => {
        if (isReadOnly()) return readOnlyError();
        return withErrorHandling(async () => {
          const v = validateArgs(
            z.object({
              id: z.number().int().positive(),
              force: z.boolean().optional(),
            }),
            args,
          );
          const client = getClient();
          const params: Record<string, unknown> = {};
          if (v.force !== undefined) params.force = v.force;
          const { data } = await client.delete(`coupons/${v.id}`, params);
          return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        });
      },
    },
    {
      name: 'coupons_batch',
      description: 'Batch create, update, and delete coupons',
      inputSchema: {
        type: 'object',
        properties: {
          create: {
            type: 'array',
            items: { type: 'object' },
            description: 'Array of coupons to create',
          },
          update: {
            type: 'array',
            items: { type: 'object' },
            description: 'Array of coupons to update',
          },
          delete: {
            type: 'array',
            items: { type: 'integer' },
            description: 'Array of coupon IDs to delete',
          },
        },
      },
      handler: async (args) => {
        if (isReadOnly()) return readOnlyError();
        return withErrorHandling(async () => {
          const v = validateArgs(
            z.object({
              create: z.array(z.object({}).passthrough()).optional(),
              update: z.array(z.object({}).passthrough()).optional(),
              delete: z.array(z.number().int()).optional(),
            }),
            args,
          );
          const client = getClient();
          const { data } = await client.post('coupons/batch', v);
          return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        });
      },
    },
  ],
});
