import dotenv from 'dotenv';
import { isIPv4 } from 'net';
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
  'configurator',
  'panel',
  'media',
] as const;

export type ToolGroup = (typeof ALL_GROUPS)[number];

let cachedEnabledGroups: ToolGroupConfig[] | null = null;

export function getEnabledGroups(): ToolGroupConfig[] {
  if (cachedEnabledGroups) return cachedEnabledGroups;

  const enabledStr = process.env.WC_TOOL_GROUPS || 'all';
  const enabledList = enabledStr.split(',').map((s) => s.trim().toLowerCase());

  cachedEnabledGroups = ALL_GROUPS.map((name) => ({
    name,
    enabled: enabledList.includes(name) || enabledList.includes('all'),
  }));
  return cachedEnabledGroups;
}

export function resetEnabledGroups(): void {
  cachedEnabledGroups = null;
}

export interface Config {
  url: string;
  consumerKey: string;
  consumerSecret: string;
  wpAppUsername: string;
  wpAppPassword: string;
  pcbApiSecret: string;
  readOnly: boolean;
  timeout: number;
  retryCount: number;
  blockPrivateIps: boolean;
}

export function getConfig(): Config {
  const url = process.env.WOOCOMMERCE_URL || '';
  const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY || '';
  const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET || '';

  if (!url) throw new Error('WOOCOMMERCE_URL is required');
  if (!consumerKey) throw new Error('WOOCOMMERCE_CONSUMER_KEY is required');
  if (!consumerSecret) throw new Error('WOOCOMMERCE_CONSUMER_SECRET is required');

  const wpAppUsername = process.env.WP_APP_USERNAME || '';
  const wpAppPassword = process.env.WP_APP_PASSWORD || '';
  const pcbApiSecret = process.env.PCB_API_SECRET || '';

  // Enforce HTTPS
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`WOOCOMMERCE_URL is not a valid URL: '${url}'`);
  }
  if (parsed.protocol !== 'https:') {
    throw new Error('WOOCOMMERCE_URL must use HTTPS');
  }

  // Block private IPs (SSRF protection)
  const blockPrivateIps = process.env.WC_BLOCK_PRIVATE_IPS !== 'false';
  if (blockPrivateIps) {
    const hostname = parsed.hostname;

    if (isIPv4(hostname)) {
      const firstOctet = parseInt(hostname.split('.')[0], 10);
      const secondOctet = parseInt(hostname.split('.')[1] || '0', 10);
      const isPrivate =
        hostname === '127.0.0.1' ||
        hostname === '0.0.0.0' ||
        firstOctet === 10 ||
        (firstOctet === 172 && secondOctet >= 16 && secondOctet <= 31) ||
        (firstOctet === 192 && secondOctet === 168);

      if (isPrivate) {
        throw new Error(`Private IP '${hostname}' is not allowed for WOOCOMMERCE_URL`);
      }
    } else if (hostname.includes(':')) {
      const lower = hostname.toLowerCase();
      const isPrivateIPv6 =
        lower === '::1' ||
        lower.startsWith('fc') ||
        lower.startsWith('fd') ||
        lower.startsWith('fe8') ||
        lower.startsWith('fe9') ||
        lower.startsWith('fea') ||
        lower.startsWith('feb');

      if (isPrivateIPv6) {
        throw new Error(`Private IPv6 address '${hostname}' is not allowed for WOOCOMMERCE_URL`);
      }
    }
  }

  // Optional SSRF protection — allowed domains list
  const allowedDomains = process.env.WC_ALLOWED_DOMAINS;
  if (allowedDomains) {
    const domains = allowedDomains
      .split(',')
      .map((d) => d.trim().toLowerCase())
      .filter(Boolean);
    if (domains.length > 0 && !domains.includes(parsed.hostname)) {
      throw new Error(
        `Domain '${parsed.hostname}' is not in WC_ALLOWED_DOMAINS list. Allowed: ${domains.join(', ')}`,
      );
    }
  }

  return {
    url: parsed.origin,
    consumerKey,
    consumerSecret,
    wpAppUsername,
    wpAppPassword,
    pcbApiSecret,
    readOnly: process.env.WC_READ_ONLY?.toLowerCase() === 'true',
    timeout: Math.max(1, parseInt(process.env.WC_TIMEOUT_MS || '15000', 10) || 15000),
    retryCount: Math.max(0, parseInt(process.env.WC_RETRY_COUNT || '3', 10) || 3),
    blockPrivateIps,
  };
}
