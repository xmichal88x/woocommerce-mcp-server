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

  it('products_shipping_classes_list handler returns expected structure', async () => {
    mockClient();
    mockIsReadOnly.mockReturnValue(false);

    await import('../../src/tools/products.js');
    const { getActiveTools } = await import('../../src/groups.js');

    const tool = getActiveTools().find((t) => t.name === 'products_shipping_classes_list');
    expect(tool).toBeDefined();

    const result = await tool!.handler({});
    expect(result.content[0].type).toBe('text');
    expect(result.isError).toBeUndefined();
  });

  it('products_shipping_classes_list handles client error gracefully', async () => {
    mockGetClient.mockReturnValue({
      get: vi.fn().mockRejectedValue(new Error('API Error')),
    });
    mockIsReadOnly.mockReturnValue(false);

    await import('../../src/tools/products.js');
    const { getActiveTools } = await import('../../src/groups.js');

    const tool = getActiveTools().find((t) => t.name === 'products_shipping_classes_list');
    const result = await tool!.handler({});
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('UNKNOWN_ERROR');
  });

  it('products_shipping_classes_create is blocked by read-only guard', async () => {
    mockClient();
    mockIsReadOnly.mockReturnValue(true);

    await import('../../src/tools/products.js');
    const { getActiveTools } = await import('../../src/groups.js');

    const tool = getActiveTools().find((t) => t.name === 'products_shipping_classes_create');
    expect(tool).toBeDefined();

    const result = await tool!.handler({ name: 'Test Class' });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('READ_ONLY');
  });

  it('products_shipping_classes_create works when read-only is false', async () => {
    mockClient();
    mockIsReadOnly.mockReturnValue(false);

    await import('../../src/tools/products.js');
    const { getActiveTools } = await import('../../src/groups.js');

    const tool = getActiveTools().find((t) => t.name === 'products_shipping_classes_create');
    expect(tool).toBeDefined();

    const result = await tool!.handler({ name: 'Test Class' });
    expect(result.isError).toBeUndefined();
  });

  it('products_shipping_classes_update is blocked by read-only guard', async () => {
    mockClient();
    mockIsReadOnly.mockReturnValue(true);

    await import('../../src/tools/products.js');
    const { getActiveTools } = await import('../../src/groups.js');

    const tool = getActiveTools().find((t) => t.name === 'products_shipping_classes_update');
    expect(tool).toBeDefined();

    const result = await tool!.handler({ id: 1, name: 'Updated Class' });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('READ_ONLY');
  });

  it('products_shipping_classes_update works when read-only is false', async () => {
    mockClient();
    mockIsReadOnly.mockReturnValue(false);

    await import('../../src/tools/products.js');
    const { getActiveTools } = await import('../../src/groups.js');

    const tool = getActiveTools().find((t) => t.name === 'products_shipping_classes_update');
    expect(tool).toBeDefined();

    const result = await tool!.handler({ id: 1, name: 'Updated Class' });
    expect(result.isError).toBeUndefined();
  });

  it('products_shipping_classes_delete is blocked by read-only guard', async () => {
    mockClient();
    mockIsReadOnly.mockReturnValue(true);

    await import('../../src/tools/products.js');
    const { getActiveTools } = await import('../../src/groups.js');

    const tool = getActiveTools().find((t) => t.name === 'products_shipping_classes_delete');
    expect(tool).toBeDefined();

    const result = await tool!.handler({ id: 1 });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('READ_ONLY');
  });

  it('products_shipping_classes_delete works when read-only is false', async () => {
    mockClient();
    mockIsReadOnly.mockReturnValue(false);

    await import('../../src/tools/products.js');
    const { getActiveTools } = await import('../../src/groups.js');

    const tool = getActiveTools().find((t) => t.name === 'products_shipping_classes_delete');
    expect(tool).toBeDefined();

    const result = await tool!.handler({ id: 1 });
    expect(result.isError).toBeUndefined();
  });

  it('products_attributes_terms_update is blocked by read-only guard', async () => {
    mockClient();
    mockIsReadOnly.mockReturnValue(true);

    await import('../../src/tools/products.js');
    const { getActiveTools } = await import('../../src/groups.js');

    const tool = getActiveTools().find((t) => t.name === 'products_attributes_terms_update');
    expect(tool).toBeDefined();

    const result = await tool!.handler({ attribute_id: 1, term_id: 1, name: 'Updated Term' });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('READ_ONLY');
  });

  it('products_attributes_terms_update works when read-only is false', async () => {
    mockClient();
    mockIsReadOnly.mockReturnValue(false);

    await import('../../src/tools/products.js');
    const { getActiveTools } = await import('../../src/groups.js');

    const tool = getActiveTools().find((t) => t.name === 'products_attributes_terms_update');
    expect(tool).toBeDefined();

    const result = await tool!.handler({ attribute_id: 1, term_id: 1, name: 'Updated Term' });
    expect(result.isError).toBeUndefined();
  });

  it('products_attributes_terms_delete is blocked by read-only guard', async () => {
    mockClient();
    mockIsReadOnly.mockReturnValue(true);

    await import('../../src/tools/products.js');
    const { getActiveTools } = await import('../../src/groups.js');

    const tool = getActiveTools().find((t) => t.name === 'products_attributes_terms_delete');
    expect(tool).toBeDefined();

    const result = await tool!.handler({ attribute_id: 1, term_id: 1 });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('READ_ONLY');
  });

  it('products_attributes_terms_delete works when read-only is false', async () => {
    mockClient();
    mockIsReadOnly.mockReturnValue(false);

    await import('../../src/tools/products.js');
    const { getActiveTools } = await import('../../src/groups.js');

    const tool = getActiveTools().find((t) => t.name === 'products_attributes_terms_delete');
    expect(tool).toBeDefined();

    const result = await tool!.handler({ attribute_id: 1, term_id: 1 });
    expect(result.isError).toBeUndefined();
  });
});

