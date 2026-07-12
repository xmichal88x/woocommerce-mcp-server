import WooCommerceRestApiModule from '@woocommerce/woocommerce-rest-api';
import type { IWooCommerceRestApiOptions } from '@woocommerce/woocommerce-rest-api';
import { getConfig } from './config.js';

// CJS/ESM compat: index.js exports { default: class }, index.mjs exports default class
const WooCommerceRestApi =
  (WooCommerceRestApiModule as Record<string, unknown>).default ?? WooCommerceRestApiModule;

interface WooCommerceClient {
  get(
    endpoint: string,
    params?: Record<string, unknown>,
  ): Promise<{
    data: unknown;
    headers: Record<string, string | string[] | undefined>;
    status: number;
  }>;
  post(
    endpoint: string,
    data: Record<string, unknown>,
    params?: Record<string, unknown>,
  ): Promise<{
    data: unknown;
    headers: Record<string, string | string[] | undefined>;
    status: number;
  }>;
  put(
    endpoint: string,
    data: Record<string, unknown>,
    params?: Record<string, unknown>,
  ): Promise<{
    data: unknown;
    headers: Record<string, string | string[] | undefined>;
    status: number;
  }>;
  delete(
    endpoint: string,
    params?: Record<string, unknown>,
  ): Promise<{
    data: unknown;
    headers: Record<string, string | string[] | undefined>;
    status: number;
  }>;
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
  };

  const api = new (WooCommerceRestApi as unknown as new (
    opt: IWooCommerceRestApiOptions,
  ) => WooCommerceClient)(options);

  if (config.retryCount > 0) {
    return new Proxy(api, {
      get(target, prop) {
        const original = target[prop as keyof WooCommerceClient];
        if (typeof original !== 'function') return original;

        return async (...args: unknown[]) => {
          let lastError: unknown;
          for (let attempt = 0; attempt <= config.retryCount; attempt++) {
            try {
              return await Reflect.apply(original, target, args);
            } catch (error) {
              const status =
                (error as { response?: { status?: number } })?.response?.status ??
                (error as { status?: number })?.status;
              if (status !== undefined && status >= 400 && status < 500) {
                throw error;
              }
              lastError = error;
              if (attempt < config.retryCount) {
                await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 500));
              }
            }
          }
          throw lastError;
        };
      },
    });
  }

  return api;
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
