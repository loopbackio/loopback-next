// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/openapi-v3
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {JsonDefinition} from '@loopback/repository-json-schema';
import {SchemaObject} from '@loopback/openapi-v3-types';
import {JSONSchema6} from 'json-schema';
import * as _ from 'lodash';

export function jsonToSchemaObject(json: JSONSchema6): SchemaObject {
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
          jsonToSchemaObject(def as JSONSchema6),
        );
        break;
      }
      case 'properties': {
        result.properties = _.mapValues(json.properties, item =>
          jsonToSchemaObject(item as JSONSchema6),
        );
        break;
      }
      case 'additionalProperties': {
        if (typeof json.additionalProperties !== 'boolean') {
          result.additionalProperties = jsonToSchemaObject(
            json.additionalProperties as JSONSchema6,
          );
        }
        break;
      }
      case 'items': {
        const items = Array.isArray(json.items) ? json.items[0] : json.items;
        result.items = jsonToSchemaObject(items as JSONSchema6);
        break;
      }
      case 'enum': {
        const newEnum = [];
        const primitives = ['string', 'number', 'boolean'];
        for (const element of json.enum!) {
          if (primitives.includes(typeof element) || element === null) {
            newEnum.push(element);
          } else {
            // if element is JsonDefinition, convert to SchemaObject
            newEnum.push(jsonToSchemaObject(element as JSONSchema6));
          }
        }
        result.enum = newEnum;

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
        result[property] = json[property as keyof JSONSchema6];
        break;
      }
    }
  }

  return result;
}
