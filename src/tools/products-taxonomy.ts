import { z } from 'zod';
import { getClient } from '../client.js';
import { extractPagination } from '../types.js';
import { makeListHandler, validateArgs, withErrorHandling, assertWriteAccess } from '../utils.js';
import type { ToolDefinition } from '../groups.js';

export const taxonomyTools: ToolDefinition[] = [
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
    handler: makeListHandler(
      'products/categories',
      z.object({
        page: z.number().int().optional(),
        per_page: z.number().int().optional(),
        search: z.string().optional(),
        hide_empty: z.boolean().optional(),
      }),
      'categories',
    ),
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
    handler: async (args) =>
      withErrorHandling(async () => {
        const v = validateArgs(z.object({ id: z.number().int().positive() }), args);
        const client = getClient();
        const { data } = await client.get(`products/categories/${v.id}`, {});
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      }),
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
    handler: async (args) =>
      withErrorHandling(async () => {
        assertWriteAccess();
        const v = validateArgs(
          z.object({
            name: z.string().min(1),
            slug: z.string().optional(),
            description: z.string().optional(),
            parent: z.number().int().positive().optional(),
            image: z
              .object({
                src: z.string().optional(),
                alt: z.string().optional(),
              })
              .optional(),
          }),
          args,
        );
        const client = getClient();
        const { data } = await client.post('products/categories', v);
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      }),
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
    handler: async (args) =>
      withErrorHandling(async () => {
        assertWriteAccess();
        const v = validateArgs(
          z.object({
            id: z.number().int().positive(),
            name: z.string().min(1).optional(),
            slug: z.string().optional(),
            description: z.string().optional(),
            parent: z.number().int().positive().optional(),
            image: z
              .object({
                src: z.string().optional(),
                alt: z.string().optional(),
              })
              .optional(),
          }),
          args,
        );
        const client = getClient();
        const { id, ...data } = v;
        const { data: result } = await client.put(`products/categories/${id}`, data);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }),
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
        const { data } = await client.delete(`products/categories/${v.id}`, params);
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      }),
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
    handler: makeListHandler(
      'products/tags',
      z.object({
        page: z.number().int().optional(),
        per_page: z.number().int().optional(),
        search: z.string().optional(),
        orderby: z.enum(['id', 'name', 'slug', 'count']).optional(),
        order: z.enum(['asc', 'desc']).optional(),
        hide_empty: z.boolean().optional(),
      }),
      'tags',
    ),
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
    handler: async (args) =>
      withErrorHandling(async () => {
        const v = validateArgs(z.object({ id: z.number().int().positive() }), args);
        const client = getClient();
        const { data } = await client.get(`products/tags/${v.id}`, {});
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      }),
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
        const { data } = await client.post('products/tags', v);
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      }),
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
        const { data: result } = await client.put(`products/tags/${id}`, data);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }),
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
        const { data } = await client.delete(`products/tags/${v.id}`, params);
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      }),
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
    handler: makeListHandler(
      'products/attributes',
      z.object({
        page: z.number().int().optional(),
        per_page: z.number().int().optional(),
        search: z.string().optional(),
        orderby: z.enum(['id', 'name', 'slug', 'count']).optional(),
        order: z.enum(['asc', 'desc']).optional(),
      }),
      'attributes',
    ),
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
    handler: async (args) =>
      withErrorHandling(async () => {
        const v = validateArgs(z.object({ id: z.number().int().positive() }), args);
        const client = getClient();
        const { data } = await client.get(`products/attributes/${v.id}`, {});
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      }),
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
    handler: async (args) =>
      withErrorHandling(async () => {
        assertWriteAccess();
        const v = validateArgs(
          z.object({
            name: z.string().min(1),
            slug: z.string().optional(),
            type: z.enum(['select', 'text']).optional(),
            order_by: z.enum(['menu_order', 'name', 'name_num', 'id']).optional(),
            has_archives: z.boolean().optional(),
          }),
          args,
        );
        const client = getClient();
        const { data } = await client.post('products/attributes', v);
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      }),
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
    handler: async (args) =>
      withErrorHandling(async () => {
        assertWriteAccess();
        const v = validateArgs(
          z.object({
            id: z.number().int().positive(),
            name: z.string().min(1).optional(),
            slug: z.string().optional(),
            type: z.enum(['select', 'text']).optional(),
            order_by: z.enum(['menu_order', 'name', 'name_num', 'id']).optional(),
            has_archives: z.boolean().optional(),
          }),
          args,
        );
        const client = getClient();
        const { id, ...data } = v;
        const { data: result } = await client.put(`products/attributes/${id}`, data);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }),
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
        const { data } = await client.delete(`products/attributes/${v.id}`, params);
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      }),
  },

  // ── Product Attribute Terms ──
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
    handler: async (args) =>
      withErrorHandling(async () => {
        const v = validateArgs(
          z.object({
            attribute_id: z.number().int().positive(),
            page: z.number().int().optional(),
            per_page: z.number().int().optional(),
            search: z.string().optional(),
            orderby: z.enum(['id', 'name', 'slug', 'count']).optional(),
            order: z.enum(['asc', 'desc']).optional(),
            hide_empty: z.boolean().optional(),
          }),
          args,
        );
        const client = getClient();
        const { attribute_id, ...params } = v;
        const { data, headers } = await client.get(
          `products/attributes/${attribute_id}/terms`,
          params,
        );
        const pagination = extractPagination(headers);
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
      }),
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
    handler: async (args) =>
      withErrorHandling(async () => {
        assertWriteAccess();
        const v = validateArgs(
          z.object({
            attribute_id: z.number().int().positive(),
            name: z.string().min(1),
            slug: z.string().optional(),
            description: z.string().optional(),
          }),
          args,
        );
        const client = getClient();
        const { attribute_id, ...data } = v;
        const { data: result } = await client.post(
          `products/attributes/${attribute_id}/terms`,
          data,
        );
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }),
  },
  {
    name: 'products_attributes_terms_update',
    description: 'Update a term for a product attribute',
    inputSchema: {
      type: 'object',
      properties: {
        attribute_id: { type: 'integer', description: 'Attribute ID' },
        term_id: { type: 'integer', description: 'Term ID' },
        name: { type: 'string', description: 'Term name' },
        slug: { type: 'string', description: 'Term slug' },
        description: { type: 'string', description: 'Term description' },
      },
      required: ['attribute_id', 'term_id'],
    },
    handler: async (args) =>
      withErrorHandling(async () => {
        assertWriteAccess();
        const v = validateArgs(
          z.object({
            attribute_id: z.number().int().positive(),
            term_id: z.number().int().positive(),
            name: z.string().min(1).optional(),
            slug: z.string().optional(),
            description: z.string().optional(),
          }),
          args,
        );
        const client = getClient();
        const { attribute_id, term_id, ...data } = v;
        const { data: result } = await client.put(
          `products/attributes/${attribute_id}/terms/${term_id}`,
          data,
        );
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }),
  },
  {
    name: 'products_attributes_terms_delete',
    description: 'Delete a term for a product attribute',
    inputSchema: {
      type: 'object',
      properties: {
        attribute_id: { type: 'integer', description: 'Attribute ID' },
        term_id: { type: 'integer', description: 'Term ID' },
        force: { type: 'boolean', description: 'Force delete (skip trash)', default: true },
      },
      required: ['attribute_id', 'term_id'],
    },
    handler: async (args) =>
      withErrorHandling(async () => {
        assertWriteAccess();
        const v = validateArgs(
          z.object({
            attribute_id: z.number().int().positive(),
            term_id: z.number().int().positive(),
            force: z.boolean().optional(),
          }),
          args,
        );
        const client = getClient();
        const params: Record<string, unknown> = {};
        if (v.force !== undefined) params.force = v.force;
        const { data } = await client.delete(
          `products/attributes/${v.attribute_id}/terms/${v.term_id}`,
          params,
        );
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      }),
  },
];
