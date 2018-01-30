// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/repository-json-schema
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  ModelMetadataHelper,
  PropertyDefinition,
  ModelDefinition,
} from '@loopback/repository';
import {isEmpty, includes, forEach} from 'lodash';
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

export function isComplexType(ctor: Function) {
  return !includes([String, Number, Boolean, Object], ctor);
}

export function metaToJsonProperty(
  meta: PropertyDefinition,
): JsonDefinition | JsonDefinition[] {
  let ctor = meta.type as string | Function | Function[];
  let def: JsonDefinition | JsonDefinition[] = {};

  // errors out if @property.array() is not used on a property of array
  if (ctor === Array) {
    throw new Error('type is defined as an array');
  }

  // if an array (oneOf)
  if (ctor instanceof Array) {
    def = [];
    for (const c of ctor) {
      def.push(metaToJsonProperty({type: c}) as JsonDefinition);
    }
  } else {
    if (typeof ctor === 'string') {
      ctor = stringTypeToWrapper(ctor);
    }

    const propDef = isComplexType(ctor)
      ? {$ref: `#definitions/${ctor.name}`}
      : {type: ctor.name.toLowerCase()};

    if (meta.array) {
      def.type = 'array';
      def.items = propDef;
    } else {
      Object.assign(def, propDef);
    }
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

  if (!(meta instanceof ModelDefinition)) {
    return {};
  }

  // const defineSchemaProperty = (
  //   schema: JsonDefinition,
  //   prop: string,
  //   propCtor: Function | string,
  // ) => {
  //   const propMeta = meta.properties[prop];

  //   const propDef: JsonDefinition = determinePropertyDef(propCtor);

  //   if (!schema.properties) {
  //     schema.properties = {};
  //   }

  //   if (propMeta.validationKey) {
  //     if (propMeta.validationKey === 'oneOf') {
  //       let property: JsonDefinition = (schema.properties[prop] =
  //         schema.properties[prop] || {});
  //       if (!property.oneOf) {
  //         property.oneOf = [];
  //       }
  //       if (propMeta.array) {
  //         property.oneOf.push({type: 'array', items: propDef});
  //       } else {
  //         property.oneOf.push(propDef);
  //       }
  //     }
  //   } else if (propMeta.array) {
  //     schema.properties[prop] = {
  //       type: 'array',
  //       items: propDef,
  //     };
  //   } else {
  //     schema.properties[prop] = propDef;
  //   }

  //   // populating JSON Schema 'definitions'
  //   if (isComplexType(propCtor)) {
  //     const propSchema = getJsonSchema(propCtor);

  //     if (propSchema && Object.keys(propSchema).length > 0) {
  //       if (!schema.definitions) {
  //         schema.definitions = {};
  //       }

  //       // delete nested definition
  //       if (propSchema.definitions) {
  //         for (const key in propSchema.definitions) {
  //           schema.definitions[key] = propSchema.definitions[key];
  //         }
  //         delete propSchema.definitions;
  //       }

  //       schema.definitions[propCtor.name] = propSchema;
  //     }
  //   }
  // };

  // if (meta.title) {
  //   result.title = meta.title;
  // }
  result.title = ctor.name;

  if (meta.description) {
    result.description = meta.description;
  }

  for (const p in meta.properties) {
    if (!meta.properties[p].type) {
      continue;
    }
    if (!result.properties) {
      result.properties = {};
    }
    if (!result.properties[p]) {
      result.properties[p] = {};
    }
    const property = result.properties[p];
    const metaProperty = meta.properties[p];
    const metaType = metaProperty.type;

    // populating "properties" key
    if (metaProperty.validationKey) {
      if (metaProperty.validationKey === 'oneOf') {
        if (!(metaProperty.type instanceof Array)) {
          throw new Error('i cant believe uve done this'); // write test for this
        }

        property.oneOf = metaToJsonProperty(metaProperty) as JsonDefinition[];
      }
    } else {
      result.properties[p] = metaToJsonProperty(metaProperty) as JsonDefinition;
    }

    // populating JSON Schema 'definitions'
    if (typeof metaType === 'function' && isComplexType(metaType)) {
      const propSchema = getJsonSchema(metaType);

      if (propSchema && Object.keys(propSchema).length > 0) {
        if (!result.definitions) {
          result.definitions = {};
        }

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
      if (!result.required) {
        result.required = [];
      }
      result.required.push(p);
    }
  }
  return result;
}
