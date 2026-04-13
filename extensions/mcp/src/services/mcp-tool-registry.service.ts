import {
  Application,
  bind,
  BindingKey,
  BindingScope,
  Constructor,
  Context,
  CoreBindings,
  inject,
  MetadataInspector,
  service,
} from '@loopback/core';
import {HttpErrors} from '@loopback/rest';
import {RequestHandlerExtra} from '@modelcontextprotocol/sdk/shared/protocol';
import {
  CallToolResult,
  ServerNotification,
  ServerRequest,
} from '@modelcontextprotocol/sdk/types';
import {IAuthUserWithPermissions, ILogger, LOGGER} from '@sourceloop/core';
import {AuthenticationBindings} from 'loopback4-authentication';
import {
  AUTHORIZATION_METADATA_ACCESSOR,
  AuthorizationBindings,
  AuthorizationMetadata,
} from 'loopback4-authorization';
import {McpHookContext, McpHookFunction} from '../interfaces';
import {MCP_TOOL_METADATA_KEY} from '../constants';
import {extractParameterInfo} from '../utils';
import {McpSchemaGeneratorService} from './mcp-schema-generator-service.service';
import {McpTool, McpToolMetadata} from '../types';

@bind({scope: BindingScope.SINGLETON})
export class McpToolRegistry {
  private toolDefinitions: McpTool[] = [];
  private isInitialized = false;

  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    private readonly app: Application,
    @inject(LOGGER.LOGGER_INJECT)
    private readonly logger: ILogger,
    @service(McpSchemaGeneratorService)
    private readonly schemaGenerator: McpSchemaGeneratorService,
  ) {}

  /**
   * Get MCP tools from a class using LoopBack MetadataInspector
   */
  private getMcpToolsFromClass(targetClass: Function): McpToolMetadata[] {
    const processedTools: McpToolMetadata[] = [];
    const prototype = targetClass.prototype;

    // Retrieve all tool metadata that was stored earlier by @mcpTool decorator
    const allTools = MetadataInspector.getAllMethodMetadata<McpToolMetadata>(
      MCP_TOOL_METADATA_KEY,
      prototype,
    );

    if (!allTools || Object.keys(allTools).length === 0) {
      return [];
    }

    for (const [methodName, tool] of Object.entries(allTools)) {
      try {
        const {parameterNames} = extractParameterInfo(prototype, methodName);

        // Create a copy with updated parameter info
        const processedTool: McpToolMetadata = {
          ...tool,
          parameterNames,
        };

        // Generate schema if needed
        if (
          !processedTool.schema ||
          Object.keys(processedTool.schema).length === 0
        ) {
          const schema = this.schemaGenerator.generateToolSchemaFromLoopBack(
            {
              name: processedTool.name,
              description: processedTool.description,
              schema: processedTool.schema,
            },
            prototype,
            methodName,
          );
          processedTool.schema = schema;
        }

        processedTools.push(processedTool);
      } catch (error) {
        // Tool doesn't have LoopBack parameter decorators
        this.logger.warn(
          `Tool ${methodName} missing LoopBack parameter decorators:`,
          error,
        );
      }
    }

    return processedTools;
  }

  /**
   * Initialize tool registry at startup - stores metadata without instantiating controllers
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    const controllerBindings = this.app.findByTag('controller');

    // Process all bindings and collect tool metadata without instantiating controllers
    const toolArrays = controllerBindings.map(binding => {
      const controllerClass = binding.valueConstructor;
      if (!controllerClass) {
        this.logger.info(`No constructor found for binding ${binding.key}`);
        return [];
      }

      // extracts all methods decroated with @mcpTool
      const tools = this.getMcpToolsFromClass(controllerClass);

      if (tools.length === 0) return [];

      // Create pre-bound tool definitions
      return tools.map(tool => {
        return {
          ...tool,
          controllerBinding: BindingKey.create<object>(binding.key), // Store binding key instead of instance
          handler: async (
            requestContext: Context,
            args: {[key: string]: unknown},
            extras: RequestHandlerExtra<ServerRequest, ServerNotification>,
          ): Promise<CallToolResult> => {
            const ctx = await this.setupAuthorizationContext(
              requestContext,
              tool,
              controllerClass,
            );

            const hookContext: McpHookContext = {
              toolName: tool.name,
              args: args,
              metadata: tool.postHook?.config,
            };
            await this.executePreHook(ctx, tool, hookContext);

            let result;
            try {
              result = await this.executeToolMethod(
                ctx,
                binding.key,
                tool,
                hookContext,
                extras,
              );
              hookContext.result = result;

              await this.executePostHook(ctx, tool, hookContext);
            } catch (err) {
              const error = err instanceof Error ? err : new Error(String(err));
              hookContext.error = error;
              this.logger.error(
                `MCP Tool '${tool.name}' execution failed:`,
                error.message,
              );
              return this.errorToCallToolResult(error);
            } finally {
              ctx.close();
            }
            return (hookContext.result as CallToolResult) ?? result;
          },
        };
      });
    });

    this.toolDefinitions = toolArrays.flat();
    this.isInitialized = true;
  }

  /**
   * Get all precomputed tool definitions (ultra-fast)
   */
  getToolDefinitions(): McpTool[] {
    return this.toolDefinitions;
  }

  /**
   * Resolve hook function from provider binding
   */
  private async resolveHook(
    ctx: Context,
    hookBinding?: BindingKey<McpHookFunction> | string,
  ): Promise<McpHookFunction | undefined> {
    if (!hookBinding) {
      return undefined;
    }

    try {
      const bindingKey =
        typeof hookBinding === 'string'
          ? BindingKey.create<McpHookFunction>(hookBinding)
          : hookBinding;
      return await ctx.get(bindingKey);
    } catch (error) {
      // Hook binding not found - this is not an error, just log and continue
      this.logger.warn(
        `Hook binding ${hookBinding.toString()} not found:`,
        error,
      );
      return undefined;
    }
  }

  /**
   * Set up authorization context and perform authorization check
   */
  private async setupAuthorizationContext(
    requestContext: Context,
    tool: McpToolMetadata,
    controllerClass: Constructor<object>,
  ): Promise<Context> {
    // Get authorization metadata from the controller method
    const authMetadata =
      MetadataInspector.getMethodMetadata<AuthorizationMetadata>(
        AUTHORIZATION_METADATA_ACCESSOR,
        controllerClass.prototype,
        tool.controllerFunction.name,
      );

    if (!authMetadata) {
      this.logger.warn(
        `No authorization metadata found for MCP tool '${tool.name}'`,
      );
      throw new HttpErrors.Forbidden(
        `MCP tool '${tool.name}' is missing authorization configuration.`,
      );
    }

    // Check authorization first - get authorize function from context
    const ctx = new Context(requestContext);

    // Bind the authorization metadata so the authorize action provider can access it
    ctx.bind(AuthorizationBindings.METADATA).to(authMetadata);

    // Bind controller information for authorization
    ctx.bind(CoreBindings.CONTROLLER_CLASS).to(controllerClass);
    ctx
      .bind(CoreBindings.CONTROLLER_METHOD_NAME)
      .to(tool.controllerFunction.name);

    const user = await ctx.get<IAuthUserWithPermissions>(
      AuthenticationBindings.CURRENT_USER,
    );

    const authorizeAction = await ctx.get(
      AuthorizationBindings.AUTHORIZE_ACTION,
    );
    const isAuthorized = await authorizeAction(user.permissions);

    if (!isAuthorized) {
      this.logger.warn(
        `User ${user.id} is not authorized to access MCP tool '${tool.name}'`,
      );
      throw new HttpErrors.Forbidden(
        `Access denied for MCP tool '${tool.name}'.`,
      );
    }

    return ctx;
  }

  /**
   * Prepare method arguments based on parameter patterns
   */
  private prepareMethodArguments(
    tool: McpToolMetadata,
    args: {[key: string]: unknown},
  ): unknown[] {
    // Extract individual parameter values by name
    if (!tool.parameterNames?.length) {
      // Fallback - pass args object directly if no parameter names
      return [args];
    }

    // Extract individual values by parameter names
    return tool.parameterNames.map(paramName => args?.[paramName]);
  }

  /**
   * Execute pre-hook if configured
   */
  private async executePreHook(
    ctx: Context,
    tool: McpToolMetadata,
    hookContext: McpHookContext,
  ): Promise<void> {
    const preHook = await this.resolveHook(ctx, tool.preHook?.binding);
    if (preHook) {
      const preHookResult = await preHook(hookContext);
      if (preHookResult) {
        hookContext.args = preHookResult.args;
      }
    }
  }

  /**
   * Execute post-hook if configured
   */
  private async executePostHook(
    ctx: Context,
    tool: McpToolMetadata,
    hookContext: McpHookContext,
  ): Promise<void> {
    const postHook = await this.resolveHook(ctx, tool.postHook?.binding);
    if (postHook) {
      const postHookResult = await postHook(hookContext);
      if (postHookResult) {
        hookContext.result = postHookResult.result;
        hookContext.args = postHookResult.args;
        hookContext.error = postHookResult.error;
      }
    }
  }

  /**
   * Execute the tool method with proper result wrapping
   */
  private async executeToolMethod(
    ctx: Context,
    bindingKey: string,
    tool: McpToolMetadata,
    hookContext: McpHookContext,
    extras: RequestHandlerExtra<ServerRequest, ServerNotification>,
  ): Promise<CallToolResult> {
    const controllerInstance = await ctx.get(bindingKey);
    const methodArgs = this.prepareMethodArguments(tool, hookContext.args);

    let result = await tool.controllerFunction.call(
      controllerInstance,
      ...methodArgs,
      extras,
    );

    // Automatically wrap result in MCP response format if not already wrapped
    if (result && typeof result === 'object' && !result.content) {
      result = {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      } as CallToolResult;
    }

    return result;
  }

  private errorToCallToolResult(error: Error): CallToolResult {
    return {
      content: [
        {
          type: 'text',
          text: error.message || 'MCP tool execution failed',
        },
      ],
    } as CallToolResult;
  }
}
