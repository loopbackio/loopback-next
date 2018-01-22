// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/repository-json-schema
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  ModelMetadataHelper,
  PropertyDefinition,
  ModelDefinition,
} from '@loopback/repository';
import {includes} from 'lodash';
import {Definition, PrimitiveType} from 'typescript-json-schema';
import {MetadataInspector} from '@loopback/context';

export const JSON_SCHEMA_KEY = 'loopback:json-schema';

/**
 * Type definition for JSON Schema
 */
export interface JsonDefinition extends Definition {
  allOf?: JsonDefinition[];
  oneOf?: JsonDefinition[];
  anyOf?: JsonDefinition[];
  items?: JsonDefinition | JsonDefinition[];
  additionalItems?: {
    anyOf: JsonDefinition[];
  };
  enum?: PrimitiveType[] | JsonDefinition[];
  additionalProperties?: JsonDefinition | boolean;
  definitions?: {[definition: string]: JsonDefinition};
  properties?: {[property: string]: JsonDefinition};
}

/**
 * Gets the JSON Schema of a TypeScript model/class by seeing if one exists
 * in a cache. If not, one is generated and then cached.
 * @param ctor Contructor of class to get JSON Schema from
 */
export function getJsonSchema(ctor: Function): JsonDefinition {
  // NOTE(shimks) currently impossible to dynamically update
  const jsonSchema = MetadataInspector.getClassMetadata(JSON_SCHEMA_KEY, ctor);
  if (jsonSchema) {
    return jsonSchema;
  } else {
    const newSchema = modelToJsonSchema(ctor);
    MetadataInspector.defineMetadata(JSON_SCHEMA_KEY, newSchema, ctor);
    return newSchema;
  }
}

// NOTE(shimks) no metadata for: union, optional, nested array, any, enum,
// string literal, anonymous types, and inherited properties

/**
 * Converts a TypeScript class into a JSON Schema using TypeScript's
 * reflection API
 * @param ctor Constructor of class to convert from
 */
export function modelToJsonSchema(ctor: Function): JsonDefinition {
  const meta: ModelDefinition = ModelMetadataHelper.getModelMetadata(ctor);
  const schema: JsonDefinition = {};

  const isComplexType = (constructor: Function) =>
    !includes([String, Number, Boolean, Object], constructor);

  const determinePropertyDef = (constructor: Function) =>
    isComplexType(constructor)
      ? {$ref: `#definitions/${constructor.name}`}
      : {type: constructor.name.toLowerCase()};

  for (const p in meta.properties) {
    const propMeta = meta.properties[p];
    let propCtor = propMeta.type;
    if (typeof propCtor === 'string') {
      const type = propCtor.toLowerCase();
      switch (type) {
        case 'number': {
          propCtor = Number;
          break;
        }
        case 'string': {
          propCtor = String;
          break;
        }
        case 'boolean': {
          propCtor = Boolean;
          break;
        }
        default: {
          throw new Error('Unsupported type');
        }
      }
    }
    if (propCtor && typeof propCtor === 'function') {
      // errors out if @property.array() is not used on a property of array
      if (propCtor === Array) {
        throw new Error('type is defined as an array');
      }

      const propDef: JsonDefinition = determinePropertyDef(propCtor);

      if (!schema.properties) {
        schema.properties = {};
      }

      if (propMeta.array === true) {
        schema.properties[p] = {
          type: 'array',
          items: propDef,
        };
      } else {
        schema.properties[p] = propDef;
      }

      if (isComplexType(propCtor)) {
        const propSchema = getJsonSchema(propCtor);

        if (propSchema && Object.keys(propSchema).length > 0) {
          if (!schema.definitions) {
            schema.definitions = {};
          }

          if (propSchema.definitions) {
            for (const key in propSchema.definitions) {
              schema.definitions[key] = propSchema.definitions[key];
            }
            delete propSchema.definitions;
          }

          schema.definitions[propCtor.name] = propSchema;
        }
      }
    }
  }
  return schema;
}
