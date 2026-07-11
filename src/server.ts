import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { getActiveTools } from './groups.js';
import { safeError } from './errors.js';

let mcpServer: Server | null = null;

export async function startServer(): Promise<void> {
  mcpServer = new Server(
    { name: 'woocommerce-mcp', version: '1.0.0' },
    { capabilities: { tools: {} } },
  );

  mcpServer.setRequestHandler(ListToolsRequestSchema, async () => {
    const activeTools = getActiveTools();
    return {
      tools: activeTools.map((t) => ({
        name: t.name,
        description: t.description,
        inputSchema: t.inputSchema,
      })),
    };
  });

  mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const activeTools = getActiveTools();
    const tool = activeTools.find((t) => t.name === name);

    if (!tool) {
      return {
        content: [{ type: 'text', text: `Tool '${name}' not found or disabled.` }],
        isError: true,
      };
    }

    try {
      return await tool.handler(args || {});
    } catch (error) {
      const safe = safeError(error);
      return {
        content: [{ type: 'text', text: `[${safe.code}] ${safe.message}` }],
        isError: true,
      };
    }
  });

  const transport = new StdioServerTransport();
  await mcpServer.connect(transport);

  console.error('WooCommerce MCP Server running on stdio');
  console.error(
    `Enabled groups: ${getActiveTools()
      .map((t) => t.name)
      .join(', ')}`,
  );
}

export async function stopServer(): Promise<void> {
  if (mcpServer) {
    await mcpServer.close();
    mcpServer = null;
  }
}
