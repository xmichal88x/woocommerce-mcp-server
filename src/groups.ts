import { getEnabledGroups, type ToolGroup } from './config.js';

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  handler: (args: Record<string, unknown>) => Promise<{
    content: { type: 'text'; text: string }[];
    isError?: boolean;
  }>;
}

export interface ToolGroupDefinition {
  name: ToolGroup;
  tools: ToolDefinition[];
}

const groupRegistry = new Map<ToolGroup, ToolGroupDefinition>();

export function registerGroup(group: ToolGroupDefinition): void {
  groupRegistry.set(group.name, group);
}

export function getActiveTools(): ToolDefinition[] {
  const enabledGroups = getEnabledGroups();
  const enabledNames = new Set(enabledGroups.filter((g) => g.enabled).map((g) => g.name));

  const tools: ToolDefinition[] = [];
  for (const [groupName, group] of groupRegistry) {
    if (enabledNames.has(groupName)) {
      tools.push(...group.tools);
    }
  }
  return tools;
}
