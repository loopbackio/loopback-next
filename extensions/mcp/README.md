<a href="https://sourcefuse.github.io/arc-docs/arc-api-docs" target="_blank"><img src="https://github.com/sourcefuse/loopback4-microservice-catalog/blob/master/docs/assets/logo-dark-bg.png?raw=true" alt="ARC By SourceFuse logo" title="ARC By SourceFuse" align="right" width="150" /></a>

# [loopback4-mcp](https://github.com/sourcefuse/loopback4-mcp)

<p align="left">
<a href="https://www.npmjs.com/package/loopback4-mcp">
<img src="https://img.shields.io/npm/v/loopback4-mcp.svg" alt="npm version" />
</a>
<a href="https://sonarcloud.io/summary/new_code?id=sourcefuse_loopback4-mcp" target="_blank">
<img alt="Sonar Quality Gate" src="https://img.shields.io/sonar/quality_gate/sourcefuse_loopback4-mcp?server=https%3A%2F%2Fsonarcloud.io">
</a>
<a href="https://github.com/sourcefuse/loopback4-mcp/graphs/contributors" target="_blank">
<img alt="GitHub contributors" src="https://img.shields.io/github/contributors/sourcefuse/loopback4-mcp?">
</a>
<a href="https://www.npmjs.com/package/loopback4-mcp" target="_blank">
<img alt="downloads" src="https://img.shields.io/npm/dw/loopback4-mcp.svg">
</a>
<a href="./LICENSE">
<img src="https://img.shields.io/github/license/sourcefuse/loopback4-mcp.svg" alt="License" />
</a>
<a href="https://loopback.io/" target="_blank">
<img alt="Powered By LoopBack 4" src="https://img.shields.io/badge/Powered%20by-LoopBack 4-brightgreen" />
</a>
</p>

## Overview

This extension provides a plug-and-play integration between LoopBack4 applications and the Model Context Protocol (MCP) specification.

Its purpose is to enable LoopBack APIs, services, and business logic to be exposed as MCP Tools, allowing external MCP clients (such as LLMs, agents, or MCP-compatible apps) to discover and execute server-defined operations.

### Key Features

- Automatic MCP Tool Discovery :-
  The extension scans your application at boot time and automatically registers all methods decorated with the custom @mcpTool() decorator.

  This allows you to define MCP tools anywhere in your LoopBack project without manually wiring metadata.

- Lifecycle-managed Tool Registry :-
  A dedicated `McpToolRegistry` service maintains all discovered tool metadata,their handlers and execution context.

  A `McpToolRegistryBootObserver` ensures that registration happens only after the application has fully booted.

## Installation

```sh
npm install @loopback/mcp
```

## Basic Usage

Configure and load `McpComponent` in the application constructor
as shown below.

```ts
import {McpComponent} from 'loopback4-mcp';

export class MyApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super();
    this.component(McpComponent);
  }
}
```

Add the `@mcpTool()` decorator to any controller in your application.

All MCP tool methods must use LoopBack `@param` decorators to define their input parameters.If `@param` decorators are missing, the MCP tool will fail.

```ts
@mcpTool({
  name: 'create-user',
  description: 'Creates a new user in the system',
  schema?: {
    email: z.string().email(),
    name: z.string(),
  },
})
async createUser(
  @param.query.string('email') email: string,
  @param.query.string('name') name: string,
) {
  return {message: `User ${name} created`};
}
```

This decorator accepts a total of five fields, out of which `name` and `description` are mandatory and `schema`,`preHook` and `postHook` are optional enhancements.

The schema field allows defining a Zod-based validation schema for tool input parameters, while preHook and postHook enable execution of custom logic before and after the tool handler runs.

## Mcp Hook Usage Details

To use hooks with MCP tools, follow the provider-based approach:

Step 1: Create a hook provider:

```ts
// src/providers/my-hook.provider.ts
export class MyHookProvider implements Provider<McpHookFunction> {
  constructor(@inject(LOGGER.LOGGER_INJECT) private logger: ILogger) {}
  value(): McpHookFunction {
    return async (context: McpHookContext) => {
      this.logger.info(`Hook executed for tool: ${context.toolName}`);
    };
  }
}
```

Step 2: Add binding key to McpHookBindings:

```ts
// src/keys.ts
export namespace McpHookBindings {
  export const MY_HOOK = BindingKey.create<McpHookFunction>('hooks.mcp.myHook');
}
```

Step 3: Bind provider in `application.ts`:

```typescript
this.bind(McpHookBindings.MY_HOOK).toProvider(MyHookProvider);
```

Step 4: Use in decorator:

```ts
@mcpTool({
 name: 'my-tool',
 description: 'my-description'
 preHookBinding: McpHookBindings.MY_HOOK,
  postHookBinding: 'hooks.mcp.myOtherHook' // or string binding key
})
```
