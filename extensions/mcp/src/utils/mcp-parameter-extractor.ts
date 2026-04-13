import {MetadataInspector} from '@loopback/core';
import {SchemaObject} from '@loopback/openapi-v3';
import {OAI3Keys} from '@loopback/openapi-v3/dist/keys';
import {ParameterObject} from '@loopback/rest';

/**
 * Extract parameter information using LoopBack's parameter metadata system
 * Developers creating MCP tools must use @param decorators
 */
export function extractParameterInfo(target: Object, propertyKey: string) {
  const paramMetadata = MetadataInspector.getMethodMetadata(
    OAI3Keys.PARAMETERS_KEY, // LoopBack parameter metadata key
    target,
    propertyKey,
  );

  if (
    !paramMetadata ||
    !Array.isArray(paramMetadata) ||
    paramMetadata.length === 0
  ) {
    throw new Error(
      `No LoopBack parameter metadata found for ${propertyKey}. ` +
        `MCP tools must use @param decorators (e.g., @param.query.string('paramName'))`,
    );
  }

  const parameterNames = paramMetadata.map(
    (param: ParameterObject, index: number) => {
      if (!param.name) {
        throw new Error(
          `Parameter ${index} in ${propertyKey} is missing name. Use @param.query.string('name')`,
        );
      }
      return param.name;
    },
  );

  const parameterOptional = paramMetadata.map(
    (param: ParameterObject) => param.required === false,
  );

  const parameterTypes = paramMetadata.map((param: ParameterObject) => {
    // Extract type information from LoopBack parameter schema
    const schema = param.schema as SchemaObject;
    if (schema?.type) {
      switch (schema.type) {
        case 'string':
          return 'string';
        case 'number':
        case 'integer':
          return 'number';
        case 'boolean':
          return 'boolean';
        case 'object':
          return 'object';
        case 'array':
          return 'array';
        default:
          return 'any';
      }
    }
    return 'any';
  });

  return {parameterNames, parameterOptional, parameterTypes};
}
