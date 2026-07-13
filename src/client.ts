import WooCommerceRestApiModule from '@woocommerce/woocommerce-rest-api';
import type { IWooCommerceRestApiOptions } from '@woocommerce/woocommerce-rest-api';
import { getConfig } from './config.js';
import { withRetry } from './retry.js';
import type { ApiResponse } from './types.js';

export interface WooCommerceClient {
  get(endpoint: string, params?: Record<string, unknown>): Promise<ApiResponse<unknown>>;
  post(
    endpoint: string,
    data: Record<string, unknown>,
    params?: Record<string, unknown>,
  ): Promise<ApiResponse<unknown>>;
  put(
    endpoint: string,
    data: Record<string, unknown>,
    params?: Record<string, unknown>,
  ): Promise<ApiResponse<unknown>>;
  delete(endpoint: string, params?: Record<string, unknown>): Promise<ApiResponse<unknown>>;
}

let client: WooCommerceClient | null = null;

function getWooCommerceApi(options: IWooCommerceRestApiOptions): WooCommerceClient {
  // CJS/ESM compat: @woocommerce/woocommerce-rest-api exports default class in ESM,
  // but { default: class } in CJS (via __esModule). Nullish coalescing handles both
  // because esModuleInterop exposes .default on both formats.
  const ApiClass = (WooCommerceRestApiModule.default ??
    WooCommerceRestApiModule) as unknown as new (
    opts: IWooCommerceRestApiOptions,
  ) => WooCommerceClient;

  if (typeof ApiClass !== 'function') {
    throw new Error(
      'Failed to construct WooCommerceRestApi: module export is not a constructor function.',
    );
  }

  return new ApiClass(options);
}

function createClient(): WooCommerceClient {
  const config = getConfig();

  const options: IWooCommerceRestApiOptions = {
    url: config.url,
    consumerKey: config.consumerKey,
    consumerSecret: config.consumerSecret,
    version: 'wc/v3',
    timeout: config.timeout,
  };

  return withRetry(getWooCommerceApi(options));
}

export function getClient(): WooCommerceClient {
  if (client) return client;
  client = createClient();
  return client;
}

let cachedReadOnly: boolean | null = null;

// Check if read-only mode should block mutation
export function isReadOnly(): boolean {
  if (cachedReadOnly === null) {
    cachedReadOnly = getConfig().readOnly;
  }
  return cachedReadOnly;
}

export function resetClient(): void {
  client = null;
  cachedReadOnly = null;
}
