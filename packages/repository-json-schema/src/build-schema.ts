// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/repository-json-schema
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {MetadataInspector} from '@loopback/context';
import {
  isBuiltinType,
  ModelDefinition,
  ModelMetadataHelper,
  PropertyDefinition,
  resolveType,
} from '@loopback/repository';
import {JSONSchema6 as JSONSchema} from 'json-schema';
import {JSON_SCHEMA_KEY} from './keys';

/**
 * Gets the JSON Schema of a TypeScript model/class by seeing if one exists
 * in a cache. If not, one is generated and then cached.
 * @param ctor Contructor of class to get JSON Schema from
 */
export function getJsonSchema(ctor: Function): JSONSchema {
  // NOTE(shimks) currently impossible to dynamically update
  const jsonSchema = MetadataInspector.getClassMetadata(JSON_SCHEMA_KEY, ctor);
  if (jsonSchema) {
    return jsonSchema;
  } else {
    const newSchema = modelToJsonSchema(ctor);
    MetadataInspector.defineMetadata(JSON_SCHEMA_KEY.key, newSchema, ctor);
    return newSchema;
  }
}

/**
 * Gets the wrapper function of primitives string, number, and boolean
 * @param type Name of type
 */
export function stringTypeToWrapper(type: string | Function): Function {
  if (typeof type === 'function') {
    return type;
  }
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
    case 'array': {
      wrapper = Array;
      break;
    }
    case 'object': {
      wrapper = Object;
      break;
    }
    case 'date': {
      wrapper = Date;
      break;
    }
    case 'buffer': {
      wrapper = Buffer;
      break;
    }
    default: {
      throw new Error('Unsupported type: ' + type);
    }
  }
  return wrapper;
}

/**
 * Determines whether a given string or constructor is array type or not
 * @param type Type as string or wrapper
 */
export function isArrayType(type: string | Function) {
  return type === Array || type === 'array';
}

/**
 * Converts property metadata into a JSON property definition
 * @param meta
 */
export function metaToJsonProperty(meta: PropertyDefinition): JSONSchema {
  // tslint:disable-next-line:no-any
  const propDef: JSONSchema = {};
  let result: JSONSchema;
  let propertyType = meta.type as string | Function;

  if (isArrayType(propertyType) && meta.itemType) {
    if (Array.isArray(meta.itemType)) {
      throw new Error('itemType as an array is not supported');
    }
    result = {type: 'array', items: propDef};
    propertyType = meta.itemType as string | Function;
  } else {
    result = propDef;
  }

  const wrappedType = stringTypeToWrapper(propertyType);
  const resolvedType = resolveType(wrappedType);

  if (resolvedType === Date) {
    Object.assign(propDef, {
      type: 'string',
      format: 'date-time',
    });
  } else if (isBuiltinType(resolvedType)) {
    Object.assign(propDef, {
      type: resolvedType.name.toLowerCase(),
    });
  } else {
    Object.assign(propDef, {$ref: `#/definitions/${resolvedType.name}`});
  }

  if (meta.description) {
    Object.assign(propDef, {
      description: meta.description,
    });
  }

  return result;
}

// NOTE(shimks) no metadata for: union, optional, nested array, any, enum,
// string literal, anonymous types, and inherited properties

/**
 * Converts a TypeScript class into a JSON Schema using TypeScript's
 * reflection API
 * @param ctor Constructor of class to convert from
 */
export function modelToJsonSchema(ctor: Function): JSONSchema {
  const meta: ModelDefinition | {} = ModelMetadataHelper.getModelMetadata(ctor);
  const result: JSONSchema = {};

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

    const metaProperty = Object.assign({}, meta.properties[p]);

    // populating "properties" key
    result.properties[p] = metaToJsonProperty(metaProperty);

    // handling 'required' metadata
    if (metaProperty.required) {
      result.required = result.required || [];
      result.required.push(p);
    }

    // populating JSON Schema 'definitions'
    // shimks: ugly type casting; this should be replaced by logic to throw
    // error if itemType/type is not a string or a function
    const resolvedType = resolveType(metaProperty.type) as string | Function;
    const referenceType = isArrayType(resolvedType)
      ? // shimks: ugly type casting; this should be replaced by logic to throw
        // error if itemType/type is not a string or a function
        resolveType(metaProperty.itemType as string | Function)
      : resolvedType;

    if (typeof referenceType !== 'function' || isBuiltinType(referenceType)) {
      continue;
    }

    const propSchema = getJsonSchema(referenceType);

    if (propSchema && Object.keys(propSchema).length > 0) {
      result.definitions = result.definitions || {};

      // delete nested definition
      if (propSchema.definitions) {
        for (const key in propSchema.definitions) {
          result.definitions[key] = propSchema.definitions[key];
        }
        delete propSchema.definitions;
      }

      result.definitions[referenceType.name] = propSchema;
    }
  }
  return result;
}
