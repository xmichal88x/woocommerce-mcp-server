import { z } from 'zod';
import { getClient } from '../client.js';
import { extractPagination } from '../types.js';
import { makeListHandler, validateArgs, withErrorHandling, assertWriteAccess } from '../utils.js';
import type { ToolDefinition } from '../groups.js';

export const miscTools: ToolDefinition[] = [
  // ── Product Variations ──
  {
    name: 'products_variations_list',
    description: 'List variations for a product',
    inputSchema: {
      type: 'object',
      properties: {
        product_id: { type: 'integer', description: 'Parent product ID' },
        page: { type: 'integer', description: 'Page number' },
        per_page: { type: 'integer', description: 'Items per page (max 100)', default: 10 },
      },
      required: ['product_id'],
    },
    handler: async (args) =>
      withErrorHandling(async () => {
        const v = validateArgs(
          z.object({
            product_id: z.number().int().positive(),
            page: z.number().int().optional(),
            per_page: z.number().int().optional(),
          }),
          args,
        );
        const client = getClient();
        const { product_id, ...params } = v;
        const { data, headers } = await client.get(`products/${product_id}/variations`, params);
        const pagination = extractPagination(headers);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { variations: data, total: pagination.total, totalPages: pagination.totalPages },
                null,
                2,
              ),
            },
          ],
        };
      }),
  },
  {
    name: 'products_variations_get',
    description: 'Get a single product variation',
    inputSchema: {
      type: 'object',
      properties: {
        product_id: { type: 'integer', description: 'Parent product ID' },
        variation_id: { type: 'integer', description: 'Variation ID' },
      },
      required: ['product_id', 'variation_id'],
    },
    handler: async (args) =>
      withErrorHandling(async () => {
        const v = validateArgs(
          z.object({
            product_id: z.number().int().positive(),
            variation_id: z.number().int().positive(),
          }),
          args,
        );
        const client = getClient();
        const { data } = await client.get(
          `products/${v.product_id}/variations/${v.variation_id}`,
          {},
        );
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      }),
  },
  {
    name: 'products_variations_create',
    description: 'Create a product variation',
    inputSchema: {
      type: 'object',
      properties: {
        product_id: { type: 'integer', description: 'Parent product ID' },
        regular_price: { type: 'string', description: 'Regular price' },
        sale_price: { type: 'string', description: 'Sale price' },
        sku: { type: 'string', description: 'Variation SKU' },
        stock_quantity: { type: 'integer', description: 'Stock quantity' },
        stock_status: {
          type: 'string',
          enum: ['instock', 'outofstock', 'onbackorder'],
          description: 'Stock status',
        },
        weight: { type: 'string', description: 'Variation weight' },
        dimensions: {
          type: 'object',
          properties: {
            length: { type: 'string' },
            width: { type: 'string' },
            height: { type: 'string' },
          },
          description: 'Variation dimensions',
        },
        attributes: {
          type: 'array',
          items: { type: 'object' },
          description: 'Variation attributes',
        },
        image: {
          type: 'object',
          properties: {
            src: { type: 'string' },
            alt: { type: 'string' },
            name: { type: 'string' },
          },
          description: 'Variation image',
        },
        meta_data: {
          type: 'array',
          items: { type: 'object', properties: { key: { type: 'string' }, value: {} } },
          description: 'Meta data',
        },
      },
      required: ['product_id'],
    },
    handler: async (args) =>
      withErrorHandling(async () => {
        assertWriteAccess();
        const v = validateArgs(
          z.object({
            product_id: z.number().int().positive(),
            regular_price: z.string().optional(),
            sale_price: z.string().optional(),
            sku: z.string().optional(),
            stock_quantity: z.number().int().optional(),
            stock_status: z.enum(['instock', 'outofstock', 'onbackorder']).optional(),
            weight: z.string().optional(),
            dimensions: z
              .object({
                length: z.string().optional(),
                width: z.string().optional(),
                height: z.string().optional(),
              })
              .optional(),
            attributes: z.array(z.object({}).passthrough()).optional(),
            image: z
              .object({
                src: z.string().optional(),
                alt: z.string().optional(),
                name: z.string().optional(),
              })
              .optional(),
            meta_data: z.array(z.object({ key: z.string(), value: z.unknown() })).optional(),
          }),
          args,
        );
        const client = getClient();
        const { product_id, ...data } = v;
        const { data: result } = await client.post(`products/${product_id}/variations`, data);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }),
  },
  {
    name: 'products_variations_update',
    description: 'Update a product variation',
    inputSchema: {
      type: 'object',
      properties: {
        product_id: { type: 'integer', description: 'Parent product ID' },
        variation_id: { type: 'integer', description: 'Variation ID' },
        regular_price: { type: 'string', description: 'Regular price' },
        sale_price: { type: 'string', description: 'Sale price' },
        sku: { type: 'string', description: 'Variation SKU' },
        stock_quantity: { type: 'integer', description: 'Stock quantity' },
        stock_status: {
          type: 'string',
          enum: ['instock', 'outofstock', 'onbackorder'],
          description: 'Stock status',
        },
        weight: { type: 'string', description: 'Variation weight' },
        dimensions: {
          type: 'object',
          properties: {
            length: { type: 'string' },
            width: { type: 'string' },
            height: { type: 'string' },
          },
          description: 'Variation dimensions',
        },
        attributes: {
          type: 'array',
          items: { type: 'object' },
          description: 'Variation attributes',
        },
        image: {
          type: 'object',
          properties: {
            src: { type: 'string' },
            alt: { type: 'string' },
            name: { type: 'string' },
          },
          description: 'Variation image',
        },
        meta_data: {
          type: 'array',
          items: { type: 'object', properties: { key: { type: 'string' }, value: {} } },
          description: 'Meta data',
        },
      },
      required: ['product_id', 'variation_id'],
    },
    handler: async (args) =>
      withErrorHandling(async () => {
        assertWriteAccess();
        const v = validateArgs(
          z.object({
            product_id: z.number().int().positive(),
            variation_id: z.number().int().positive(),
            regular_price: z.string().optional(),
            sale_price: z.string().optional(),
            sku: z.string().optional(),
            stock_quantity: z.number().int().optional(),
            stock_status: z.enum(['instock', 'outofstock', 'onbackorder']).optional(),
            weight: z.string().optional(),
            dimensions: z
              .object({
                length: z.string().optional(),
                width: z.string().optional(),
                height: z.string().optional(),
              })
              .optional(),
            attributes: z.array(z.object({}).passthrough()).optional(),
            image: z
              .object({
                src: z.string().optional(),
                alt: z.string().optional(),
                name: z.string().optional(),
              })
              .optional(),
            meta_data: z.array(z.object({ key: z.string(), value: z.unknown() })).optional(),
          }),
          args,
        );
        const client = getClient();
        const { product_id, variation_id, ...data } = v;
        const { data: result } = await client.put(
          `products/${product_id}/variations/${variation_id}`,
          data,
        );
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }),
  },
  {
    name: 'products_variations_delete',
    description: 'Delete a product variation',
    inputSchema: {
      type: 'object',
      properties: {
        product_id: { type: 'integer', description: 'Parent product ID' },
        variation_id: { type: 'integer', description: 'Variation ID' },
        force: { type: 'boolean', description: 'Force delete (skip trash)', default: true },
      },
      required: ['product_id', 'variation_id'],
    },
    handler: async (args) =>
      withErrorHandling(async () => {
        assertWriteAccess();
        const v = validateArgs(
          z.object({
            product_id: z.number().int().positive(),
            variation_id: z.number().int().positive(),
            force: z.boolean().optional(),
          }),
          args,
        );
        const client = getClient();
        const params: Record<string, unknown> = {};
        if (v.force !== undefined) params.force = v.force;
        const { data } = await client.delete(
          `products/${v.product_id}/variations/${v.variation_id}`,
          params,
        );
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      }),
  },

  // ── Product Reviews ──
  {
    name: 'products_reviews_list',
    description: 'List product reviews',
    inputSchema: {
      type: 'object',
      properties: {
        page: { type: 'integer', description: 'Page number' },
        per_page: { type: 'integer', description: 'Items per page (max 100)', default: 10 },
        search: { type: 'string', description: 'Search term' },
        product: { type: 'integer', description: 'Product ID to filter by' },
        status: {
          type: 'string',
          enum: ['approved', 'hold', 'spam', 'unspam', 'trash', 'all'],
          description: 'Review status',
        },
        orderby: {
          type: 'string',
          enum: ['date', 'id', 'product', 'rating'],
          description: 'Sort field',
        },
        order: { type: 'string', enum: ['asc', 'desc'], description: 'Sort direction' },
      },
    },
    handler: makeListHandler(
      'products/reviews',
      z.object({
        page: z.number().int().optional(),
        per_page: z.number().int().optional(),
        search: z.string().optional(),
        product: z.number().int().optional(),
        status: z.enum(['approved', 'hold', 'spam', 'unspam', 'trash', 'all']).optional(),
        orderby: z.enum(['date', 'id', 'product', 'rating']).optional(),
        order: z.enum(['asc', 'desc']).optional(),
      }),
      'reviews',
    ),
  },
  {
    name: 'products_reviews_get',
    description: 'Get a single product review',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'integer', description: 'Review ID' },
      },
      required: ['id'],
    },
    handler: async (args) =>
      withErrorHandling(async () => {
        const v = validateArgs(z.object({ id: z.number().int().positive() }), args);
        const client = getClient();
        const { data } = await client.get(`products/reviews/${v.id}`, {});
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      }),
  },
  {
    name: 'products_reviews_create',
    description: 'Create a product review',
    inputSchema: {
      type: 'object',
      properties: {
        product_id: { type: 'integer', description: 'Product ID' },
        rating: { type: 'integer', description: 'Rating (1-5)', minimum: 1, maximum: 5 },
        review: { type: 'string', description: 'Review content' },
        reviewer: { type: 'string', description: 'Reviewer name' },
        reviewer_email: { type: 'string', description: 'Reviewer email' },
      },
      required: ['product_id', 'review', 'reviewer', 'reviewer_email'],
    },
    handler: async (args) =>
      withErrorHandling(async () => {
        assertWriteAccess();
        const v = validateArgs(
          z.object({
            product_id: z.number().int().positive(),
            review: z.string().min(1),
            reviewer: z.string().min(1),
            reviewer_email: z.string().email(),
            rating: z.number().int().min(1).max(5).optional(),
          }),
          args,
        );
        const client = getClient();
        const { data } = await client.post('products/reviews', v);
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      }),
  },

  // ── Product Shipping Classes ──
  {
    name: 'products_shipping_classes_list',
    description: 'List product shipping classes',
    inputSchema: {
      type: 'object',
      properties: {
        page: { type: 'integer', description: 'Page number' },
        per_page: { type: 'integer', description: 'Items per page (max 100)', default: 10 },
        search: { type: 'string', description: 'Search term' },
        orderby: {
          type: 'string',
          enum: ['id', 'name', 'slug', 'count'],
          description: 'Sort field',
        },
        order: { type: 'string', enum: ['asc', 'desc'], description: 'Sort direction' },
        hide_empty: { type: 'boolean', description: 'Hide empty classes' },
      },
    },
    handler: makeListHandler(
      'products/shipping_classes',
      z.object({
        page: z.number().int().optional(),
        per_page: z.number().int().optional(),
        search: z.string().optional(),
        orderby: z.enum(['id', 'name', 'slug', 'count']).optional(),
        order: z.enum(['asc', 'desc']).optional(),
        hide_empty: z.boolean().optional(),
      }),
      'shipping_classes',
    ),
  },
  {
    name: 'products_shipping_classes_create',
    description: 'Create a product shipping class',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Shipping class name' },
        slug: { type: 'string', description: 'Shipping class slug' },
        description: { type: 'string', description: 'Shipping class description' },
      },
      required: ['name'],
    },
    handler: async (args) =>
      withErrorHandling(async () => {
        assertWriteAccess();
        const v = validateArgs(
          z.object({
            name: z.string().min(1),
            slug: z.string().optional(),
            description: z.string().optional(),
          }),
          args,
        );
        const client = getClient();
        const { data } = await client.post('products/shipping_classes', v);
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      }),
  },
  {
    name: 'products_shipping_classes_update',
    description: 'Update a product shipping class',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'integer', description: 'Shipping class ID' },
        name: { type: 'string', description: 'Shipping class name' },
        slug: { type: 'string', description: 'Shipping class slug' },
        description: { type: 'string', description: 'Shipping class description' },
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
            slug: z.string().optional(),
            description: z.string().optional(),
          }),
          args,
        );
        const client = getClient();
        const { id, ...data } = v;
        const { data: result } = await client.put(`products/shipping_classes/${id}`, data);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }),
  },
  {
    name: 'products_shipping_classes_delete',
    description: 'Delete a product shipping class',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'integer', description: 'Shipping class ID' },
        force: { type: 'boolean', description: 'Force delete (skip trash)', default: true },
      },
      required: ['id'],
    },
    handler: async (args) =>
      withErrorHandling(async () => {
        assertWriteAccess();
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
        const { data } = await client.delete(`products/shipping_classes/${v.id}`, params);
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      }),
  },
];
