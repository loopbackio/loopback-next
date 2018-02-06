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

/**
 * Gets the wrapper function of primitives string, number, and boolean
 * @param type Name of type
 */
export function stringTypeToWrapper(type: string): Function {
  type = type.toLowerCase();
  let wrapper;
  switch (type) {
    case 'number': {
      wrapper = Number;
      break;
    }
    case 'string': {
      wrapper = String;
      break;
    }
    case 'boolean': {
      wrapper = Boolean;
      break;
    }
    default: {
      throw new Error('Unsupported type');
    }
  }
  return wrapper;
}

/**
 * Determines whether the given constructor is a custom type or not
 * @param ctor Constructor
 */
export function isComplexType(ctor: Function) {
  return !includes([String, Number, Boolean, Object, Function], ctor);
}

/**
 * Converts property metadata into a JSON property definition
 * @param meta
 */
export function metaToJsonProperty(meta: PropertyDefinition): JsonDefinition {
  let ctor = meta.type as string | Function;
  let def: JsonDefinition = {};

  // errors out if @property.array() is not used on a property of array
  if (ctor === Array) {
    throw new Error('type is defined as an array');
  }

  if (typeof ctor === 'string') {
    ctor = stringTypeToWrapper(ctor);
  }

  const propDef = isComplexType(ctor)
    ? {$ref: `#/definitions/${ctor.name}`}
    : {type: ctor.name.toLowerCase()};

  if (meta.array) {
    def.type = 'array';
    def.items = propDef;
  } else {
    Object.assign(def, propDef);
  }

  return def;
}

// NOTE(shimks) no metadata for: union, optional, nested array, any, enum,
// string literal, anonymous types, and inherited properties

/**
 * Converts a TypeScript class into a JSON Schema using TypeScript's
 * reflection API
 * @param ctor Constructor of class to convert from
 */
export function modelToJsonSchema(ctor: Function): JsonDefinition {
  const meta: ModelDefinition | {} = ModelMetadataHelper.getModelMetadata(ctor);
  const result: JsonDefinition = {};

  // returns an empty object if metadata is an empty object
  if (!(meta instanceof ModelDefinition)) {
    return {};
  }

  result.title = meta.title || ctor.name;

  if (meta.description) {
    result.description = meta.description;
  }

  for (const p in meta.properties) {
    if (!meta.properties[p].type) {
      continue;
    }

    result.properties = result.properties || {};
    result.properties[p] = result.properties[p] || {};

    const metaProperty = meta.properties[p];
    const metaType = metaProperty.type;

    // populating "properties" key
    result.properties[p] = metaToJsonProperty(metaProperty);

    // populating JSON Schema 'definitions'
    if (typeof metaType === 'function' && isComplexType(metaType)) {
      const propSchema = getJsonSchema(metaType);

      if (propSchema && Object.keys(propSchema).length > 0) {
        result.definitions = result.definitions || {};

        // delete nested definition
        if (propSchema.definitions) {
          for (const key in propSchema.definitions) {
            result.definitions[key] = propSchema.definitions[key];
          }
          delete propSchema.definitions;
        }

        result.definitions[metaType.name] = propSchema;
      }
    }

    // handling 'required' metadata
    if (metaProperty.required) {
      result.required = result.required || [];
      result.required.push(p);
    }
  }
  return result;
}
