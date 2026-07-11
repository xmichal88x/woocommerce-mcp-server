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
  name: 'orders',
  tools: [
    // ── Orders CRUD ──
    {
      name: 'orders_list',
      description: 'List orders with optional filtering',
      inputSchema: {
        type: 'object',
        properties: {
          page: { type: 'integer', description: 'Page number' },
          per_page: { type: 'integer', description: 'Items per page (max 100)', default: 10 },
          search: { type: 'string', description: 'Search term' },
          after: {
            type: 'string',
            description: 'Limit to orders created after this date (ISO 8601)',
          },
          before: {
            type: 'string',
            description: 'Limit to orders created before this date (ISO 8601)',
          },
          status: {
            type: 'string',
            description:
              'Order status (e.g. pending, processing, on-hold, completed, cancelled, refunded, failed, trash)',
          },
          customer: { type: 'integer', description: 'Filter by customer ID' },
          product: { type: 'integer', description: 'Filter by product ID' },
          orderby: {
            type: 'string',
            enum: ['date', 'id', 'title', 'slug', 'total'],
            description: 'Sort field',
          },
          order: { type: 'string', enum: ['asc', 'desc'], description: 'Sort direction' },
        },
      },
      handler: async (args) => {
        try {
          const client = getClient();
          const params: Record<string, unknown> = { ...args };
          const { data, headers } = await client.get('orders', params);
          const pagination = extractPagination(headers as Record<string, string | undefined>);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  { orders: data, total: pagination.total, totalPages: pagination.totalPages },
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
      name: 'orders_get',
      description: 'Get a single order by ID',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'Order ID' },
        },
        required: ['id'],
      },
      handler: async (args) => {
        try {
          const client = getClient();
          const { data } = await client.get(`orders/${args.id}`, {});
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
      name: 'orders_create',
      description: 'Create a new order',
      inputSchema: {
        type: 'object',
        properties: {
          customer_id: { type: 'integer', description: 'Customer ID' },
          payment_method: { type: 'string', description: 'Payment method ID' },
          payment_method_title: { type: 'string', description: 'Payment method title' },
          set_paid: { type: 'boolean', description: 'Set order as paid immediately' },
          status: {
            type: 'string',
            description: 'Order status (e.g. pending, processing, on-hold, completed)',
          },
          currency: { type: 'string', description: 'Currency code (e.g. USD, EUR, GBP)' },
          customer_note: { type: 'string', description: 'Customer note' },
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
          line_items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                product_id: { type: 'integer' },
                variation_id: { type: 'integer' },
                quantity: { type: 'integer' },
                price: { type: 'string' },
              },
            },
            description: 'Line items',
          },
          shipping_lines: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                method_id: { type: 'string' },
                method_title: { type: 'string' },
                total: { type: 'string' },
              },
            },
            description: 'Shipping lines',
          },
          coupon_lines: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                code: { type: 'string' },
              },
            },
            description: 'Coupon lines',
          },
          meta_data: {
            type: 'array',
            items: { type: 'object', properties: { key: { type: 'string' }, value: {} } },
            description: 'Meta data',
          },
        },
      },
      handler: async (args) => {
        if (isReadOnly()) return readOnlyError();
        try {
          const client = getClient();
          const { data } = await client.post('orders', args);
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
      name: 'orders_update',
      description: 'Update an existing order',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'Order ID' },
          customer_id: { type: 'integer', description: 'Customer ID' },
          payment_method: { type: 'string', description: 'Payment method ID' },
          payment_method_title: { type: 'string', description: 'Payment method title' },
          status: {
            type: 'string',
            description: 'Order status (e.g. pending, processing, on-hold, completed)',
          },
          currency: { type: 'string', description: 'Currency code (e.g. USD, EUR, GBP)' },
          customer_note: { type: 'string', description: 'Customer note' },
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
          line_items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                product_id: { type: 'integer' },
                variation_id: { type: 'integer' },
                quantity: { type: 'integer' },
                price: { type: 'string' },
              },
            },
            description: 'Line items',
          },
          shipping_lines: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                method_id: { type: 'string' },
                method_title: { type: 'string' },
                total: { type: 'string' },
              },
            },
            description: 'Shipping lines',
          },
          coupon_lines: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                code: { type: 'string' },
              },
            },
            description: 'Coupon lines',
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
          const { data: result } = await client.put(`orders/${id}`, data);
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
      name: 'orders_delete',
      description: 'Delete an order',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'Order ID' },
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
          const { data } = await client.delete(`orders/${args.id}`, params);
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
      name: 'orders_batch',
      description: 'Batch create, update, and delete orders',
      inputSchema: {
        type: 'object',
        properties: {
          create: {
            type: 'array',
            items: { type: 'object' },
            description: 'Array of orders to create',
          },
          update: {
            type: 'array',
            items: { type: 'object' },
            description: 'Array of orders to update',
          },
          delete: {
            type: 'array',
            items: { type: 'integer' },
            description: 'Array of order IDs to delete',
          },
        },
      },
      handler: async (args) => {
        if (isReadOnly()) return readOnlyError();
        try {
          const client = getClient();
          const { data } = await client.post('orders/batch', args);
          return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        } catch (error) {
          return {
            content: [{ type: 'text', text: JSON.stringify(safeError(error), null, 2) }],
            isError: true,
          };
        }
      },
    },

    // ── Order Notes ──
    {
      name: 'orders_notes_list',
      description: 'List notes for an order',
      inputSchema: {
        type: 'object',
        properties: {
          order_id: { type: 'integer', description: 'Order ID' },
          page: { type: 'integer', description: 'Page number' },
          per_page: { type: 'integer', description: 'Items per page (max 100)', default: 10 },
        },
        required: ['order_id'],
      },
      handler: async (args) => {
        try {
          const client = getClient();
          const { order_id, ...params } = args;
          const { data, headers } = await client.get(`orders/${order_id}/notes`, params);
          const pagination = extractPagination(headers as Record<string, string | undefined>);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  { notes: data, total: pagination.total, totalPages: pagination.totalPages },
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
      name: 'orders_notes_create',
      description: 'Create a note for an order',
      inputSchema: {
        type: 'object',
        properties: {
          order_id: { type: 'integer', description: 'Order ID' },
          note: { type: 'string', description: 'Note content' },
          customer_note: {
            type: 'boolean',
            description: 'If true, the note will be shown to customers',
            default: false,
          },
        },
        required: ['order_id', 'note'],
      },
      handler: async (args) => {
        if (isReadOnly()) return readOnlyError();
        try {
          const client = getClient();
          const { order_id, ...data } = args;
          const { data: result } = await client.post(`orders/${order_id}/notes`, data);
          return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
        } catch (error) {
          return {
            content: [{ type: 'text', text: JSON.stringify(safeError(error), null, 2) }],
            isError: true,
          };
        }
      },
    },

    // ── Order Refunds ──
    {
      name: 'orders_refunds_list',
      description: 'List refunds for an order',
      inputSchema: {
        type: 'object',
        properties: {
          order_id: { type: 'integer', description: 'Order ID' },
          page: { type: 'integer', description: 'Page number' },
          per_page: { type: 'integer', description: 'Items per page (max 100)', default: 10 },
        },
        required: ['order_id'],
      },
      handler: async (args) => {
        try {
          const client = getClient();
          const { order_id, ...params } = args;
          const { data, headers } = await client.get(`orders/${order_id}/refunds`, params);
          const pagination = extractPagination(headers as Record<string, string | undefined>);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  { refunds: data, total: pagination.total, totalPages: pagination.totalPages },
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
      name: 'orders_refunds_get',
      description: 'Get a single refund for an order',
      inputSchema: {
        type: 'object',
        properties: {
          order_id: { type: 'integer', description: 'Order ID' },
          refund_id: { type: 'integer', description: 'Refund ID' },
        },
        required: ['order_id', 'refund_id'],
      },
      handler: async (args) => {
        try {
          const client = getClient();
          const { data } = await client.get(
            `orders/${args.order_id}/refunds/${args.refund_id}`,
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
      name: 'orders_refunds_create',
      description: 'Create a refund for an order',
      inputSchema: {
        type: 'object',
        properties: {
          order_id: { type: 'integer', description: 'Order ID' },
          amount: { type: 'string', description: 'Refund amount' },
          reason: { type: 'string', description: 'Reason for the refund' },
          refund_payment: {
            type: 'boolean',
            description: 'If true, attempt to refund via the payment gateway',
            default: false,
          },
          api_refund: {
            type: 'boolean',
            description: 'If true, the refund is performed via the payment gateway API',
            default: true,
          },
          line_items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                quantity: { type: 'integer' },
                refund_total: { type: 'string' },
                refund_tax: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: { id: { type: 'integer' }, refund_total: { type: 'string' } },
                  },
                },
              },
            },
            description: 'Line items to refund',
          },
          meta_data: {
            type: 'array',
            items: { type: 'object', properties: { key: { type: 'string' }, value: {} } },
            description: 'Meta data',
          },
        },
        required: ['order_id', 'amount'],
      },
      handler: async (args) => {
        if (isReadOnly()) return readOnlyError();
        try {
          const client = getClient();
          const { order_id, ...data } = args;
          const { data: result } = await client.post(`orders/${order_id}/refunds`, data);
          return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
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
