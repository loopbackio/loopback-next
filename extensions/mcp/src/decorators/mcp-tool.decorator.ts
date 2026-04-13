import {BindingKey, MetadataInspector} from '@loopback/core';
import {MCP_TOOL_METADATA_KEY} from '../constants';
import {McpHookFunction} from '../interfaces';
import {
  McpHookConfig,
  McpToolDecoratorOptions,
  McpToolMetadata,
} from '../types';

/**
 * Process hook config to normalize binding keys
 */
function processHookConfig(
  hookConfig?: McpHookConfig,
): McpHookConfig | undefined {
  if (!hookConfig) return undefined;

  const binding =
    typeof hookConfig.binding === 'string'
      ? BindingKey.create<McpHookFunction>(hookConfig.binding)
      : hookConfig.binding;

  return {
    binding,
    config: hookConfig.config,
  };
}

export function mcpTool(options: McpToolDecoratorOptions) {
  return function (
    target: Object,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    // Create basic schema - parameter extraction happens in the service
    const basicSchema = options.schema ?? {};

    const metadata: McpToolMetadata = {
      name: options.name,
      description: options.description,
      schema: basicSchema,
      controllerFunction: descriptor.value,
      preHook: processHookConfig(options.preHook),
      postHook: processHookConfig(options.postHook),
      parameterNames: [], // Will be populated by service
    };

    // Store metadata using LoopBack's metadata system
    // Get existing metadata for the class
    const existingMethodsMetadata =
      MetadataInspector.getAllMethodMetadata<McpToolMetadata>(
        MCP_TOOL_METADATA_KEY,
        target,
      ) ?? {};

    // Add this method's metadata
    existingMethodsMetadata[propertyKey] = metadata;

    // Store the complete metadata map back
    MetadataInspector.defineMetadata(
      MCP_TOOL_METADATA_KEY,
      existingMethodsMetadata,
      target,
    );

    return descriptor;
  };
}
