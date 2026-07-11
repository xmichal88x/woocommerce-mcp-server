import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('dotenv', () => ({ default: { config: vi.fn() } }));

describe('getClient', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('WOOCOMMERCE_URL', 'https://test.store.com');
    vi.stubEnv('WOOCOMMERCE_CONSUMER_KEY', 'ck_test');
    vi.stubEnv('WOOCOMMERCE_CONSUMER_SECRET', 'cs_test');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('creates a singleton (same instance on repeated calls)', async () => {
    const { getClient } = await import('../src/client.js');
    const client1 = getClient();
    const client2 = getClient();
    expect(client1).toBe(client2);
  });

  it('returns a valid WooCommerceRestApi instance', async () => {
    const { getClient } = await import('../src/client.js');
    const client = getClient();
    expect(client).toBeDefined();
    expect(typeof client.get).toBe('function');
    expect(typeof client.post).toBe('function');
    expect(typeof client.put).toBe('function');
    expect(typeof client.delete).toBe('function');
  });
});

describe('isReadOnly', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('WOOCOMMERCE_URL', 'https://test.store.com');
    vi.stubEnv('WOOCOMMERCE_CONSUMER_KEY', 'ck_test');
    vi.stubEnv('WOOCOMMERCE_CONSUMER_SECRET', 'cs_test');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns false when WC_READ_ONLY is not set', async () => {
    const { isReadOnly } = await import('../src/client.js');
    expect(isReadOnly()).toBe(false);
  });

  it('returns true when WC_READ_ONLY=true', async () => {
    vi.stubEnv('WC_READ_ONLY', 'true');
    const { isReadOnly } = await import('../src/client.js');
    expect(isReadOnly()).toBe(true);
  });
});
