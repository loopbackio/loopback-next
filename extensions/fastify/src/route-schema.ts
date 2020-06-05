// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/fastify
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  isReferenceObject,
  OperationObject,
  ParameterObject,
  SchemaObject,
} from '@loopback/openapi-v3';
import debugFactory from 'debug';
import {RouteSchema} from 'fastify';
import util from 'util';
const debug = debugFactory('loopback:fastify:route-schema');
const toJsonSchema = require('@openapi-contrib/openapi-schema-to-json-schema');

// temporary workaround for too strictly typed RouteSchema
type JsonSchema = {
  type: 'object';
  properties: {[key: string]: object};
  required: string[];
};

export function buildRouteSchema(spec: OperationObject): RouteSchema {
  const params: JsonSchema = {type: 'object', properties: {}, required: []};
  const headers: JsonSchema = {type: 'object', properties: {}, required: []};
  const query: JsonSchema = {type: 'object', properties: {}, required: []};

  for (const paramSpec of spec.parameters ?? []) {
    if (isReferenceObject(paramSpec)) {
      // TODO(bajtos) implement $ref parameters
      // See https://github.com/strongloop/loopback-next/issues/435
      throw new Error('$ref parameters are not supported yet.');
    }

    switch (paramSpec.in) {
      case 'path':
        register(paramSpec, params);
        break;
      case 'header':
        register(paramSpec, headers);
        break;
      case 'query':
        if (paramSpec.schema) {
          register(paramSpec, query);
        } else if (paramSpec.content?.['application/json']?.schema) {
          register(
            {
              ...paramSpec,
              schema: paramSpec.content?.['application/json']?.schema,
              content: undefined,
            },
            query,
          );
        }
        break;
      default:
        debug(
          'Ignoring parameter `%s` with `in: %s`',
          paramSpec.name,
          paramSpec.in,
        );
    }
  }

  const result = {params, headers, querystring: query};
  /* istanbul ignore if */
  if (debug.enabled) {
    debug('Fastify validation schema: %s', util.inspect(result, {depth: null}));
  }
  return result;
}

function register(paramSpec: ParameterObject, target: JsonSchema) {
  const {schema, name} = paramSpec;

  if (!schema) return;
  if (isReferenceObject(schema)) {
    throw new Error('$ref schemas are not supported yet.');
  }

  const jsonSchema = convertToJsonSchema(schema);
  target.properties[name] = jsonSchema;
  if (paramSpec.required) target.required.push(name);
}

// Copied from packages/rest/src/validation/request-body.validator.ts
// Do we want to share this helper, perhaps via `@loopback/openapi-v3` package?

/**
 * Convert an OpenAPI schema to the corresponding JSON schema.
 * @param openapiSchema - The OpenAPI schema to convert.
 */
function convertToJsonSchema(openapiSchema: SchemaObject): object {
  const jsonSchema = toJsonSchema(openapiSchema);
  delete jsonSchema['$schema'];
  /* istanbul ignore if */
  if (debug.enabled) {
    debug(
      'Converted OpenAPI schema to JSON schema: %s',
      util.inspect(jsonSchema, {depth: null}),
    );
  }
  return jsonSchema;
}
