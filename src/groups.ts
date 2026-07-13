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
  const toolNames = new Set(group.tools.map((t) => t.name));
  for (const [, existingGroup] of groupRegistry) {
    for (const existingTool of existingGroup.tools) {
      if (toolNames.has(existingTool.name)) {
        console.warn(
          `Duplicate tool name "${existingTool.name}" registered in group "${group.name}" (already exists in group "${existingGroup.name}")`,
        );
      }
    }
  }
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
