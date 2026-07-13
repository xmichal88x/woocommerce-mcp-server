import axios, { type AxiosInstance } from 'axios';
import { getConfig } from './config.js';
import { withRetry } from './retry.js';
import type { ApiResponse } from './types.js';

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
      ...(config.wpAppUsername
        ? { auth: { username: config.wpAppUsername, password: config.wpAppPassword } }
        : {}),
    }),
  );
  return wpClient;
}

export function resetWpClient(): void {
  wpClient = null;
}

export async function pluginGet<T = unknown>(
  endpoint: string,
  params?: Record<string, unknown>,
): Promise<ApiResponse<T>> {
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
): Promise<ApiResponse<T>> {
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
): Promise<ApiResponse<T>> {
  const client = getPanelClient();
  const response = await client.put<T>(endpoint, data);
  return {
    data: response.data,
    headers: response.headers as Record<string, string | string[] | undefined>,
    status: response.status,
  };
}

export async function pluginDelete<T = unknown>(endpoint: string): Promise<ApiResponse<T>> {
  const client = getPanelClient();
  const response = await client.delete<T>(endpoint);
  return {
    data: response.data,
    headers: response.headers as Record<string, string | string[] | undefined>,
    status: response.status,
  };
}
