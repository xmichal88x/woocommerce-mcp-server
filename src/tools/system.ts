import { registerGroup } from '../groups.js';
import { getClient } from '../client.js';
import { safeError } from '../errors.js';
import { extractPagination } from '../types.js';

registerGroup({
  name: 'system',
  tools: [
    {
      name: 'system_status',
      description: 'Get WooCommerce system status (store info, environment, database, etc.)',
      inputSchema: {
        type: 'object',
        properties: {},
      },
      handler: async () => {
        try {
          const client = getClient();
          const { data } = await client.get('system_status', {});
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
      name: 'system_status_tools',
      description: 'Get system status tools',
      inputSchema: {
        type: 'object',
        properties: {},
      },
      handler: async () => {
        try {
          const client = getClient();
          const { data } = await client.get('system_status/tools', {});
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
      name: 'system_data',
      description: 'Get WooCommerce data overview',
      inputSchema: {
        type: 'object',
        properties: {},
      },
      handler: async () => {
        try {
          const client = getClient();
          const { data } = await client.get('data', {});
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
      name: 'system_continents',
      description: 'Get list of continents with countries',
      inputSchema: {
        type: 'object',
        properties: {},
      },
      handler: async () => {
        try {
          const client = getClient();
          const { data } = await client.get('data/continents', {});
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
      name: 'system_countries',
      description: 'Get list of countries and states',
      inputSchema: {
        type: 'object',
        properties: {},
      },
      handler: async () => {
        try {
          const client = getClient();
          const { data } = await client.get('data/countries', {});
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
      name: 'system_currencies',
      description: 'Get list of available currencies',
      inputSchema: {
        type: 'object',
        properties: {},
      },
      handler: async () => {
        try {
          const client = getClient();
          const { data } = await client.get('data/currencies', {});
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
      name: 'system_current_currency',
      description: 'Get current store currency details',
      inputSchema: {
        type: 'object',
        properties: {},
      },
      handler: async () => {
        try {
          const client = getClient();
          const { data } = await client.get('data/currencies/current', {});
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
      name: 'system_settings',
      description: 'Get general store settings',
      inputSchema: {
        type: 'object',
        properties: {
          page: { type: 'integer', description: 'Page number' },
          per_page: { type: 'integer', description: 'Items per page (max 100)', default: 10 },
        },
      },
      handler: async (args) => {
        try {
          const client = getClient();
          const params: Record<string, unknown> = { ...args };
          const { data, headers } = await client.get('settings/general', params);
          const pagination = extractPagination(headers as Record<string, string | undefined>);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  { settings: data, total: pagination.total, totalPages: pagination.totalPages },
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
      name: 'system_payment_gateways',
      description: 'Get list of payment gateways',
      inputSchema: {
        type: 'object',
        properties: {},
      },
      handler: async () => {
        try {
          const client = getClient();
          const { data } = await client.get('payment_gateways', {});
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
