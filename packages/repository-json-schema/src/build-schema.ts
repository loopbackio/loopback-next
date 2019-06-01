// Copyright IBM Corp. 2018,2019. All Rights Reserved.
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

export interface JsonSchemaOptions {
  visited?: {[key: string]: JSONSchema};
}

/**
 * Gets the JSON Schema of a TypeScript model/class by seeing if one exists
 * in a cache. If not, one is generated and then cached.
 * @param ctor - Contructor of class to get JSON Schema from
 */
export function getJsonSchema(
  ctor: Function,
  options?: JsonSchemaOptions,
): JSONSchema {
  // In the near future the metadata will be an object with
  // different titles as keys
  const cached = MetadataInspector.getClassMetadata(JSON_SCHEMA_KEY, ctor);

  if (cached) {
    return cached;
  } else {
    const newSchema = modelToJsonSchema(ctor, options);
    MetadataInspector.defineMetadata(JSON_SCHEMA_KEY.key, newSchema, ctor);
    return newSchema;
  }
}

/**
 * Describe the provided Model as a reference to a definition shared by multiple
 * endpoints. The definition is included in the returned schema.
 *
 * @example
 *
 * ```ts
 * const schema = {
 *   $ref: '/definitions/Product',
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
 *
 * @param modelCtor - The model constructor (e.g. `Product`)
 * @param options - Additional options
 */
export function getJsonSchemaRef(
  modelCtor: Function,
  options?: JsonSchemaOptions,
): JSONSchema {
  const schemaWithDefinitions = getJsonSchema(modelCtor, options);
  const key = schemaWithDefinitions.title;

  // ctor is not a model
  if (!key) return schemaWithDefinitions;

  const definitions = Object.assign({}, schemaWithDefinitions.definitions);
  const schema = Object.assign({}, schemaWithDefinitions);
  delete schema.definitions;
  definitions[key] = schema;

  return {
    $ref: `#/definitions/${key}`,
    definitions,
  };
}

/**
 * Gets the wrapper function of primitives string, number, and boolean
 * @param type - Name of type
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
 * @param type - Type as string or wrapper
 */
export function isArrayType(type: string | Function) {
  return type === Array || type === 'array';
}

/**
 * Converts property metadata into a JSON property definition
 * @param meta
 */
export function metaToJsonProperty(meta: PropertyDefinition): JSONSchema {
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

  if (meta.jsonSchema) {
    Object.assign(propDef, meta.jsonSchema);
  }

  return result;
}

// NOTE(shimks) no metadata for: union, optional, nested array, any, enum,
// string literal, anonymous types, and inherited properties

/**
 * Converts a TypeScript class into a JSON Schema using TypeScript's
 * reflection API
 * @param ctor - Constructor of class to convert from
 */
export function modelToJsonSchema(
  ctor: Function,
  jsonSchemaOptions: JsonSchemaOptions = {},
): JSONSchema {
  const options = {...jsonSchemaOptions};
  options.visited = options.visited || {};

  const meta: ModelDefinition | {} = ModelMetadataHelper.getModelMetadata(ctor);

  // returns an empty object if metadata is an empty object
  if (!(meta instanceof ModelDefinition)) {
    return {};
  }

  const title = meta.title || ctor.name;

  if (options.visited[title]) return options.visited[title];

  const result: JSONSchema = {title};
  options.visited[title] = result;

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

    const propSchema = getJsonSchema(referenceType, options);

    includeReferencedSchema(referenceType.name, propSchema);

    function includeReferencedSchema(name: string, schema: JSONSchema) {
      if (!schema || !Object.keys(schema).length) return;
      result.definitions = result.definitions || {};

      // promote nested definition to the top level
      if (schema.definitions) {
        for (const key in schema.definitions) {
          if (key === title) continue;
          result.definitions[key] = schema.definitions[key];
        }
        delete schema.definitions;
      }

      result.definitions[name] = schema;
    }
  }
  return result;
}
