import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ToolDefinition } from '../src/groups.js';

const mockGetEnabledGroups = vi.fn();

vi.mock('../src/config.js', () => ({
  getEnabledGroups: mockGetEnabledGroups,
}));

function mockTool(name: string): ToolDefinition {
  return {
    name,
    description: `Tool ${name}`,
    inputSchema: { type: 'object', properties: {} },
    handler: async () => ({ content: [{ type: 'text', text: 'ok' }] }),
  };
}

function allEnabled() {
  return [
    { name: 'products', enabled: true },
    { name: 'orders', enabled: true },
    { name: 'customers', enabled: true },
    { name: 'coupons', enabled: true },
    { name: 'shipping', enabled: true },
    { name: 'taxes', enabled: true },
    { name: 'reports', enabled: true },
    { name: 'system', enabled: true },
    { name: 'email', enabled: true },
  ];
}

describe('registerGroup and getActiveTools', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('starts with no tools', async () => {
    mockGetEnabledGroups.mockReturnValue(allEnabled());
    const { getActiveTools } = await import('../src/groups.js');
    expect(getActiveTools()).toHaveLength(0);
  });

  it('returns tools after registration', async () => {
    mockGetEnabledGroups.mockReturnValue(allEnabled());
    const { registerGroup, getActiveTools } = await import('../src/groups.js');
    registerGroup({ name: 'products', tools: [mockTool('products_list')] });
    const tools = getActiveTools();
    expect(tools).toHaveLength(1);
    expect(tools[0].name).toBe('products_list');
  });

  it('only returns tools from enabled groups', async () => {
    mockGetEnabledGroups.mockReturnValue([
      { name: 'products', enabled: true },
      { name: 'orders', enabled: false },
    ]);
    const { registerGroup, getActiveTools } = await import('../src/groups.js');
    registerGroup({ name: 'products', tools: [mockTool('product_list')] });
    registerGroup({ name: 'orders', tools: [mockTool('order_list')] });
    const tools = getActiveTools();
    expect(tools).toHaveLength(1);
    expect(tools[0].name).toBe('product_list');
  });

  it('returns no tools when no groups are enabled', async () => {
    mockGetEnabledGroups.mockReturnValue([{ name: 'products', enabled: false }]);
    const { registerGroup, getActiveTools } = await import('../src/groups.js');
    registerGroup({ name: 'products', tools: [mockTool('product_list')] });
    expect(getActiveTools()).toHaveLength(0);
  });
});
