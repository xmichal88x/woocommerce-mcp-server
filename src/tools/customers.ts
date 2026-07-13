import { z } from 'zod';
import { registerGroup } from '../groups.js';
import { getClient } from '../client.js';

import { makeListHandler, validateArgs, withErrorHandling, assertWriteAccess } from '../utils.js';
import { billingSchema, shippingSchema, metaDataSchema } from '../schemas.js';

registerGroup({
  name: 'customers',
  tools: [
    {
      name: 'customers_list',
      description: 'List customers with optional filtering',
      inputSchema: {
        type: 'object',
        properties: {
          page: { type: 'integer', description: 'Page number' },
          per_page: { type: 'integer', description: 'Items per page (max 100)', default: 10 },
          search: { type: 'string', description: 'Search term' },
          email: { type: 'string', description: 'Filter by email' },
          role: { type: 'string', description: 'Filter by role (e.g. all, customer)' },
          orderby: {
            type: 'string',
            enum: ['id', 'email', 'name', 'username', 'role'],
            description: 'Sort field',
          },
          order: { type: 'string', enum: ['asc', 'desc'], description: 'Sort direction' },
        },
      },
      handler: makeListHandler(
        'customers',
        z.object({
          page: z.number().int().optional(),
          per_page: z.number().int().optional(),
          search: z.string().optional(),
          email: z.string().optional(),
          role: z.string().optional(),
          orderby: z.enum(['id', 'email', 'name', 'username', 'role']).optional(),
          order: z.enum(['asc', 'desc']).optional(),
        }),
        'customers',
      ),
    },
    {
      name: 'customers_get',
      description: 'Get a single customer by ID',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'Customer ID' },
        },
        required: ['id'],
      },
      handler: async (args) =>
        withErrorHandling(async () => {
          const v = validateArgs(z.object({ id: z.number().int().positive() }), args);
          const client = getClient();
          const { data } = await client.get(`customers/${v.id}`, {});
          return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        }),
    },
    {
      name: 'customers_create',
      description: 'Create a new customer',
      inputSchema: {
        type: 'object',
        properties: {
          email: { type: 'string', description: 'Customer email address' },
          first_name: { type: 'string', description: 'First name' },
          last_name: { type: 'string', description: 'Last name' },
          username: { type: 'string', description: 'Customer username' },
          password: { type: 'string', description: 'Customer password' },
          billing: {
            type: 'object',
            properties: {
              first_name: { type: 'string' },
              last_name: { type: 'string' },
              company: { type: 'string' },
              address_1: { type: 'string' },
              address_2: { type: 'string' },
              city: { type: 'string' },
              state: { type: 'string' },
              postcode: { type: 'string' },
              country: { type: 'string' },
              email: { type: 'string' },
              phone: { type: 'string' },
            },
            description: 'Billing address',
          },
          shipping: {
            type: 'object',
            properties: {
              first_name: { type: 'string' },
              last_name: { type: 'string' },
              company: { type: 'string' },
              address_1: { type: 'string' },
              address_2: { type: 'string' },
              city: { type: 'string' },
              state: { type: 'string' },
              postcode: { type: 'string' },
              country: { type: 'string' },
            },
            description: 'Shipping address',
          },
          meta_data: {
            type: 'array',
            items: { type: 'object', properties: { key: { type: 'string' }, value: {} } },
            description: 'Meta data',
          },
        },
        required: ['email'],
      },
      handler: async (args) =>
        withErrorHandling(async () => {
          assertWriteAccess();
          const v = validateArgs(
            z.object({
              email: z.string().email(),
              first_name: z.string().optional(),
              last_name: z.string().optional(),
              username: z.string().optional(),
              password: z.string().optional(),
              billing: billingSchema.optional(),
              shipping: shippingSchema.optional(),
              meta_data: z.array(metaDataSchema).optional(),
            }),
            args,
          );
          const client = getClient();
          const { data } = await client.post('customers', v);
          return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        }),
    },
    {
      name: 'customers_update',
      description: 'Update an existing customer',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'Customer ID' },
          email: { type: 'string', description: 'Customer email address' },
          first_name: { type: 'string', description: 'First name' },
          last_name: { type: 'string', description: 'Last name' },
          username: { type: 'string', description: 'Customer username' },
          password: { type: 'string', description: 'Customer password' },
          billing: {
            type: 'object',
            properties: {
              first_name: { type: 'string' },
              last_name: { type: 'string' },
              company: { type: 'string' },
              address_1: { type: 'string' },
              address_2: { type: 'string' },
              city: { type: 'string' },
              state: { type: 'string' },
              postcode: { type: 'string' },
              country: { type: 'string' },
              email: { type: 'string' },
              phone: { type: 'string' },
            },
            description: 'Billing address',
          },
          shipping: {
            type: 'object',
            properties: {
              first_name: { type: 'string' },
              last_name: { type: 'string' },
              company: { type: 'string' },
              address_1: { type: 'string' },
              address_2: { type: 'string' },
              city: { type: 'string' },
              state: { type: 'string' },
              postcode: { type: 'string' },
              country: { type: 'string' },
            },
            description: 'Shipping address',
          },
          meta_data: {
            type: 'array',
            items: { type: 'object', properties: { key: { type: 'string' }, value: {} } },
            description: 'Meta data',
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
              email: z.string().email().optional(),
              first_name: z.string().optional(),
              last_name: z.string().optional(),
              username: z.string().optional(),
              password: z.string().optional(),
              billing: billingSchema.optional(),
              shipping: shippingSchema.optional(),
              meta_data: z.array(metaDataSchema).optional(),
            }),
            args,
          );
          const client = getClient();
          const { id, ...data } = v;
          const { data: result } = await client.put(`customers/${id}`, data);
          return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
        }),
    },
    {
      name: 'customers_delete',
      description: 'Delete a customer',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'Customer ID' },
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
          const { data } = await client.delete(`customers/${v.id}`, params);
          return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        }),
    },
    {
      name: 'customers_batch',
      description: 'Batch create, update, and delete customers',
      inputSchema: {
        type: 'object',
        properties: {
          create: {
            type: 'array',
            items: { type: 'object' },
            description: 'Array of customers to create',
          },
          update: {
            type: 'array',
            items: { type: 'object' },
            description: 'Array of customers to update',
          },
          delete: {
            type: 'array',
            items: { type: 'integer' },
            description: 'Array of customer IDs to delete',
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
              delete: z.array(z.number().int()).optional(),
            }),
            args,
          );
          const client = getClient();
          const { data } = await client.post('customers/batch', v);
          return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        }),
    },
  ],
});
