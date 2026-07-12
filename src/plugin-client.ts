import axios, { type AxiosInstance } from 'axios';
import { getConfig } from './config.js';

function withRetry(instance: AxiosInstance): AxiosInstance {
  const config = getConfig();
  if (config.retryCount <= 0) return instance;

  return new Proxy(instance, {
    get(target, prop) {
      const original = target[prop as keyof AxiosInstance];
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

let panelClient: AxiosInstance | null = null;

function getPanelClient(): AxiosInstance {
  if (panelClient) return panelClient;
  const config = getConfig();
  panelClient = withRetry(
    axios.create({
      baseURL: `${config.url}/wp-json/panel/v1/`,
      timeout: config.timeout,
      headers: config.pcbApiSecret ? { 'X-PANEL-KEY': config.pcbApiSecret } : {},
    }),
  );
  return panelClient;
}

export function resetPanelClient(): void {
  panelClient = null;
}

let wpClient: AxiosInstance | null = null;

export function getWpClient(): AxiosInstance {
  if (wpClient) return wpClient;
  const config = getConfig();
  wpClient = withRetry(
    axios.create({
      baseURL: `${config.url}/wp-json/wp/v2/`,
      timeout: config.timeout,
      auth: { username: config.wpAppUsername, password: config.wpAppPassword },
    }),
  );
  return wpClient;
}

export function resetWpClient(): void {
  wpClient = null;
}

interface PluginResponse<T = unknown> {
  data: T;
  headers: Record<string, string | string[] | undefined>;
  status: number;
}

export async function pluginGet<T = unknown>(
  endpoint: string,
  params?: Record<string, unknown>,
): Promise<PluginResponse<T>> {
  const client = getPanelClient();
  const response = await client.get<T>(endpoint, { params });
  return {
    data: response.data,
    headers: response.headers as Record<string, string | string[] | undefined>,
    status: response.status,
  };
}

export async function pluginPost<T = unknown>(
  endpoint: string,
  data?: Record<string, unknown>,
): Promise<PluginResponse<T>> {
  const client = getPanelClient();
  const response = await client.post<T>(endpoint, data);
  return {
    data: response.data,
    headers: response.headers as Record<string, string | string[] | undefined>,
    status: response.status,
  };
}

export async function pluginPut<T = unknown>(
  endpoint: string,
  data?: Record<string, unknown>,
): Promise<PluginResponse<T>> {
  const client = getPanelClient();
  const response = await client.put<T>(endpoint, data);
  return {
    data: response.data,
    headers: response.headers as Record<string, string | string[] | undefined>,
    status: response.status,
  };
}

export async function pluginDelete<T = unknown>(endpoint: string): Promise<PluginResponse<T>> {
  const client = getPanelClient();
  const response = await client.delete<T>(endpoint);
  return {
    data: response.data,
    headers: response.headers as Record<string, string | string[] | undefined>,
    status: response.status,
  };
}
