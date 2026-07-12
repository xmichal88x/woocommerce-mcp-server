import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { getActiveTools } from './groups.js';
import { safeError } from './errors.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pkg = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf-8'));

let logLevel: string | undefined;

function shouldLog(level: string): boolean {
  if (!logLevel) {
    logLevel = process.env.WC_LOG_LEVEL || 'info';
    if (!['debug', 'info', 'error'].includes(logLevel)) {
      logLevel = 'info';
    }
  }
  const levels = ['debug', 'info', 'error'];
  return levels.indexOf(level) >= levels.indexOf(logLevel);
}

function log(level: string, data: Record<string, unknown>): void {
  if (shouldLog(level)) {
    console.error(JSON.stringify({ level, ...data }));
  }
}

let mcpServer: Server | null = null;

export async function startServer(): Promise<void> {
  mcpServer = new Server({ name: pkg.name, version: pkg.version }, { capabilities: { tools: {} } });

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
    const start = Date.now();

    const activeTools = getActiveTools();
    const tool = activeTools.find((t) => t.name === name);

    if (!tool) {
      log('error', {
        tool: name,
        duration: Date.now() - start,
        timestamp: new Date().toISOString(),
        status: 'error',
        code: 'TOOL_NOT_FOUND',
        message: `Tool '${name}' not found or disabled.`,
      });
      return {
        content: [{ type: 'text', text: `Tool '${name}' not found or disabled.` }],
        isError: true,
      };
    }

    try {
      log('debug', {
        tool: name,
        timestamp: new Date().toISOString(),
        status: 'started',
        args: args ? Object.keys(args) : [],
      });

      const result = await tool.handler(args || {});
      log('info', {
        tool: name,
        duration: Date.now() - start,
        timestamp: new Date().toISOString(),
        status: 'success',
      });
      return result;
    } catch (error) {
      const safe = safeError(error);
      log('error', {
        tool: name,
        duration: Date.now() - start,
        timestamp: new Date().toISOString(),
        status: 'error',
        code: safe.code,
        message: safe.message,
      });
      return {
        content: [{ type: 'text', text: `[${safe.code}] ${safe.message}` }],
        isError: true,
      };
    }
  });

  const transport = new StdioServerTransport();
  await mcpServer.connect(transport);

  log('info', { message: 'WooCommerce MCP Server running on stdio' });
  log('info', {
    message: `Enabled groups: ${getActiveTools()
      .map((t) => t.name)
      .join(', ')}`,
  });
}

export async function stopServer(): Promise<void> {
  if (mcpServer) {
    await mcpServer.close();
    mcpServer = null;
  }
}
