import { registerGroup } from '../groups.js';
import { getClient, isReadOnly } from '../client.js';
import { safeError } from '../errors.js';
import { extractPagination } from '../types.js';

function readOnlyError() {
  return {
    content: [{ type: 'text' as const, text: JSON.stringify({ code: 'READ_ONLY', message: 'Server is in read-only mode. This operation is not allowed.', actionable: false }, null, 2) }],
    isError: true,
  };
}

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
          orderby: { type: 'string', enum: ['id', 'email', 'name', 'username', 'role'], description: 'Sort field' },
          order: { type: 'string', enum: ['asc', 'desc'], description: 'Sort direction' },
        },
      },
      handler: async (args) => {
        try {
          const client = getClient();
          const params: Record<string, unknown> = { ...args };
          const { data, headers } = await client.get('customers', params);
          const pagination = extractPagination(headers as Record<string, string | undefined>);
          return { content: [{ type: 'text', text: JSON.stringify({ customers: data, total: pagination.total, totalPages: pagination.totalPages }, null, 2) }] };
        } catch (error) {
          return { content: [{ type: 'text', text: JSON.stringify(safeError(error), null, 2) }], isError: true };
        }
      },
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
      handler: async (args) => {
        try {
          const client = getClient();
          const { data } = await client.get(`customers/${args.id}`, {});
          return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        } catch (error) {
          return { content: [{ type: 'text', text: JSON.stringify(safeError(error), null, 2) }], isError: true };
        }
      },
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
              first_name: { type: 'string' }, last_name: { type: 'string' },
              company: { type: 'string' }, address_1: { type: 'string' },
              address_2: { type: 'string' }, city: { type: 'string' },
              state: { type: 'string' }, postcode: { type: 'string' },
              country: { type: 'string' }, email: { type: 'string' },
              phone: { type: 'string' },
            },
            description: 'Billing address',
          },
          shipping: {
            type: 'object',
            properties: {
              first_name: { type: 'string' }, last_name: { type: 'string' },
              company: { type: 'string' }, address_1: { type: 'string' },
              address_2: { type: 'string' }, city: { type: 'string' },
              state: { type: 'string' }, postcode: { type: 'string' },
              country: { type: 'string' },
            },
            description: 'Shipping address',
          },
          meta_data: { type: 'array', items: { type: 'object', properties: { key: { type: 'string' }, value: {} } }, description: 'Meta data' },
        },
        required: ['email'],
      },
      handler: async (args) => {
        if (isReadOnly()) return readOnlyError();
        try {
          const client = getClient();
          const { data } = await client.post('customers', args);
          return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        } catch (error) {
          return { content: [{ type: 'text', text: JSON.stringify(safeError(error), null, 2) }], isError: true };
        }
      },
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
              first_name: { type: 'string' }, last_name: { type: 'string' },
              company: { type: 'string' }, address_1: { type: 'string' },
              address_2: { type: 'string' }, city: { type: 'string' },
              state: { type: 'string' }, postcode: { type: 'string' },
              country: { type: 'string' }, email: { type: 'string' },
              phone: { type: 'string' },
            },
            description: 'Billing address',
          },
          shipping: {
            type: 'object',
            properties: {
              first_name: { type: 'string' }, last_name: { type: 'string' },
              company: { type: 'string' }, address_1: { type: 'string' },
              address_2: { type: 'string' }, city: { type: 'string' },
              state: { type: 'string' }, postcode: { type: 'string' },
              country: { type: 'string' },
            },
            description: 'Shipping address',
          },
          meta_data: { type: 'array', items: { type: 'object', properties: { key: { type: 'string' }, value: {} } }, description: 'Meta data' },
        },
        required: ['id'],
      },
      handler: async (args) => {
        if (isReadOnly()) return readOnlyError();
        try {
          const client = getClient();
          const { id, ...data } = args;
          const { data: result } = await client.put(`customers/${id}`, data);
          return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
        } catch (error) {
          return { content: [{ type: 'text', text: JSON.stringify(safeError(error), null, 2) }], isError: true };
        }
      },
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
      handler: async (args) => {
        if (isReadOnly()) return readOnlyError();
        try {
          const client = getClient();
          const params: Record<string, unknown> = {};
          if (args.force !== undefined) params.force = args.force;
          const { data } = await client.delete(`customers/${args.id}`, params);
          return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        } catch (error) {
          return { content: [{ type: 'text', text: JSON.stringify(safeError(error), null, 2) }], isError: true };
        }
      },
    },
    {
      name: 'customers_batch',
      description: 'Batch create, update, and delete customers',
      inputSchema: {
        type: 'object',
        properties: {
          create: { type: 'array', items: { type: 'object' }, description: 'Array of customers to create' },
          update: { type: 'array', items: { type: 'object' }, description: 'Array of customers to update' },
          delete: { type: 'array', items: { type: 'integer' }, description: 'Array of customer IDs to delete' },
        },
      },
      handler: async (args) => {
        if (isReadOnly()) return readOnlyError();
        try {
          const client = getClient();
          const { data } = await client.post('customers/batch', args);
          return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        } catch (error) {
          return { content: [{ type: 'text', text: JSON.stringify(safeError(error), null, 2) }], isError: true };
        }
      },
    },
  ],
});
