import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('dotenv', () => ({ default: { config: vi.fn() } }));

describe('getConfig', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('WOOCOMMERCE_URL', 'https://test.store.com');
    vi.stubEnv('WOOCOMMERCE_CONSUMER_KEY', 'ck_test');
    vi.stubEnv('WOOCOMMERCE_CONSUMER_SECRET', 'cs_test');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('throws when WOOCOMMERCE_URL is missing', async () => {
    vi.stubEnv('WOOCOMMERCE_URL', '');
    const { getConfig } = await import('../src/config.js');
    expect(() => getConfig()).toThrow('WOOCOMMERCE_URL is required');
  });

  it('throws when WOOCOMMERCE_CONSUMER_KEY is missing', async () => {
    vi.stubEnv('WOOCOMMERCE_CONSUMER_KEY', '');
    const { getConfig } = await import('../src/config.js');
    expect(() => getConfig()).toThrow('WOOCOMMERCE_CONSUMER_KEY is required');
  });

  it('throws when WOOCOMMERCE_CONSUMER_SECRET is missing', async () => {
    vi.stubEnv('WOOCOMMERCE_CONSUMER_SECRET', '');
    const { getConfig } = await import('../src/config.js');
    expect(() => getConfig()).toThrow('WOOCOMMERCE_CONSUMER_SECRET is required');
  });

  it('throws when URL is HTTP (not HTTPS)', async () => {
    vi.stubEnv('WOOCOMMERCE_URL', 'http://test.store.com');
    const { getConfig } = await import('../src/config.js');
    expect(() => getConfig()).toThrow('WOOCOMMERCE_URL must use HTTPS');
  });

  it('returns correct config with valid env vars', async () => {
    const { getConfig } = await import('../src/config.js');
    const config = getConfig();
    expect(config).toMatchObject({
      url: 'https://test.store.com',
      consumerKey: 'ck_test',
      consumerSecret: 'cs_test',
      readOnly: false,
    });
    expect(config.timeout).toBe(15000);
    expect(config.retryCount).toBe(3);
  });
});

describe('getEnabledGroups', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns all groups when WC_TOOL_GROUPS=all', async () => {
    vi.stubEnv('WC_TOOL_GROUPS', 'all');
    const { getEnabledGroups } = await import('../src/config.js');
    const groups = getEnabledGroups();
    expect(groups.length).toBeGreaterThan(0);
    expect(groups.every((g) => g.enabled)).toBe(true);
  });

  it('returns only specified groups when WC_TOOL_GROUPS=products,orders', async () => {
    vi.stubEnv('WC_TOOL_GROUPS', 'products,orders');
    const { getEnabledGroups } = await import('../src/config.js');
    const groups = getEnabledGroups();
    const enabled = groups.filter((g) => g.enabled).map((g) => g.name);
    expect(enabled).toEqual(['products', 'orders']);
    const disabled = groups.filter((g) => !g.enabled).map((g) => g.name);
    expect(disabled).not.toContain('products');
    expect(disabled).not.toContain('orders');
  });

  it('defaults to all groups when env var is empty string', async () => {
    vi.stubEnv('WC_TOOL_GROUPS', '');
    const { getEnabledGroups } = await import('../src/config.js');
    const groups = getEnabledGroups();
    expect(groups.every((g) => g.enabled)).toBe(true);
  });
});
