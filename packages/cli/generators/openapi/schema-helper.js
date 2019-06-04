// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const {
  isExtension,
  titleCase,
  escapePropertyName,
  toJsonStr,
  toFileName,
} = require('./utils');

function setImport(typeSpec) {
  if (typeSpec.fileName) {
    typeSpec.import = `import {${typeSpec.className}} from './${getBaseName(
      typeSpec.fileName,
    )}';`;
  }
}

function getTypeSpec(schema, options) {
  const objectTypeMapping = options.objectTypeMapping;
  const schemaMapping = options.schemaMapping || {};
  const resolvedSchema = resolveSchema(schemaMapping, schema);
  let typeSpec = objectTypeMapping.get(resolvedSchema);
  if (!typeSpec) {
    typeSpec = {};
    objectTypeMapping.set(resolvedSchema, typeSpec);
  }
  setImport(typeSpec);
  return typeSpec;
}

function getDefault(schema, options) {
  let defaultVal = '';
  if (options && options.includeDefault && schema.default !== undefined) {
    defaultVal = ' = ' + toJsonStr(schema.default);
  }
  return defaultVal;
}

function getBaseName(tsFileName) {
  if (tsFileName.endsWith('.ts')) {
    return tsFileName.substring(0, tsFileName.length - 3);
  }
  return tsFileName;
}

/**
 * Add the import statements to the given type spec's imports
 * @param {object} typeSpec
 * @param {string[]} imports
 */
function addImports(typeSpec, ...imports) {
  typeSpec.imports = typeSpec.imports || [];
  for (const i of imports) {
    if (i == null) continue;
    // Skip circular import
    if (typeSpec.import === i) continue;
    if (!typeSpec.imports.includes(i)) {
      typeSpec.imports.push(i);
    }
  }
}

/**
 * Collect import statements from a referenced type
 * @param {*} typeSpec
 * @param {*} referencedType
 */
function collectImports(typeSpec, referencedType) {
  if (referencedType.className != null) {
    // Add the referenced import
    addImports(typeSpec, referencedType.import);
  } else {
    if (Array.isArray(referencedType.imports)) {
      addImports(typeSpec, ...referencedType.imports);
    }
  }
}

/**
 * Map composite type (oneOf|anyOf|allOf)
 * @param {object} schema
 * @param {object} options
 */
function mapCompositeType(schema, options) {
  options = Object.assign({}, options, {includeDefault: false});
  const typeSpec = getTypeSpec(schema, options);
  let separator = '';
  let candidates = [];
  if (Array.isArray(schema.oneOf)) {
    separator = ' | ';
    candidates = schema.oneOf;
  } else if (Array.isArray(schema.anyOf)) {
    separator = ' | ';
    candidates = schema.anyOf;
  } else if (Array.isArray(schema.allOf)) {
    separator = ' & ';
    candidates = schema.allOf;
  }
  if (!separator) return undefined;
  const types = candidates.map(t => mapSchemaType(t, options));
  const members = Array.from(new Set(types));
  typeSpec.members = members;
  const defaultVal = getDefault(schema, options);
  const memberSignatures = members.map(m => m.signature).join(separator);
  typeSpec.declaration = memberSignatures;
  typeSpec.signature = (typeSpec.className || memberSignatures) + defaultVal;
  members.forEach(m => collectImports(typeSpec, m));
  return typeSpec;
}

function mapArrayType(schema, options) {
  if (schema.type === 'array') {
    const opts = Object.assign({}, options, {includeDefault: false});
    const typeSpec = getTypeSpec(schema, options);
    const itemTypeSpec = mapSchemaType(schema.items, opts);
    const defaultVal = getDefault(schema, options);
    typeSpec.name = itemTypeSpec.signature + '[]';
    typeSpec.declaration = itemTypeSpec.signature + '[]';
    typeSpec.signature =
      (typeSpec.className || itemTypeSpec.signature + '[]') + defaultVal;
    typeSpec.itemType = itemTypeSpec;
    collectImports(typeSpec, itemTypeSpec);
    return typeSpec;
  }
  return undefined;
}

