import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGetClient = vi.fn();
const mockIsReadOnly = vi.fn();

vi.mock('../../src/client.js', () => ({
  getClient: mockGetClient,
  isReadOnly: mockIsReadOnly,
}));

const MOCK_TOTAL = '1';
const MOCK_TOTAL_PAGES = '1';
const MOCK_PRODUCT = { id: 1, name: 'Test Product', price: '10.00' };
const MOCK_PRODUCTS = [MOCK_PRODUCT];

function mockClient() {
  mockGetClient.mockReturnValue({
    get: vi.fn().mockResolvedValue({
      data: MOCK_PRODUCTS,
      headers: { 'x-wp-total': MOCK_TOTAL, 'x-wp-totalpages': MOCK_TOTAL_PAGES },
    }),
    post: vi.fn().mockResolvedValue({ data: MOCK_PRODUCT }),
    put: vi.fn().mockResolvedValue({ data: MOCK_PRODUCT }),
    delete: vi.fn().mockResolvedValue({ data: MOCK_PRODUCT }),
  });
}

function mockReadOnlyClient() {
  mockGetClient.mockReturnValue({
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('products tools', () => {
  it('products_list handler returns expected structure', async () => {
    mockClient();
    mockIsReadOnly.mockReturnValue(false);

    await import('../../src/tools/products.js');
    const { getActiveTools } = await import('../../src/groups.js');

    const tool = getActiveTools().find((t) => t.name === 'products_list');
    expect(tool).toBeDefined();

    const result = await tool!.handler({});
    expect(result).toHaveProperty('content');
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content[0].type).toBe('text');
    expect(result.content[0].text).toBeTruthy();
    expect(result.isError).toBeUndefined();
  });

  it('products_get handler returns expected structure', async () => {
    mockClient();
    mockIsReadOnly.mockReturnValue(false);

    await import('../../src/tools/products.js');
    const { getActiveTools } = await import('../../src/groups.js');

    const tool = getActiveTools().find((t) => t.name === 'products_get');
    expect(tool).toBeDefined();

    const result = await tool!.handler({ id: 1 });
    expect(result.content[0].type).toBe('text');
    expect(result.isError).toBeUndefined();
  });

  it('products_create is blocked by read-only guard', async () => {
    mockClient();
    mockIsReadOnly.mockReturnValue(true);

    await import('../../src/tools/products.js');
    const { getActiveTools } = await import('../../src/groups.js');

    const tool = getActiveTools().find((t) => t.name === 'products_create');
    expect(tool).toBeDefined();

    const result = await tool!.handler({ name: 'Test' });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('READ_ONLY');
  });

  it('products_update is blocked by read-only guard', async () => {
    mockClient();
    mockIsReadOnly.mockReturnValue(true);

    await import('../../src/tools/products.js');
    const { getActiveTools } = await import('../../src/groups.js');

    const tool = getActiveTools().find((t) => t.name === 'products_update');
    expect(tool).toBeDefined();

    const result = await tool!.handler({ id: 1, name: 'Updated' });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('READ_ONLY');
  });

  it('products_delete is blocked by read-only guard', async () => {
    mockClient();
    mockIsReadOnly.mockReturnValue(true);

    await import('../../src/tools/products.js');
    const { getActiveTools } = await import('../../src/groups.js');

    const tool = getActiveTools().find((t) => t.name === 'products_delete');
    expect(tool).toBeDefined();

    const result = await tool!.handler({ id: 1 });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('READ_ONLY');
  });

  it('read-only tools work when read-only is false', async () => {
    mockClient();
    mockIsReadOnly.mockReturnValue(false);

    await import('../../src/tools/products.js');
    const { getActiveTools } = await import('../../src/groups.js');

    const createTool = getActiveTools().find((t) => t.name === 'products_create');
    const result = await createTool!.handler({ name: 'Test' });
    expect(result.isError).toBeUndefined();
  });

  it('handles client error gracefully', async () => {
    mockGetClient.mockReturnValue({
      get: vi.fn().mockRejectedValue(new Error('API Error')),
    });
    mockIsReadOnly.mockReturnValue(false);

    await import('../../src/tools/products.js');
    const { getActiveTools } = await import('../../src/groups.js');

    const tool = getActiveTools().find((t) => t.name === 'products_list');
    const result = await tool!.handler({});
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('UNKNOWN_ERROR');
  });
});
