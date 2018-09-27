// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/openapi-v3
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {JsonSchema} from '@loopback/repository-json-schema';
import {SchemaObject} from '@loopback/openapi-v3-types';
import * as _ from 'lodash';

/**
 * Converts JSON Schemas into a SchemaObject
 * @param json JSON Schema to convert from
 */
export function jsonToSchemaObject(json: JsonSchema): SchemaObject {
  const result: SchemaObject = {};
  const propsToIgnore = [
    'anyOf',
    'oneOf',
    'additionalItems',
    'defaultProperties',
    'typeof',
  ];
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
          jsonToSchemaObject(item as JsonSchema),
        );
        break;
      }
      case 'definitions': {
        result.definitions = _.mapValues(json.definitions, def =>
          jsonToSchemaObject(jsonOrBooleanToJSON(def)),
        );
        break;
      }
      case 'properties': {
        result.properties = _.mapValues(json.properties, item =>
          jsonToSchemaObject(jsonOrBooleanToJSON(item)),
        );
        break;
      }
      case 'additionalProperties': {
        if (typeof json.additionalProperties !== 'boolean') {
          result.additionalProperties = jsonToSchemaObject(
            json.additionalProperties!,
          );
        }
        break;
      }
      case 'items': {
        const items = Array.isArray(json.items) ? json.items[0] : json.items;
        result.items = jsonToSchemaObject(jsonOrBooleanToJSON(items!));
        break;
      }
      case '$ref': {
        result.$ref = json.$ref!.replace(
          '#/definitions',
          '#/components/schemas',
        );
        break;
      }
      default: {
        result[property] = json[property as keyof JsonSchema];
        break;
      }
    }
  }

  return result;
}

/**
 * Helper function used to interpret boolean values as JSON Schemas.
 * See http://json-schema.org/draft-06/json-schema-release-notes.html
 * @param jsonOrBool converts boolean values into their representative JSON Schemas
 * @returns A JSON Schema document representing the input value.
 */
export function jsonOrBooleanToJSON(jsonOrBool: boolean | JsonSchema) {
  if (typeof jsonOrBool === 'object') {
    return jsonOrBool;
  } else {
    return jsonOrBool ? {} : {not: {}};
  }
}
