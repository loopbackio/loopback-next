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

// tslint:disable-next-line:no-any
export interface JsonSchemaOptions<T extends object = any> {
  includeRelations?: boolean;

  /// List of properties to exclude from the schema
  exclude?: (keyof T)[];

  /// Make all properties optional
  partial?: boolean;

  visited?: {[key: string]: JSONSchema};
}

/**
 * Gets the JSON Schema of a TypeScript model/class by seeing if one exists
 * in a cache. If not, one is generated and then cached.
 * @param ctor Contructor of class to get JSON Schema from
 */
// tslint:disable-next-line:no-any
export function getJsonSchema<T extends object = any>(
  ctor: Function & {prototype: T},
  options: JsonSchemaOptions<T> = {},
): JSONSchema {
  // NOTE(shimks) currently impossible to dynamically update
  const cached = MetadataInspector.getClassMetadata(JSON_SCHEMA_KEY, ctor);
  const key = 'config:' + JSON.stringify(options);

  if (cached && cached[key]) {
    return cached[key];
  } else {
    const newSchema = modelToJsonSchema(ctor, options);
    if (cached) {
      cached[key] = newSchema;
    } else {
      MetadataInspector.defineMetadata(
        JSON_SCHEMA_KEY.key,
        {[key]: newSchema},
        ctor,
      );
    }
    return newSchema;
  }
}

// tslint:disable-next-line:no-any
export function getJsonSchemaRef<T extends object = any>(
  ctor: Function & {prototype: T},
  options: JsonSchemaOptions<T> = {},
): JSONSchema {
  const schemaWithDefinitions = getJsonSchema(ctor, options);
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

export function modelToJsonSchemaRef(
  ctor: Function,
  options: JsonSchemaOptions = {},
): JSONSchema {
  const schemaWithDefinitions = modelToJsonSchema(ctor, options);
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

// NOTE(shimks) no metadata for: union, optional, nested array, any, enum,
// string literal, anonymous types, and inherited properties

/**
 * Converts a TypeScript class into a JSON Schema using TypeScript's
 * reflection API
 * @param ctor Constructor of class to convert from
 */
export function modelToJsonSchema<T extends object>(
  ctor: Function & {prototype: T},
  options: JsonSchemaOptions<T> = {},
): JSONSchema {
  options.visited = options.visited || {};

  const meta: ModelDefinition | {} = ModelMetadataHelper.getModelMetadata(ctor);

  // returns an empty object if metadata is an empty object
  // FIXME(bajtos) this pretty much breaks type validation.
  // We should return `undefined` instead of an empty object.
  if (!(meta instanceof ModelDefinition)) {
    return {};
  }

  let title = meta.title || ctor.name;
  if (options.partial) {
    title += 'Partial';
  }
  if (options.exclude) {
    title += `Without(${options.exclude.join(',')})`;
  }
  if (options.includeRelations) {
    title += 'WithRelations';
  }

  if (title in options.visited) return options.visited[title];

  const result: JSONSchema = {title};
  options.visited[title] = result;

  if (meta.description) {
    result.description = meta.description;
  }

  const propertySchemaOptions: JsonSchemaOptions = Object.assign({}, options);
  delete propertySchemaOptions.exclude;

  for (const p in meta.properties) {
    if (!meta.properties[p].type) {
      continue;
    }

    if (options.exclude && options.exclude.includes(p as keyof T)) {
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

    const propSchema = getJsonSchema(referenceType, propertySchemaOptions);
    includeReferencedSchema(referenceType.name, propSchema);
  }

  if (options.partial) {
    delete result.required;
  }

  if (options.includeRelations) {
    for (const r in meta.relations) {
      result.properties = result.properties || {};
      const relMeta = meta.relations[r];
      const targetType = resolveType(relMeta.target);
      const targetSchema = getJsonSchema(targetType, options);
      const targetTitle = targetSchema.title;
      if (!targetTitle) {
        throw new Error(
          `The target of the relation ${title}.${relMeta.name} is not a model!`,
        );
      }
      const targetRef = {$ref: `#/definitions/${targetTitle}`};

      const propDef = relMeta.targetsMany
        ? <JSONSchema>{
            type: 'array',
            items: targetRef,
          }
        : targetRef;

      // IMPORTANT: r !== relMeta.name
      // E.g. belongsTo sets r="categoryId" but name="category"
      result.properties[relMeta.name] =
        result.properties[relMeta.name] || propDef;
      includeReferencedSchema(targetTitle, targetSchema);
    }
  }
  return result;

  function includeReferencedSchema(name: string, propSchema: JSONSchema) {
    if (!propSchema || !Object.keys(propSchema).length) return;

    result.definitions = result.definitions || {};

    // promote nested definition to the top level
    if (propSchema.definitions) {
      for (const key in propSchema.definitions) {
        if (key === title) continue;
        result.definitions[key] = propSchema.definitions[key];
      }
      delete propSchema.definitions;
    }

    result.definitions[name] = propSchema;
  }
}
