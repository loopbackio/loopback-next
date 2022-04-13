// Copyright IBM Corp. and LoopBack contributors 2018,2020. All Rights Reserved.
// Node module: @loopback/openapi-v3
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {JsonSchema} from '@loopback/repository-json-schema';
import _ from 'lodash';
import {
  isSchemaObject,
  ReferenceObject,
  SchemaObject,
  SchemasObject,
} from './types';

/**
 * Custom LoopBack extension: a reference to Schema object that's bundled
 * inside `definitions` property.
 *
 * @example
 *
 * ```ts
 * const spec: SchemaRef = {
 *   $ref: '/components/schemas/Product',
 *   definitions: {
 *     Product: {
 *       title: 'Product',
 *       properties: {
 *         // etc.
 *       }
 *     }
 *   }
 * }
 * ```
 */
export type SchemaRef = ReferenceObject & {definitions: SchemasObject};

/**
 * Converts JSON Schemas into a SchemaObject
 * @param json - JSON Schema to convert from
 * @param visited - A map to keep track of mapped json schemas to handle
 * circular references
 */
export function jsonToSchemaObject(
  json: JsonSchema,
  visited: Map<JsonSchema, SchemaObject | SchemaRef> = new Map(),
): SchemaObject | SchemaRef {
  // A flag to check if a schema object is fully converted
  const converted = 'x-loopback-converted';
  const schema = visited.get(json);
  if (schema != null && isSchemaObject(schema) && schema[converted] === false) {
    return {$ref: `#/components/schemas/${json.title}`};
  }
  if (schema != null) return schema;

  const result: SchemaObject = {
    [converted]: false,
  };
  visited.set(json, result);
  const propsToIgnore = ['additionalItems', 'defaultProperties', 'typeof'];
  for (const property in json) {
    if (propsToIgnore.includes(property)) {
      continue;
    }
    switch (property) {
      case 'type': {
        if (json.type === 'array' && !json.items) {
          throw new Error(
            '"items" property must be present if "type" is an array',
          );
        }
        result.type = Array.isArray(json.type) ? json.type[0] : json.type;
        break;
      }
      case 'allOf': {
        result.allOf = _.map(json.allOf, item =>
          jsonToSchemaObject(item as JsonSchema, visited),
        );
        break;
      }
      case 'anyOf': {
        result.anyOf = _.map(json.anyOf, item =>
          jsonToSchemaObject(item as JsonSchema, visited),
        );
        break;
      }
      case 'oneOf': {
        result.oneOf = _.map(json.oneOf, item =>
          jsonToSchemaObject(item as JsonSchema, visited),
        );
        break;
      }
      case 'definitions': {
        result.definitions = _.mapValues(json.definitions, def =>
          jsonToSchemaObject(jsonOrBooleanToJSON(def), visited),
        );
        break;
      }
      case 'properties': {
        result.properties = _.mapValues(json.properties, item =>
          jsonToSchemaObject(jsonOrBooleanToJSON(item), visited),
        );
        break;
      }
      case 'additionalProperties': {
        if (typeof json.additionalProperties === 'boolean') {
          result.additionalProperties = json.additionalProperties;
        } else {
          result.additionalProperties = jsonToSchemaObject(
            json.additionalProperties!,
            visited,
          );
        }
        break;
      }
      case 'items': {
        const items = Array.isArray(json.items) ? json.items[0] : json.items;
        result.items = jsonToSchemaObject(jsonOrBooleanToJSON(items!), visited);
        break;
      }
      case '$ref': {
        result.$ref = json.$ref!.replace(
          '#/definitions',
          '#/components/schemas',
        );
        break;
      }
      case 'examples': {
        if (Array.isArray(json.examples)) {
          result.example = json.examples[0];
        }
        break;
      }
      default: {
        result[property] = json[property as keyof JsonSchema];
        break;
      }
    }
  }

  delete result[converted];
  // Check if the description contains information about TypeScript type
  const matched = result.description?.match(/^\(tsType: (.+), schemaOptions:/);
  if (matched) {
    result['x-typescript-type'] = matched[1];
  }
  return result;
}

/**
 * Helper function used to interpret boolean values as JSON Schemas.
 * See http://json-schema.org/draft-06/json-schema-release-notes.html
 * @param jsonOrBool - converts boolean values into their representative JSON Schemas
 * @returns A JSON Schema document representing the input value.
 */
export function jsonOrBooleanToJSON(jsonOrBool: boolean | JsonSchema) {
  if (typeof jsonOrBool === 'object') {
    return jsonOrBool;
  } else {
    return jsonOrBool ? {} : {not: {}};
  }
}
