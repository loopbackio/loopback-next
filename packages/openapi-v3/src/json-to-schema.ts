// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/openapi-v3
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {JsonDefinition} from '@loopback/repository-json-schema';
import {SchemaObject, ExtensionValue} from '@loopback/openapi-v3-types';
import * as _ from 'lodash';

export function jsonToSchemaObject(jsonDef: JsonDefinition): SchemaObject {
  const json = jsonDef as {[name: string]: ExtensionValue}; // gets around index signature error
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
        result.allOf = _.map(json.allOf, item => jsonToSchemaObject(item));
        break;
      }
      case 'definitions': {
        result.definitions = _.mapValues(json.definitions, def =>
          jsonToSchemaObject(def),
        );
        break;
      }
      case 'properties': {
        result.properties = _.mapValues(json.properties, item =>
          jsonToSchemaObject(item),
        );
        break;
      }
      case 'additionalProperties': {
        if (typeof json.additionalProperties !== 'boolean') {
          result.additionalProperties = jsonToSchemaObject(
            json.additionalProperties as JsonDefinition,
          );
        }
        break;
      }
      case 'items': {
        const items = Array.isArray(json.items) ? json.items[0] : json.items;
        result.items = jsonToSchemaObject(items as JsonDefinition);
        break;
      }
      case 'enum': {
        const newEnum = [];
        const primitives = ['string', 'number', 'boolean'];
        for (const element of json.enum) {
          if (primitives.includes(typeof element) || element === null) {
            newEnum.push(element);
          } else {
            // if element is JsonDefinition, convert to SchemaObject
            newEnum.push(jsonToSchemaObject(element as JsonDefinition));
          }
        }
        result.enum = newEnum;

        break;
      }
      case '$ref': {
        result.$ref = json.$ref.replace(
          '#/definitions',
          '#/components/schemas',
        );
        break;
      }
      default: {
        result[property] = json[property];
        break;
      }
    }
  }

  return result;
}
