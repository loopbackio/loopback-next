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
  RelationMetadata,
  resolveType,
} from '@loopback/repository';
import {JSONSchema6 as JSONSchema} from 'json-schema';
import {JSON_SCHEMA_KEY, MODEL_TYPE_KEYS} from './keys';

export interface JsonSchemaOptions {
  /**
   * Set this flag if you want the schema to define navigational properties
   * for model relations.
   */
  includeRelations?: boolean;

  /**
   * Set this flag to mark all model properties as optional. This is typically
   * used to describe request body of PATCH endpoints.
   */
  partial?: boolean;

  /**
   * @private
   */
  visited?: {[key: string]: JSONSchema};
}

/**
 * @private
 */
export function buildModelCacheKey(options: JsonSchemaOptions = {}): string {
  const flags = Object.keys(options);

  // Backwards compatibility
  // Preserve cache keys "modelOnly" and "modelWithRelations"
  if (flags.length === 0) {
    return MODEL_TYPE_KEYS.ModelOnly;
  } else if (flags.length === 1 && options.includeRelations) {
    return MODEL_TYPE_KEYS.ModelWithRelations;
  }

  // New key schema: concatenate names of options (flags) that are set.
  // For example: "includeRelations+partial"
  flags.sort();
  return flags.join('+');
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
  const key = buildModelCacheKey(options);
  let schema = cached && cached[key];

  if (!schema) {
    // Create new json schema from model
    // if not found in cache for specific key
    schema = modelToJsonSchema(ctor, options);
    if (cached) {
      // Add a new key to the cached schema of the model
      cached[key] = schema;
    } else {
      // Define new metadata and set in cache
      MetadataInspector.defineMetadata(
        JSON_SCHEMA_KEY.key,
        {[key]: schema},
        ctor,
      );
    }
  }

  return schema;
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

/**
 * Checks and return navigational property definition for the relation
 * @param relMeta Relation metadata object
 * @param targetRef Schema definition for the target model
 */
export function getNavigationalPropertyForRelation(
  relMeta: RelationMetadata,
  targetRef: JSONSchema,
): JSONSchema {
  if (relMeta.targetsMany === true) {
    // Targets an array of object, like, hasMany
    return {
      type: 'array',
      items: targetRef,
    };
  } else if (relMeta.targetsMany === false) {
    // Targets single object, like, hasOne, belongsTo
    return targetRef;
  } else {
    // targetsMany is undefined or null
    // not allowed if includeRelations is true
    throw new Error(`targetsMany attribute missing for ${relMeta.name}`);
  }
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

  let title = meta.title || ctor.name;
  if (options.partial) {
    title += 'Partial';
  }
  if (options.includeRelations) {
    title += 'WithRelations';
  }

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
    if (metaProperty.required && !options.partial) {
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
  }

  if (options.includeRelations) {
    for (const r in meta.relations) {
      result.properties = result.properties || {};
      const relMeta = meta.relations[r];
      const targetType = resolveType(relMeta.target);
      const targetSchema = getJsonSchema(targetType, options);
      const targetRef = {$ref: `#/definitions/${targetSchema.title}`};
      const propDef = getNavigationalPropertyForRelation(relMeta, targetRef);

      result.properties[relMeta.name] =
        result.properties[relMeta.name] || propDef;
      includeReferencedSchema(targetSchema.title!, targetSchema);
    }
  }

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
  return result;
}
