import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';
import type { IWooCommerceRestApiOptions } from '@woocommerce/woocommerce-rest-api';
import { getConfig } from './config.js';

interface WooCommerceClient {
  get(endpoint: string, params?: Record<string, unknown>): Promise<{ data: unknown; headers: Record<string, string | string[] | undefined>; status: number }>;
  post(endpoint: string, data: Record<string, unknown>, params?: Record<string, unknown>): Promise<{ data: unknown; headers: Record<string, string | string[] | undefined>; status: number }>;
  put(endpoint: string, data: Record<string, unknown>, params?: Record<string, unknown>): Promise<{ data: unknown; headers: Record<string, string | string[] | undefined>; status: number }>;
  delete(endpoint: string, params?: Record<string, unknown>): Promise<{ data: unknown; headers: Record<string, string | string[] | undefined>; status: number }>;
}

let client: WooCommerceClient | null = null;

function createClient(): WooCommerceClient {
  const config = getConfig();

  const options: IWooCommerceRestApiOptions = {
    url: config.url,
    consumerKey: config.consumerKey,
    consumerSecret: config.consumerSecret,
    version: 'wc/v3',
    timeout: config.timeout,
    queryStringAuth: true,
  };

  return new (WooCommerceRestApi as unknown as new (opt: IWooCommerceRestApiOptions) => WooCommerceClient)(options);
}

export function getClient(): WooCommerceClient {
  if (client) return client;
  client = createClient();
  return client;
}

// Check if read-only mode should block mutation
export function isReadOnly(): boolean {
  const { readOnly } = getConfig();
  return readOnly;
}