describe('products_update validation', () => {
  it('rejects sale_price greater than regular_price', async () => {
    mockClient();
    mockIsReadOnly.mockReturnValue(false);

    await import('../../src/tools/products.js');
    const { getActiveTools } = await import('../../src/groups.js');

    const tool = getActiveTools().find((t) => t.name === 'products_update');
    expect(tool).toBeDefined();

    const result = await tool!.handler({ id: 1, regular_price: '100.00', sale_price: '200.00' });
    expect(result.isError).toBe(true);
    const content = JSON.parse(result.content[0].text);
    expect(content.code).toBe('VALIDATION_ERROR');
    expect(content.message).toContain('Sale price');
  });

  it('accepts sale_price less than regular_price', async () => {
    mockClient();
    mockIsReadOnly.mockReturnValue(false);

    await import('../../src/tools/products.js');
    const { getActiveTools } = await import('../../src/groups.js');

    const tool = getActiveTools().find((t) => t.name === 'products_update');
    expect(tool).toBeDefined();

    const result = await tool!.handler({ id: 1, regular_price: '200.00', sale_price: '100.00' });
    expect(result.isError).toBeUndefined();
  });

  it('accepts sale_price equal to regular_price', async () => {
    mockClient();
    mockIsReadOnly.mockReturnValue(false);

    await import('../../src/tools/products.js');
    const { getActiveTools } = await import('../../src/groups.js');

    const tool = getActiveTools().find((t) => t.name === 'products_update');
    expect(tool).toBeDefined();

    const result = await tool!.handler({ id: 1, regular_price: '100.00', sale_price: '100.00' });
    expect(result.isError).toBeUndefined();
  });

  it('rejects invalid price format with letters', async () => {
    mockClient();
    mockIsReadOnly.mockReturnValue(false);

    await import('../../src/tools/products.js');
    const { getActiveTools } = await import('../../src/groups.js');

    const tool = getActiveTools().find((t) => t.name === 'products_update');
    expect(tool).toBeDefined();

    const result = await tool!.handler({ id: 1, regular_price: 'abc' });
    expect(result.isError).toBe(true);
    const content = JSON.parse(result.content[0].text);
    expect(content.code).toBe('VALIDATION_ERROR');
  });

  it('rejects outofstock with positive quantity', async () => {
    mockClient();
    mockIsReadOnly.mockReturnValue(false);

    await import('../../src/tools/products.js');
    const { getActiveTools } = await import('../../src/groups.js');

    const tool = getActiveTools().find((t) => t.name === 'products_update');
    expect(tool).toBeDefined();

    const result = await tool!.handler({ id: 1, stock_status: 'outofstock', stock_quantity: 5 });
    expect(result.isError).toBe(true);
    const content = JSON.parse(result.content[0].text);
    expect(content.code).toBe('VALIDATION_ERROR');
  });

  it('accepts instock with zero quantity', async () => {
    mockClient();
    mockIsReadOnly.mockReturnValue(false);

    await import('../../src/tools/products.js');
    const { getActiveTools } = await import('../../src/groups.js');

    const tool = getActiveTools().find((t) => t.name === 'products_update');
    expect(tool).toBeDefined();

    const result = await tool!.handler({ id: 1, stock_status: 'instock', stock_quantity: 0 });
    expect(result.isError).toBeUndefined();
  });

  it('accepts outofstock when stock_quantity is undefined', async () => {
    mockClient();
    mockIsReadOnly.mockReturnValue(false);

    await import('../../src/tools/products.js');
    const { getActiveTools } = await import('../../src/groups.js');

    const tool = getActiveTools().find((t) => t.name === 'products_update');
    expect(tool).toBeDefined();

    const result = await tool!.handler({ id: 1, stock_status: 'outofstock' });
    expect(result.isError).toBeUndefined();
  });

  it('accepts decimal price with comma separator', async () => {
    mockClient();
    mockIsReadOnly.mockReturnValue(false);

    await import('../../src/tools/products.js');
    const { getActiveTools } = await import('../../src/groups.js');

    const tool = getActiveTools().find((t) => t.name === 'products_update');
    expect(tool).toBeDefined();

    const result = await tool!.handler({ id: 1, regular_price: '10,50' });
    expect(result.isError).toBeUndefined();
  });
});
