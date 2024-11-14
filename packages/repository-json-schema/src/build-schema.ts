// Copyright IBM Corp. and LoopBack contributors 2018,2020. All Rights Reserved.
// Node module: @loopback/repository-json-schema
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {MetadataInspector} from '@loopback/core';
import {
  isBuiltinType,
  ModelDefinition,
  ModelMetadataHelper,
  Null,
  PropertyDefinition,
  PropertyType,
  RelationMetadata,
  resolveType,
} from '@loopback/repository';
import debugFactory from 'debug';
import {inspect} from 'util';
import {JsonSchema} from './index';
import {JSON_SCHEMA_KEY} from './keys';
const debug = debugFactory('loopback:repository-json-schema:build-schema');

export interface JsonSchemaOptions<T extends object> {
  /**
   * The title to use in the generated schema.
   *
   * When using options like `exclude`, the auto-generated title can be
   * difficult to read for humans. Use this option to change the title to
   * a more meaningful value.
   */
  title?: string;

  /**
   * Set this flag if you want the schema to define navigational properties
   * for model relations.
   */
  includeRelations?: boolean;

  /**
   * Set this flag to mark all model properties as optional. This is typically
   * used to describe request body of PATCH endpoints. This option will be
   * overridden by the "optional" option if it is set and non-empty.
   *
   * The flag also applies to nested model instances if its value is set to
   * 'deep', such as:
   *
   * @example
   * ```ts
   * @model()
   * class Address {
   *  @property()
   *  street: string;
   *  @property()
   *  city: string;
   *  @property()
   *  state: string;
   *  @property()
   *  zipCode: string;
   * }
   *
   * @model()
   * class Customer {
   *   @property()
   *   address: Address;
   * }
   *
   * // The following schema allows properties of `customer` optional, but not
   * // `customer.address`
   * const schemaRef1 = getModelSchemaRef(Customer, {partial: true});
   *
   * // The following schema allows properties of `customer` and
   * // `customer.address` optional
   * const schemaRef2 = getModelSchemaRef(Customer, {partial: 'deep'});
   * ```
   */
  partial?: boolean | 'deep';

  /**
   * List of model properties to exclude from the schema.
   */
  exclude?: (keyof T)[];

  /**
   * List of model properties to mark as optional. Overrides the "partial"
   * option if it is not empty.
   */
  optional?: (keyof T)[];

  /**
   * @internal
   */
  visited?: {[key: string]: JsonSchema};
}

/**
 * @internal
 */
export function buildModelCacheKey<T extends object>(
  options: JsonSchemaOptions<T> = {},
): string {
  // Backwards compatibility: preserve cache key "modelOnly"
  if (Object.keys(options).length === 0) {
    return 'modelOnly';
  }

  // New key schema: use the same suffix as we use for schema title
  // For example: "modelPartialWithRelations"
  // Note this new key schema preserves the old key "modelWithRelations"
  return 'model' + (options.title ?? '') + getTitleSuffix(options);
}

/**
 * Gets the JSON Schema of a TypeScript model/class by seeing if one exists
 * in a cache. If not, one is generated and then cached.
 * @param ctor - Constructor of class to get JSON Schema from
 */