function mapObjectType(schema, options) {
  if (schema.type === 'object' || schema.properties) {
    const defaultVal = getDefault(schema, options);
    const typeSpec = getTypeSpec(schema, options);
    if (typeSpec.className) {
      typeSpec.kind = 'class';
    } else {
      typeSpec.imports = [];
    }
    if (typeSpec.declaration != null) {
      if (typeSpec.declaration === '') {
        typeSpec.signature = typeSpec.className;
      }
      return typeSpec;
    } else {
      typeSpec.declaration = ''; // in-progress
    }
    const properties = [];
    const required = schema.required || [];
    for (const p in schema.properties) {
      const suffix = required.includes(p) ? '' : '?';
      const propertyType = mapSchemaType(
        schema.properties[p],
        Object.assign({}, options, {
          includeDefault: !!typeSpec.className, // Only include default for class
        }),
      );
      // The property name might have chars such as `-`
      const propName = escapePropertyName(p);

      let propDecoration = `@property()`;

      if (required.includes(p)) {
        propDecoration = `@property({required: true})`;
      }

      if (propertyType.itemType) {
        const itemType =
          propertyType.itemType.kind === 'class'
            ? propertyType.itemType.className
            : // The item type can be an alias such as `export type ID = string`
              getJSType(propertyType.itemType.declaration) ||
              // The item type can be `string`
              getJSType(propertyType.itemType.name);
        if (itemType) {
          // Use `@property.array` for array types
          propDecoration = `@property.array(${itemType})`;
          if (propertyType.itemType.className) {
            // The referenced item type is either a class or type
            collectImports(typeSpec, propertyType.itemType);
          }
        }
      }
      const propSpec = {
        name: p,
        signature: `${propName + suffix}: ${propertyType.signature};`,
        decoration: propDecoration,
      };
      if (schema.properties[p].description) {
        propSpec.description = schema.properties[p].description;
      }
      collectImports(typeSpec, propertyType);
      properties.push(propSpec);
    }
    typeSpec.properties = properties;
    const propertySignatures = properties.map(p => p.signature);

    // Handle `additionalProperties`
    if (schema.additionalProperties === true) {
      propertySignatures.push('[additionalProperty: string]: any;');
    } else if (schema.additionalProperties) {
      propertySignatures.push(
        '[additionalProperty: string]: ' +
          mapSchemaType(schema.additionalProperties).signature +
          ';',
      );
    }
    typeSpec.declaration = `{
  ${propertySignatures.join('\n  ')}
}`;
    typeSpec.signature =
      (typeSpec.className || typeSpec.declaration) + defaultVal;
    return typeSpec;
  }
  return undefined;
}

function mapPrimitiveType(schema, options) {
  /**
   * integer	integer	int32	    signed 32 bits
   * long	    integer	int64	    signed 64 bits
   * float	  number	float
   * double	  number	double
   * string	  string
   * byte	    string	byte	    base64 encoded characters
   * binary	  string	binary	  any sequence of octets
   * boolean	boolean
   * date	    string	date	    As defined by full-date - RFC3339
   * dateTime	string	date-time	As defined by date-time - RFC3339
   * password	string	password	A hint to UIs to obscure input.
   */
  let jsType = 'string';
  switch (schema.type) {
    case 'integer':
    case 'number':
      jsType = 'number';
      break;
    case 'boolean':
      jsType = 'boolean';
      break;
    case 'string':
      switch (schema.format) {
        case 'date':
        case 'date-time':
          jsType = 'Date';
          break;
        case 'binary':
          jsType = 'Buffer';
          break;
        case 'byte':
        case 'password':
          jsType = 'string';
          break;
      }
      break;
  }
  // Handle enums
  if (Array.isArray(schema.enum)) {
    jsType = schema.enum.map(v => toJsonStr(v)).join(' | ');
  }
  const typeSpec = getTypeSpec(schema, options);
  const defaultVal = getDefault(schema, options);
  typeSpec.declaration = jsType;
  typeSpec.signature = typeSpec.className || typeSpec.declaration + defaultVal;
  typeSpec.name = typeSpec.name || jsType;
  return typeSpec;
}

