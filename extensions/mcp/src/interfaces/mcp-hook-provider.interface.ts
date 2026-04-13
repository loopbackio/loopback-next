export interface McpHookContext {
  toolName: string;
  args: {[key: string]: unknown};
  result?: unknown;
  error?: Error;
  metadata?: {[key: string]: unknown};
}

export type McpHookFunction = (
  context: McpHookContext,
) => Promise<McpHookContext | void> | McpHookContext | void;
