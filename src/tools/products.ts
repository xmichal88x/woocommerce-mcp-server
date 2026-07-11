import { registerGroup } from '../groups.js';
import { getClient, isReadOnly } from '../client.js';
import { safeError } from '../errors.js';
import { extractPagination } from '../types.js';

function readOnlyError() {
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(
          {
            code: 'READ_ONLY',
            message: 'Server is in read-only mode. This operation is not allowed.',
            actionable: false,
          },
          null,
          2,
        ),
      },
    ],
    isError: true,
  };
}

registerGroup({
  name: 'products',
  tools: [
    // ── Products CRUD ──
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
      handler: async (args) => {
        try {
          const client = getClient();
          const params: Record<string, unknown> = { ...args };
          const { data, headers } = await client.get('products', params);
          const pagination = extractPagination(headers as Record<string, string | undefined>);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  { products: data, total: pagination.total, totalPages: pagination.totalPages },
                  null,
                  2,
                ),
              },
            ],
          };
        } catch (error) {
          return {
            content: [{ type: 'text', text: JSON.stringify(safeError(error), null, 2) }],
            isError: true,
          };
        }
      },
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
      handler: async (args) => {
        try {
          const client = getClient();
          const { data } = await client.get(`products/${args.id}`, {});
          return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        } catch (error) {
          return {
            content: [{ type: 'text', text: JSON.stringify(safeError(error), null, 2) }],
            isError: true,
          };
        }
      },
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
      handler: async (args) => {
        if (isReadOnly()) return readOnlyError();
        try {
          const client = getClient();
          const { data } = await client.post('products', args);
          return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        } catch (error) {
          return {
            content: [{ type: 'text', text: JSON.stringify(safeError(error), null, 2) }],
            isError: true,
          };
        }
      },
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
        required: ['id'],
      },
      handler: async (args) => {
        if (isReadOnly()) return readOnlyError();
        try {
          const client = getClient();
          const { id, ...data } = args;
          const { data: result } = await client.put(`products/${id}`, data);
          return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
        } catch (error) {
          return {
            content: [{ type: 'text', text: JSON.stringify(safeError(error), null, 2) }],
            isError: true,
          };
        }
      },
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
      handler: async (args) => {
        if (isReadOnly()) return readOnlyError();
        try {
          const client = getClient();
          const params: Record<string, unknown> = {};
          if (args.force !== undefined) params.force = args.force;
          const { data } = await client.delete(`products/${args.id}`, params);
          return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        } catch (error) {
          return {
            content: [{ type: 'text', text: JSON.stringify(safeError(error), null, 2) }],
            isError: true,
          };
        }
      },
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
      handler: async (args) => {
        if (isReadOnly()) return readOnlyError();
        try {
          const client = getClient();
          const { data } = await client.post('products/batch', args);
          return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        } catch (error) {
          return {
            content: [{ type: 'text', text: JSON.stringify(safeError(error), null, 2) }],
            isError: true,
          };
        }
      },
    },

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
      handler: async (args) => {
        try {
          const client = getClient();
          const { product_id, ...params } = args;
          const { data, headers } = await client.get(`products/${product_id}/variations`, params);
          const pagination = extractPagination(headers as Record<string, string | undefined>);
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
        } catch (error) {
          return {
            content: [{ type: 'text', text: JSON.stringify(safeError(error), null, 2) }],
            isError: true,
          };
        }
      },
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
      handler: async (args) => {
        try {
          const client = getClient();
          const { data } = await client.get(
            `products/${args.product_id}/variations/${args.variation_id}`,
            {},
          );
          return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        } catch (error) {
          return {
            content: [{ type: 'text', text: JSON.stringify(safeError(error), null, 2) }],
            isError: true,
          };
        }
      },
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
      handler: async (args) => {
        if (isReadOnly()) return readOnlyError();
        try {
          const client = getClient();
          const { product_id, ...data } = args;
          const { data: result } = await client.post(`products/${product_id}/variations`, data);
          return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
        } catch (error) {
          return {
            content: [{ type: 'text', text: JSON.stringify(safeError(error), null, 2) }],
            isError: true,
          };
        }
      },
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
      handler: async (args) => {
        if (isReadOnly()) return readOnlyError();
        try {
          const client = getClient();
          const { product_id, variation_id, ...data } = args;
          const { data: result } = await client.put(
            `products/${product_id}/variations/${variation_id}`,
            data,
          );
          return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
        } catch (error) {
          return {
            content: [{ type: 'text', text: JSON.stringify(safeError(error), null, 2) }],
            isError: true,
          };
        }
      },
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
      handler: async (args) => {
        if (isReadOnly()) return readOnlyError();
        try {
          const client = getClient();
          const params: Record<string, unknown> = {};
          if (args.force !== undefined) params.force = args.force;
          const { data } = await client.delete(
            `products/${args.product_id}/variations/${args.variation_id}`,
            params,
          );
          return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        } catch (error) {
          return {
            content: [{ type: 'text', text: JSON.stringify(safeError(error), null, 2) }],
            isError: true,
          };
        }
      },
    },

    // ── Product Categories ──
    {
      name: 'products_categories_list',
      description: 'List product categories',
      inputSchema: {
        type: 'object',
        properties: {
          page: { type: 'integer', description: 'Page number' },
          per_page: { type: 'integer', description: 'Items per page (max 100)', default: 10 },
          search: { type: 'string', description: 'Search term' },
          hide_empty: { type: 'boolean', description: 'Hide empty categories' },
        },
      },
      handler: async (args) => {
        try {
          const client = getClient();
          const params: Record<string, unknown> = { ...args };
          const { data, headers } = await client.get('products/categories', params);
          const pagination = extractPagination(headers as Record<string, string | undefined>);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  { categories: data, total: pagination.total, totalPages: pagination.totalPages },
                  null,
                  2,
                ),
              },
            ],
          };
        } catch (error) {
          return {
            content: [{ type: 'text', text: JSON.stringify(safeError(error), null, 2) }],
            isError: true,
          };
        }
      },
    },
    {
      name: 'products_categories_get',
      description: 'Get a single product category',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'Category ID' },
        },
        required: ['id'],
      },
      handler: async (args) => {
        try {
          const client = getClient();
          const { data } = await client.get(`products/categories/${args.id}`, {});
          return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        } catch (error) {
          return {
            content: [{ type: 'text', text: JSON.stringify(safeError(error), null, 2) }],
            isError: true,
          };
        }
      },
    },
    {
      name: 'products_categories_create',
      description: 'Create a product category',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Category name' },
          slug: { type: 'string', description: 'Category slug' },
          description: { type: 'string', description: 'Category description' },
          parent: { type: 'integer', description: 'Parent category ID' },
          image: {
            type: 'object',
            properties: { src: { type: 'string' }, alt: { type: 'string' } },
            description: 'Category image',
          },
        },
        required: ['name'],
      },
      handler: async (args) => {
        if (isReadOnly()) return readOnlyError();
        try {
          const client = getClient();
          const { data } = await client.post('products/categories', args);
          return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        } catch (error) {
          return {
            content: [{ type: 'text', text: JSON.stringify(safeError(error), null, 2) }],
            isError: true,
          };
        }
      },
    },
    {
      name: 'products_categories_update',
      description: 'Update a product category',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'Category ID' },
          name: { type: 'string', description: 'Category name' },
          slug: { type: 'string', description: 'Category slug' },
          description: { type: 'string', description: 'Category description' },
          parent: { type: 'integer', description: 'Parent category ID' },
          image: {
            type: 'object',
            properties: { src: { type: 'string' }, alt: { type: 'string' } },
            description: 'Category image',
          },
        },
        required: ['id'],
      },
      handler: async (args) => {
        if (isReadOnly()) return readOnlyError();
        try {
          const client = getClient();
          const { id, ...data } = args;
          const { data: result } = await client.put(`products/categories/${id}`, data);
          return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
        } catch (error) {
          return {
            content: [{ type: 'text', text: JSON.stringify(safeError(error), null, 2) }],
            isError: true,
          };
        }
      },
    },
    {
      name: 'products_categories_delete',
      description: 'Delete a product category',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'Category ID' },
          force: { type: 'boolean', description: 'Force delete', default: true },
        },
        required: ['id'],
      },
      handler: async (args) => {
        if (isReadOnly()) return readOnlyError();
        try {
          const client = getClient();
          const params: Record<string, unknown> = {};
          if (args.force !== undefined) params.force = args.force;
          const { data } = await client.delete(`products/categories/${args.id}`, params);
          return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        } catch (error) {
          return {
            content: [{ type: 'text', text: JSON.stringify(safeError(error), null, 2) }],
            isError: true,
          };
        }
      },
    },

    // ── Product Tags ──
    {
      name: 'products_tags_list',
      description: 'List product tags',
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
          hide_empty: { type: 'boolean', description: 'Hide empty tags' },
        },
      },
      handler: async (args) => {
        try {
          const client = getClient();
          const params: Record<string, unknown> = { ...args };
          const { data, headers } = await client.get('products/tags', params);
          const pagination = extractPagination(headers as Record<string, string | undefined>);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  { tags: data, total: pagination.total, totalPages: pagination.totalPages },
                  null,
                  2,
                ),
              },
            ],
          };
        } catch (error) {
          return {
            content: [{ type: 'text', text: JSON.stringify(safeError(error), null, 2) }],
            isError: true,
          };
        }
      },
    },
    {
      name: 'products_tags_get',
      description: 'Get a single product tag',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'Tag ID' },
        },
        required: ['id'],
      },
      handler: async (args) => {
        try {
          const client = getClient();
          const { data } = await client.get(`products/tags/${args.id}`, {});
          return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        } catch (error) {
          return {
            content: [{ type: 'text', text: JSON.stringify(safeError(error), null, 2) }],
            isError: true,
          };
        }
      },
    },
    {
      name: 'products_tags_create',
      description: 'Create a product tag',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Tag name' },
          slug: { type: 'string', description: 'Tag slug' },
          description: { type: 'string', description: 'Tag description' },
        },
        required: ['name'],
      },
      handler: async (args) => {
        if (isReadOnly()) return readOnlyError();
        try {
          const client = getClient();
          const { data } = await client.post('products/tags', args);
          return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        } catch (error) {
          return {
            content: [{ type: 'text', text: JSON.stringify(safeError(error), null, 2) }],
            isError: true,
          };
        }
      },
    },
    {
      name: 'products_tags_update',
      description: 'Update a product tag',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'Tag ID' },
          name: { type: 'string', description: 'Tag name' },
          slug: { type: 'string', description: 'Tag slug' },
          description: { type: 'string', description: 'Tag description' },
        },
        required: ['id'],
      },
      handler: async (args) => {
        if (isReadOnly()) return readOnlyError();
        try {
          const client = getClient();
          const { id, ...data } = args;
          const { data: result } = await client.put(`products/tags/${id}`, data);
          return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
        } catch (error) {
          return {
            content: [{ type: 'text', text: JSON.stringify(safeError(error), null, 2) }],
            isError: true,
          };
        }
      },
    },
    {
      name: 'products_tags_delete',
      description: 'Delete a product tag',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'Tag ID' },
          force: { type: 'boolean', description: 'Force delete', default: true },
        },
        required: ['id'],
      },
      handler: async (args) => {
        if (isReadOnly()) return readOnlyError();
        try {
          const client = getClient();
          const params: Record<string, unknown> = {};
          if (args.force !== undefined) params.force = args.force;
          const { data } = await client.delete(`products/tags/${args.id}`, params);
          return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        } catch (error) {
          return {
            content: [{ type: 'text', text: JSON.stringify(safeError(error), null, 2) }],
            isError: true,
          };
        }
      },
    },

    // ── Product Attributes ──
    {
      name: 'products_attributes_list',
      description: 'List product attributes',
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
        },
      },
      handler: async (args) => {
        try {
          const client = getClient();
          const params: Record<string, unknown> = { ...args };
          const { data, headers } = await client.get('products/attributes', params);
          const pagination = extractPagination(headers as Record<string, string | undefined>);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  { attributes: data, total: pagination.total, totalPages: pagination.totalPages },
                  null,
                  2,
                ),
              },
            ],
          };
        } catch (error) {
          return {
            content: [{ type: 'text', text: JSON.stringify(safeError(error), null, 2) }],
            isError: true,
          };
        }
      },
    },
    {
      name: 'products_attributes_get',
      description: 'Get a single product attribute',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'Attribute ID' },
        },
        required: ['id'],
      },
      handler: async (args) => {
        try {
          const client = getClient();
          const { data } = await client.get(`products/attributes/${args.id}`, {});
          return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        } catch (error) {
          return {
            content: [{ type: 'text', text: JSON.stringify(safeError(error), null, 2) }],
            isError: true,
          };
        }
      },
    },
    {
      name: 'products_attributes_create',
      description: 'Create a product attribute',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Attribute name' },
          slug: { type: 'string', description: 'Attribute slug' },
          type: {
            type: 'string',
            enum: ['select', 'text'],
            description: 'Attribute type',
            default: 'select',
          },
          order_by: {
            type: 'string',
            enum: ['menu_order', 'name', 'name_num', 'id'],
            description: 'Sort order for terms',
          },
          has_archives: { type: 'boolean', description: 'Enable attribute archives' },
        },
        required: ['name'],
      },
      handler: async (args) => {
        if (isReadOnly()) return readOnlyError();
        try {
          const client = getClient();
          const { data } = await client.post('products/attributes', args);
          return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        } catch (error) {
          return {
            content: [{ type: 'text', text: JSON.stringify(safeError(error), null, 2) }],
            isError: true,
          };
        }
      },
    },
    {
      name: 'products_attributes_update',
      description: 'Update a product attribute',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'Attribute ID' },
          name: { type: 'string', description: 'Attribute name' },
          slug: { type: 'string', description: 'Attribute slug' },
          type: { type: 'string', enum: ['select', 'text'], description: 'Attribute type' },
          order_by: {
            type: 'string',
            enum: ['menu_order', 'name', 'name_num', 'id'],
            description: 'Sort order for terms',
          },
          has_archives: { type: 'boolean', description: 'Enable attribute archives' },
        },
        required: ['id'],
      },
      handler: async (args) => {
        if (isReadOnly()) return readOnlyError();
        try {
          const client = getClient();
          const { id, ...data } = args;
          const { data: result } = await client.put(`products/attributes/${id}`, data);
          return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
        } catch (error) {
          return {
            content: [{ type: 'text', text: JSON.stringify(safeError(error), null, 2) }],
            isError: true,
          };
        }
      },
    },
    {
      name: 'products_attributes_delete',
      description: 'Delete a product attribute',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'Attribute ID' },
          force: { type: 'boolean', description: 'Force delete', default: true },
        },
        required: ['id'],
      },
      handler: async (args) => {
        if (isReadOnly()) return readOnlyError();
        try {
          const client = getClient();
          const params: Record<string, unknown> = {};
          if (args.force !== undefined) params.force = args.force;
          const { data } = await client.delete(`products/attributes/${args.id}`, params);
          return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        } catch (error) {
          return {
            content: [{ type: 'text', text: JSON.stringify(safeError(error), null, 2) }],
            isError: true,
          };
        }
      },
    },
    {
      name: 'products_attributes_terms_list',
      description: 'List terms for a product attribute',
      inputSchema: {
        type: 'object',
        properties: {
          attribute_id: { type: 'integer', description: 'Attribute ID' },
          page: { type: 'integer', description: 'Page number' },
          per_page: { type: 'integer', description: 'Items per page (max 100)', default: 10 },
          search: { type: 'string', description: 'Search term' },
          orderby: {
            type: 'string',
            enum: ['id', 'name', 'slug', 'count'],
            description: 'Sort field',
          },
          order: { type: 'string', enum: ['asc', 'desc'], description: 'Sort direction' },
          hide_empty: { type: 'boolean', description: 'Hide empty terms' },
        },
        required: ['attribute_id'],
      },
      handler: async (args) => {
        try {
          const client = getClient();
          const { attribute_id, ...params } = args;
          const { data, headers } = await client.get(
            `products/attributes/${attribute_id}/terms`,
            params,
          );
          const pagination = extractPagination(headers as Record<string, string | undefined>);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  { terms: data, total: pagination.total, totalPages: pagination.totalPages },
                  null,
                  2,
                ),
              },
            ],
          };
        } catch (error) {
          return {
            content: [{ type: 'text', text: JSON.stringify(safeError(error), null, 2) }],
            isError: true,
          };
        }
      },
    },
    {
      name: 'products_attributes_terms_create',
      description: 'Create a term for a product attribute',
      inputSchema: {
        type: 'object',
        properties: {
          attribute_id: { type: 'integer', description: 'Attribute ID' },
          name: { type: 'string', description: 'Term name' },
          slug: { type: 'string', description: 'Term slug' },
          description: { type: 'string', description: 'Term description' },
        },
        required: ['attribute_id', 'name'],
      },
      handler: async (args) => {
        if (isReadOnly()) return readOnlyError();
        try {
          const client = getClient();
          const { attribute_id, ...data } = args;
          const { data: result } = await client.post(
            `products/attributes/${attribute_id}/terms`,
            data,
          );
          return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
        } catch (error) {
          return {
            content: [{ type: 'text', text: JSON.stringify(safeError(error), null, 2) }],
            isError: true,
          };
        }
      },
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
      handler: async (args) => {
        try {
          const client = getClient();
          const params: Record<string, unknown> = { ...args };
          const { data, headers } = await client.get('products/reviews', params);
          const pagination = extractPagination(headers as Record<string, string | undefined>);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  { reviews: data, total: pagination.total, totalPages: pagination.totalPages },
                  null,
                  2,
                ),
              },
            ],
          };
        } catch (error) {
          return {
            content: [{ type: 'text', text: JSON.stringify(safeError(error), null, 2) }],
            isError: true,
          };
        }
      },
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
      handler: async (args) => {
        try {
          const client = getClient();
          const { data } = await client.get(`products/reviews/${args.id}`, {});
          return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        } catch (error) {
          return {
            content: [{ type: 'text', text: JSON.stringify(safeError(error), null, 2) }],
            isError: true,
          };
        }
      },
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
      handler: async (args) => {
        if (isReadOnly()) return readOnlyError();
        try {
          const client = getClient();
          const { data } = await client.post('products/reviews', args);
          return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        } catch (error) {
          return {
            content: [{ type: 'text', text: JSON.stringify(safeError(error), null, 2) }],
            isError: true,
          };
        }
      },
    },
  ],
});