const JSTypeMapping = {
  number: Number,
  boolean: Boolean,
  string: String,
  Date: Date,
  Buffer: Buffer,
};

/**
 * Mapping simple type names to JS Type constructors
 * @param {string} type Simple type name
 */
function getJSType(type) {
  const ctor = JSTypeMapping[type];
  return ctor && ctor.name;
}

/**
 *
 * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.1.md#data-types
 *
 * @param {object} schema
 */
function mapSchemaType(schema, options) {
  options = options || {};
  if (!options.objectTypeMapping) {
    options.objectTypeMapping = new Map();
  }

  const typeSpec = getTypeSpec(schema, options);
  if (typeSpec.signature) return typeSpec;

  const compositeType = mapCompositeType(schema, options);
  if (compositeType) {
    return compositeType;
  }

  const arrayType = mapArrayType(schema, options);
  if (arrayType) {
    return arrayType;
  }

  const objectType = mapObjectType(schema, options);
  if (objectType) {
    return objectType;
  }

  return mapPrimitiveType(schema, options);
}

/**
 * Map the schema by `x-$ref`
 * @param {object} schemaMapping
 * @param {object} schema
 */
function resolveSchema(schemaMapping, schema) {
  if (!schema['x-$ref']) return schema;
  let resolved = schema;
  while (resolved && resolved['x-$ref']) {
    resolved = schemaMapping[resolved['x-$ref']];
  }
  return resolved || schema;
}

/**
 * Generate model definitions from openapi spec
 * @param {object} apiSpec
 */
function generateModelSpecs(apiSpec, options) {
  options = options || {};
  const objectTypeMapping = (options.objectTypeMapping =
    options.objectTypeMapping || new Map());

  const schemaMapping = (options.schemaMapping = options.schemaMapping || {});

  registerNamedSchemas(apiSpec, options);

  const models = [];
  // Generate models from schema objects
  for (const s in options.schemaMapping) {
    if (isExtension(s)) continue;
    const schema = options.schemaMapping[s];
    const model = mapSchemaType(schema, {objectTypeMapping, schemaMapping});
    // `model` is `undefined` for primitive types
    if (model == null) continue;
    if (model.className) {
      // The model might be a $ref
      if (!models.includes(model)) {
        models.push(model);
      }
    }
  }
  return models;
}

/**
 * Register the named schema
 * @param {string} schemaName Schema name
 * @param {object} schema Schema object
 * @param {object} typeRegistry Options for objectTypeMapping & schemaMapping
 */
function registerSchema(schemaName, schema, typeRegistry) {
  if (typeRegistry.objectTypeMapping.get(schema)) return;
  typeRegistry.schemaMapping[`#/components/schemas/${schemaName}`] = schema;
  const className = titleCase(schemaName);
  typeRegistry.objectTypeMapping.set(schema, {
    description: schema.description || schemaName,
    name: schemaName,
    className,
    fileName: getModelFileName(schemaName),
    properties: [],
    imports: [],
  });
}

/**
 * Register spec.components.schemas
 * @param {*} apiSpec OpenAPI spec
 * @param {*} typeRegistry options for objectTypeMapping & schemaMapping
 */
function registerNamedSchemas(apiSpec, typeRegistry) {
  const schemas =
    (apiSpec && apiSpec.components && apiSpec.components.schemas) || {};

  // First map schema objects to names
  for (const s in schemas) {
    if (isExtension(s)) continue;
    const schema = schemas[s];
    registerSchema(s, schema, typeRegistry);
  }
}

function getModelFileName(modelName) {
  let name = modelName;
  if (modelName.endsWith('Model')) {
    name = modelName.substring(0, modelName.length - 'Model'.length);
  }
  return toFileName(name) + '.model.ts';
}

module.exports = {
  mapSchemaType,
  registerSchema,
  registerNamedSchemas,
  generateModelSpecs,
  getModelFileName,
};
