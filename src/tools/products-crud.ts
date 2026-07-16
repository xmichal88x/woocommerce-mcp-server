import { z } from 'zod';
import { getClient } from '../client.js';
import { makeListHandler, validateArgs, withErrorHandling, assertWriteAccess } from '../utils.js';
import type { ToolDefinition } from '../groups.js';

export const crudTools: ToolDefinition[] = [
  {
    name: 'products_list',
    description: 'List products with optional filtering',
    inputSchema: {
      type: 'object',
      properties: {
        page: { type: 'integer', description: 'Page number' },
        per_page: { type: 'integer', description: 'Items per page (max 100)', default: 10 },
        search: { type: 'string', description: 'Search term' },
        status: {
          type: 'string',
          enum: ['draft', 'pending', 'private', 'publish', 'any'],
          description: 'Product status',
        },
        category: { type: 'integer', description: 'Category ID' },
        tag: { type: 'integer', description: 'Tag ID' },
        sku: { type: 'string', description: 'Product SKU' },
        orderby: {
          type: 'string',
          enum: ['date', 'id', 'title', 'slug', 'price', 'popularity', 'rating'],
          description: 'Sort field',
        },
        order: { type: 'string', enum: ['asc', 'desc'], description: 'Sort direction' },
        min_price: { type: 'string', description: 'Minimum price' },
        max_price: { type: 'string', description: 'Maximum price' },
        on_sale: { type: 'boolean', description: 'Filter by on sale' },
        stock_status: {
          type: 'string',
          enum: ['instock', 'outofstock', 'onbackorder'],
          description: 'Stock status',
        },
      },
    },
    handler: makeListHandler(
      'products',
      z.object({
        page: z.number().int().optional(),
        per_page: z.number().int().optional(),
        search: z.string().optional(),
        status: z.enum(['draft', 'pending', 'private', 'publish', 'any']).optional(),
        category: z.number().int().optional(),
        tag: z.number().int().optional(),
        sku: z.string().optional(),
        orderby: z
          .enum(['date', 'id', 'title', 'slug', 'price', 'popularity', 'rating'])
          .optional(),
        order: z.enum(['asc', 'desc']).optional(),
        min_price: z.string().optional(),
        max_price: z.string().optional(),
        on_sale: z.boolean().optional(),
        stock_status: z.enum(['instock', 'outofstock', 'onbackorder']).optional(),
      }),
      'products',
    ),
  },
  {
    name: 'products_get',
    description: 'Get a single product by ID',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'integer', description: 'Product ID' },
      },
      required: ['id'],
    },
    handler: async (args) =>
      withErrorHandling(async () => {
        const v = validateArgs(z.object({ id: z.number().int().positive() }), args);
        const client = getClient();
        const { data } = await client.get(`products/${v.id}`, {});
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      }),
  },
  {
    name: 'products_create',
    description: 'Create a new product',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Product name' },
        type: {
          type: 'string',
          enum: ['simple', 'grouped', 'external', 'variable'],
          description: 'Product type',
          default: 'simple',
        },
        regular_price: { type: 'string', description: 'Regular price' },
        sale_price: { type: 'string', description: 'Sale price' },
        description: { type: 'string', description: 'Product description (HTML)' },
        short_description: { type: 'string', description: 'Short description (HTML)' },
        sku: { type: 'string', description: 'Product SKU' },
        stock_quantity: { type: 'integer', description: 'Stock quantity' },
        stock_status: {
          type: 'string',
          enum: ['instock', 'outofstock', 'onbackorder'],
          description: 'Stock status',
        },
        categories: {
          type: 'array',
          items: { type: 'object', properties: { id: { type: 'integer' } } },
          description: 'Category IDs',
        },
        tags: {
          type: 'array',
          items: { type: 'object', properties: { id: { type: 'integer' } } },
          description: 'Tag IDs',
        },
        images: {
          type: 'array',
          items: { type: 'object', properties: { src: { type: 'string' } } },
          description: 'Product images',
        },
        attributes: {
          type: 'array',
          items: { type: 'object' },
          description: 'Product attributes',
        },
        weight: { type: 'string', description: 'Product weight' },
        dimensions: {
          type: 'object',
          properties: {
            length: { type: 'string' },
            width: { type: 'string' },
            height: { type: 'string' },
          },
          description: 'Product dimensions',
        },
        meta_data: {
          type: 'array',
          items: { type: 'object', properties: { key: { type: 'string' }, value: {} } },
          description: 'Meta data',
        },
      },
      required: ['name'],
    },
    handler: async (args) =>
      withErrorHandling(async () => {
        assertWriteAccess();
        const v = validateArgs(
          z.object({
            name: z.string().min(1),
            type: z.enum(['simple', 'grouped', 'external', 'variable']).optional(),
            regular_price: z.string().optional(),
            sale_price: z.string().optional(),
            description: z.string().optional(),
            short_description: z.string().optional(),
            sku: z.string().optional(),
            stock_quantity: z.number().int().optional(),
            stock_status: z.enum(['instock', 'outofstock', 'onbackorder']).optional(),
            categories: z.array(z.object({ id: z.number().int().positive() })).optional(),
            tags: z.array(z.object({ id: z.number().int().positive() })).optional(),
            images: z.array(z.object({ src: z.string() })).optional(),
            attributes: z.array(z.object({}).passthrough()).optional(),
            weight: z.string().optional(),
            dimensions: z
              .object({
                length: z.string().optional(),
                width: z.string().optional(),
                height: z.string().optional(),
              })
              .optional(),
            meta_data: z.array(z.object({ key: z.string(), value: z.unknown() })).optional(),
          }),
          args,
        );
        const client = getClient();
        const { data } = await client.post('products', v);
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      }),
  },
  {
    name: 'products_update',
    description: 'Update an existing product',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'integer', description: 'Product ID' },
        name: { type: 'string', description: 'Product name' },
        type: {
          type: 'string',
          enum: ['simple', 'grouped', 'external', 'variable'],
          description: 'Product type',
        },
        regular_price: { type: 'string', description: 'Regular price' },
        sale_price: { type: 'string', description: 'Sale price' },
        description: { type: 'string', description: 'Product description (HTML)' },
        short_description: { type: 'string', description: 'Short description (HTML)' },
        sku: { type: 'string', description: 'Product SKU' },
        stock_quantity: { type: 'integer', description: 'Stock quantity' },
        stock_status: {
          type: 'string',
          enum: ['instock', 'outofstock', 'onbackorder'],
          description: 'Stock status',
        },
        categories: {
          type: 'array',
          items: { type: 'object', properties: { id: { type: 'integer' } } },
          description: 'Category IDs',
        },
        tags: {
          type: 'array',
          items: { type: 'object', properties: { id: { type: 'integer' } } },
          description: 'Tag IDs',
        },
        images: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              src: { type: 'string' },
              id: { type: 'integer' },
            },
          },
          description: 'Product images',
        },
        attributes: {
          type: 'array',
          items: { type: 'object' },
          description: 'Product attributes',
        },
        weight: { type: 'string', description: 'Product weight' },
        dimensions: {
          type: 'object',
          properties: {
            length: { type: 'string' },
            width: { type: 'string' },
            height: { type: 'string' },
          },
          description: 'Product dimensions',
        },
        meta_data: {
          type: 'array',
          items: { type: 'object', properties: { key: { type: 'string' }, value: {} } },
          description: 'Meta data',
        },
        cross_sell_ids: {
          type: 'array',
          items: { type: 'integer' },
          description: 'Cross-sell product IDs',
        },
        upsell_ids: {
          type: 'array',
          items: { type: 'integer' },
          description: 'Upsell product IDs',
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
              name: z.string().min(1).optional(),
              type: z.enum(['simple', 'grouped', 'external', 'variable']).optional(),
              regular_price: z
                .string()
                .regex(/^\d+([.,]\d{1,2})?$/)
                .optional(),
              sale_price: z
                .string()
                .regex(/^\d+([.,]\d{1,2})?$/)
                .optional(),
              description: z.string().optional(),
              short_description: z.string().optional(),
              sku: z.string().optional(),
              stock_quantity: z.number().int().optional(),
              stock_status: z.enum(['instock', 'outofstock', 'onbackorder']).optional(),
              categories: z.array(z.object({ id: z.number().int().positive() })).optional(),
              tags: z.array(z.object({ id: z.number().int().positive() })).optional(),
              images: z
                .array(
                  z.object({
                    src: z.string().optional(),
                    id: z.number().int().positive().optional(),
                  }),
                )
                .optional(),
              cross_sell_ids: z.array(z.number().int().positive()).optional(),
              upsell_ids: z.array(z.number().int().positive()).optional(),
              attributes: z.array(z.object({}).passthrough()).optional(),
              weight: z.string().optional(),
              dimensions: z
                .object({
                  length: z.string().optional(),
                  width: z.string().optional(),
                  height: z.string().optional(),
                })
                .optional(),
              meta_data: z.array(z.object({ key: z.string(), value: z.unknown() })).optional(),
            })
            .refine(
              (data) => {
                if (data.sale_price === undefined || data.regular_price === undefined) return true;
                const rp = parseFloat(data.regular_price.replace(',', '.'));
                const sp = parseFloat(data.sale_price.replace(',', '.'));
                if (isNaN(rp) || isNaN(sp)) return true;
                return sp <= rp;
              },
              {
                message: 'Sale price must be less than or equal to regular price',
                path: ['sale_price'],
              },
            )
            .refine(
              (data) => {
                if (data.stock_status !== 'outofstock') return true;
                if (data.stock_quantity === undefined) return true;
                return data.stock_quantity <= 0;
              },
              {
                message: 'stock_status is "outofstock" but stock_quantity is positive',
                path: ['stock_status'],
              },
            ),
          args,
        );
        const client = getClient();
        const { id, ...data } = v;
        const { data: result } = await client.put(`products/${id}`, data);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }),
  },
  {
    name: 'products_delete',
    description: 'Delete a product',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'integer', description: 'Product ID' },
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
        const { data } = await client.delete(`products/${v.id}`, params);
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      }),
  },
  {
    name: 'products_batch',
    description: 'Batch create, update, and delete products',
    inputSchema: {
      type: 'object',
      properties: {
        create: {
          type: 'array',
          items: { type: 'object' },
          description: 'Array of products to create',
        },
        update: {
          type: 'array',
          items: { type: 'object' },
          description: 'Array of products to update',
        },
        delete: {
          type: 'array',
          items: { type: 'integer' },
          description: 'Array of product IDs to delete',
        },
      },
    },
    handler: async (args) =>
      withErrorHandling(async () => {
        assertWriteAccess();
        const v = validateArgs(
          z.object({
            create: z.array(z.object({}).passthrough()).optional(),
            update: z.array(z.object({}).passthrough()).optional(),
            delete: z.array(z.number().int().positive()).optional(),
          }),
          args,
        );
        const client = getClient();
        const { data } = await client.post('products/batch', v);
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      }),
  },
];
