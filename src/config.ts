import dotenv from 'dotenv';
dotenv.config();

export interface ToolGroupConfig {
  name: string;
  enabled: boolean;
}

const ALL_GROUPS = [
  'products',
  'orders',
  'customers',
  'coupons',
  'shipping',
  'taxes',
  'reports',
  'system',
  'email',
] as const;

export type ToolGroup = (typeof ALL_GROUPS)[number];

export function getEnabledGroups(): ToolGroupConfig[] {
  const enabledStr = process.env.WC_TOOL_GROUPS || 'all';
  const enabledList = enabledStr.split(',').map((s) => s.trim().toLowerCase());

  return ALL_GROUPS.map((name) => ({
    name,
    enabled: enabledList.includes(name) || enabledList.includes('all'),
  }));
}

export interface Config {
  url: string;
  consumerKey: string;
  consumerSecret: string;
  readOnly: boolean;
  timeout: number;
  retryCount: number;
}

export function getConfig(): Config {
  const url = process.env.WOOCOMMERCE_URL || '';
  const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY || '';
  const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET || '';

  if (!url) throw new Error('WOOCOMMERCE_URL is required');
  if (!consumerKey) throw new Error('WOOCOMMERCE_CONSUMER_KEY is required');
  if (!consumerSecret) throw new Error('WOOCOMMERCE_CONSUMER_SECRET is required');

  // Enforce HTTPS
  const parsed = new URL(url);
  if (parsed.protocol !== 'https:') {
    throw new Error('WOOCOMMERCE_URL must use HTTPS');
  }

  return {
    url: parsed.origin,
    consumerKey,
    consumerSecret,
    readOnly: process.env.WC_READ_ONLY === 'true',
    timeout: parseInt(process.env.WC_TIMEOUT_MS || '15000', 10),
    retryCount: parseInt(process.env.WC_RETRY_COUNT || '3', 10),
  };
}
