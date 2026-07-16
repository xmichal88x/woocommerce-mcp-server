import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { registerGroup } from '../groups.js';
import { getClient } from '../client.js';

import { extractPagination } from '../types.js';
import { z } from 'zod';
import { validateArgs, withErrorHandling } from '../utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pkg = JSON.parse(readFileSync(join(__dirname, '..', '..', 'package.json'), 'utf-8'));

registerGroup({
  name: 'system',
  tools: [
    {
      name: 'server_info',
      description: 'Get WooCommerce MCP server version info',
      inputSchema: {
        type: 'object',
        properties: {},
      },
      handler: async (_args) =>
        withErrorHandling(async () => {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    name: pkg.name,
                    version: pkg.version,
                    description: pkg.description,
                  },
                  null,
                  2,
                ),
              },
            ],
          };
        }),
    },
    {
      name: 'system_status',
      description: 'Get WooCommerce system status (store info, environment, database, etc.)',
      inputSchema: {
        type: 'object',
        properties: {},
      },
      handler: async (_args) =>
        withErrorHandling(async () => {
          const client = getClient();
          const { data } = await client.get('system_status', {});
          return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        }),
    },
    {
      name: 'system_status_tools',
      description: 'Get system status tools',
      inputSchema: {
        type: 'object',
        properties: {},
      },
      handler: async (_args) =>
        withErrorHandling(async () => {
          const client = getClient();
          const { data } = await client.get('system_status/tools', {});
          return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        }),
    },
    {
      name: 'system_data',
      description: 'Get WooCommerce data overview',
      inputSchema: {
        type: 'object',
        properties: {},
      },
      handler: async (_args) =>
        withErrorHandling(async () => {
          const client = getClient();
          const { data } = await client.get('data', {});
          return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        }),
    },
    {
      name: 'system_continents',
      description: 'Get list of continents with countries',
      inputSchema: {
        type: 'object',
        properties: {},
      },
      handler: async (_args) =>
        withErrorHandling(async () => {
          const client = getClient();
          const { data } = await client.get('data/continents', {});
          return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        }),
    },
    {
      name: 'system_countries',
      description: 'Get list of countries and states',
      inputSchema: {
        type: 'object',
        properties: {},
      },
      handler: async (_args) =>
        withErrorHandling(async () => {
          const client = getClient();
          const { data } = await client.get('data/countries', {});
          return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        }),
    },
    {
      name: 'system_currencies',
      description: 'Get list of available currencies',
      inputSchema: {
        type: 'object',
        properties: {},
      },
      handler: async (_args) =>
        withErrorHandling(async () => {
          const client = getClient();
          const { data } = await client.get('data/currencies', {});
          return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        }),
    },
    {
      name: 'system_current_currency',
      description: 'Get current store currency details',
      inputSchema: {
        type: 'object',
        properties: {},
      },
      handler: async (_args) =>
        withErrorHandling(async () => {
          const client = getClient();
          const { data } = await client.get('data/currencies/current', {});
          return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        }),
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
      handler: async (args) =>
        withErrorHandling(async () => {
          const client = getClient();
          const v = validateArgs(
            z.object({
              page: z.number().int().optional(),
              per_page: z.number().int().optional(),
            }),
            args,
          );
          const params: Record<string, unknown> = { ...v };
          const { data, headers } = await client.get('settings/general', params);
          const pagination = extractPagination(headers);
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
        }),
    },
    {
      name: 'system_payment_gateways',
      description: 'Get list of payment gateways',
      inputSchema: {
        type: 'object',
        properties: {},
      },
      handler: async (_args) =>
        withErrorHandling(async () => {
          const client = getClient();
          const { data } = await client.get('payment_gateways', {});
          return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        }),
    },
  ],
});