export function getJsonSchema<T extends object>(
  ctor: Function & {prototype: T},
  options?: JsonSchemaOptions<T>,
): JsonSchema {
  // In the near future the metadata will be an object with
  // different titles as keys
  const cached = MetadataInspector.getClassMetadata(JSON_SCHEMA_KEY, ctor, {
    ownMetadataOnly: true,
  });
  const key = buildModelCacheKey(options);
  let schema = cached?.[key];

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
export function getJsonSchemaRef<T extends object>(
  modelCtor: Function & {prototype: T},
  options?: JsonSchemaOptions<T>,
): JsonSchema {
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
    case 'object':
    case 'any': {
      wrapper = Object;
      break;
    }
    case 'date': {
      wrapper = Date;
      break;
    }
    case 'binary':
    case 'buffer': {
      wrapper = Buffer;
      break;
    }
    case 'null': {
      wrapper = Null;
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
export function isArrayType(type: string | Function | PropertyType) {
  return type === Array || type === 'array';
}

/**
 * Converts property metadata into a JSON property definition
 * @param meta
 */
export function metaToJsonProperty(meta: PropertyDefinition): JsonSchema {
  const propDef: JsonSchema = {};
  let result: JsonSchema;
  let propertyType = meta.type as string | Function;

  if (isArrayType(propertyType) && meta.itemType) {
    if (isArrayType(meta.itemType) && !meta.jsonSchema) {
      throw new Error(
        'You must provide the "jsonSchema" field when define ' +
          'a nested array property',
      );
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
  } else if (propertyType === 'buffer') {
    Object.assign(propDef, {
      type: 'string',
      format: 'buffer',
    });
  } else if (propertyType === 'Binary') {
    Object.assign(propDef, {
      type: 'string',
      format: 'binary',
    });
  } else if (propertyType === 'any') {
    // no-op, the json schema for any type is {}
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
  targetRef: JsonSchema,
): JsonSchema {
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

function buildSchemaTitle<T extends object>(
  ctor: Function & {prototype: T},
  meta: ModelDefinition,
  options: JsonSchemaOptions<T>,
) {
  if (options.title) return options.title;
  const title = meta.title || ctor.name;
  return title + getTitleSuffix(options);
}

/**
 * Checks the options and generates a descriptive suffix using compatible chars
 * @param options json schema options
 */
function getTitleSuffix<T extends object>(options: JsonSchemaOptions<T> = {}) {
  let suffix = '';

  if (options.optional?.length) {
    suffix += `Optional_${options.optional.join('-')}_`;
  } else if (options.partial) {
    suffix += 'Partial';
  }
  if (options.exclude?.length) {
    suffix += `Excluding_${options.exclude.join('-')}_`;
  }
  if (options.includeRelations) {
    suffix += 'WithRelations';
  }

  return suffix;
}

function stringifyOptions(modelSettings: object = {}) {
  return inspect(modelSettings, {
    depth: Infinity,
    maxArrayLength: Infinity,
    breakLength: Infinity,
  });
}

function isEmptyJson(obj: object) {
  return !(obj && Object.keys(obj).length);
}

/**
 * Checks the options and generates a descriptive suffix that contains the
 * TypeScript type and options
 * @param typeName - TypeScript's type name
 * @param options - json schema options
 */
function getDescriptionSuffix<T extends object>(
  typeName: string,
  rawOptions: JsonSchemaOptions<T> = {},
) {
  const options = {...rawOptions};

  delete options.visited;
  if (options.optional && !options.optional.length) {
    delete options.optional;
  }

  const type = typeName;
  let tsType = type;
  if (options.includeRelations) {
    tsType = `${type}WithRelations`;
  }
  if (options.partial) {
    tsType = `Partial<${tsType}>`;
  }
  if (options.exclude) {
    const excludedProps = options.exclude.map(p => `'${String(p)}'`);
    tsType = `Omit<${tsType}, ${excludedProps.join(' | ')}>`;
  }
  if (options.optional) {
    const optionalProps = options.optional.map(p => `'${String(p)}'`);
    tsType = `@loopback/repository-json-schema#Optional<${tsType}, ${optionalProps.join(
      ' | ',
    )}>`;
  }

  return !isEmptyJson(options)
    ? `(tsType: ${tsType}, schemaOptions: ${stringifyOptions(options)})`
    : '';
}

// NOTE(shimks) no metadata for: union, optional, nested array, any, enum,
// string literal, anonymous types, and inherited properties

/**
 * Converts a TypeScript class into a JSON Schema using TypeScript's
 * reflection API
 * @param ctor - Constructor of class to convert from
 */
export function modelToJsonSchema<T extends object>(
  ctor: Function & {prototype: T},
  jsonSchemaOptions: JsonSchemaOptions<T> = {},
): JsonSchema {
  const options = {...jsonSchemaOptions};
  options.visited = options.visited ?? {};
  options.optional = options.optional ?? [];
  const partial = options.partial && !options.optional.length;

  if (options.partial && !partial) {
    debug('Overriding "partial" option with "optional" option');
    delete options.partial;
  }

  debug('Creating schema for model %s', ctor.name);
  debug('JSON schema options: %o', options);

  const modelDef = ModelMetadataHelper.getModelMetadata(ctor);

  // returns an empty object if metadata is an empty object
  if (modelDef == null || Object.keys(modelDef).length === 0) {
    return {};
  }

  const meta = modelDef as ModelDefinition;

  debug('Model settings', meta.settings);

  const title = buildSchemaTitle(ctor, meta, options);
  if (options.visited[title]) return options.visited[title];

  const result: JsonSchema = {title};
  options.visited[title] = result;

  result.type = 'object';

  const descriptionSuffix = getDescriptionSuffix(ctor.name, options);

  if (meta.description) {
    const formatSuffix = descriptionSuffix ? ` ${descriptionSuffix}` : '';

    result.description = meta.description + formatSuffix;
  } else if (descriptionSuffix) {
    result.description = descriptionSuffix;
  }

  for (const p in meta.properties) {
    if (options.exclude?.includes(p as keyof T)) {
      debug('Property % is excluded by %s', p, options.exclude);
      continue;
    }

    if (meta.properties[p].type == null) {
      // Circular import of model classes can lead to this situation
      throw new Error(
        `Property ${ctor.name}.${p} does not have "type" in its definition`,
      );
    }

    result.properties = result.properties ?? {};
    result.properties[p] = result.properties[p] || {};

    const metaProperty = Object.assign({}, meta.properties[p]);

    // populating "properties" key
    result.properties[p] = metaToJsonProperty(metaProperty);

    // handling 'required' metadata
    const optional = options.optional.includes(p as keyof T);

    if (metaProperty.required && !(partial || optional)) {
      result.required = result.required ?? [];
      result.required.push(p);
    }

    // populating JSON Schema 'definitions'
    // shimks: ugly type casting; this should be replaced by logic to throw
    // error if itemType/type is not a string or a function
    const resolvedType = resolveType(metaProperty.type) as string | Function;
    const referenceType = isArrayType(resolvedType)
      ? // shimks: ugly type casting; this should be replaced by logic to throw
        // error if itemType/type is not a string or a function
        typeof metaProperty.itemType === 'string'
        ? resolveType(metaProperty.itemType)
        : resolveType(metaProperty.itemType)
      : resolvedType;

    if (typeof referenceType !== 'function' || isBuiltinType(referenceType)) {
      continue;
    }

    const propOptions = {...options};
    if (propOptions.partial !== 'deep') {
      // Do not cascade `partial` to nested properties
      delete propOptions.partial;
    }
    if (propOptions.includeRelations === true) {
      // Do not cascade `includeRelations` to nested properties
      delete propOptions.includeRelations;
    }
    // `title` is the unique identity of a schema,
    // it should be removed from the `options`
    // when generating the relation or property schemas
    delete propOptions.title;
    // Do not cascade `exclude` to nested properties.
    delete propOptions.exclude;

    const propSchema = getJsonSchema(referenceType, propOptions);

    // JSONSchema6Definition allows both boolean and JSONSchema6 types
    if (typeof result.properties[p] !== 'boolean') {
      const prop = result.properties[p] as JsonSchema;
      const propTitle = propSchema.title ?? referenceType.name;
      const targetRef = {$ref: `#/definitions/${propTitle}`};

      if (prop.type === 'array' && prop.items) {
        // Update $ref for array type
        prop.items = targetRef;
      } else {
        result.properties[p] = targetRef;
      }
      includeReferencedSchema(propTitle, propSchema);
    }
  }

  result.additionalProperties = meta.settings.strict === false;
  debug('  additionalProperties?', result.additionalProperties);

  if (options.includeRelations) {
    for (const r in meta.relations) {
      result.properties = result.properties ?? {};
      const relMeta = meta.relations[r];
      const targetType = resolveType(relMeta.target);

      // `title` is the unique identity of a schema,
      // it should be removed from the `options`
      // when generating the relation or property schemas
      const targetOptions = {...options};
      delete targetOptions.title;

      const targetSchema = getJsonSchema(targetType, targetOptions);
      const targetRef = {$ref: `#/definitions/${targetSchema.title}`};
      const propDef = getNavigationalPropertyForRelation(relMeta, targetRef);

      result.properties[relMeta.name] =
        result.properties[relMeta.name] || propDef;
      if ((relMeta as {keyFrom: string}).keyFrom) {
        result.properties.foreignKey = (relMeta as {keyFrom: string})
          .keyFrom as JsonSchema;
      }

      includeReferencedSchema(targetSchema.title!, targetSchema);
    }
  }

  function includeReferencedSchema(name: string, schema: JsonSchema) {
    if (!schema || !Object.keys(schema).length) return;

    // promote nested definition to the top level
    if (result !== schema?.definitions) {
      for (const key in schema.definitions) {
        if (key === title) continue;
        result.definitions = result.definitions ?? {};
        result.definitions[key] = schema.definitions[key];
      }
      delete schema.definitions;
    }

    if (result !== schema) {
      result.definitions = result.definitions ?? {};
      result.definitions[name] = schema;
    }
  }

  if (meta.jsonSchema) {
    Object.assign(result, meta.jsonSchema);
  }
  return result;
}
