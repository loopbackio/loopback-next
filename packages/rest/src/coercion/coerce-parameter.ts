// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  isReferenceObject,
  ParameterObject,
  ReferenceObject,
  SchemaObject,
} from '@loopback/openapi-v3';
import debugModule from 'debug';
import {
  RestHttpErrors,
  validateValueAgainstSchema,
  ValidationOptions,
  ValueValidationOptions,
} from '../';
import {parseJson} from '../parse-json';
import {DEFAULT_AJV_VALIDATION_OPTIONS} from '../validation/ajv-factory.provider';
import {
  DateCoercionOptions,
  getOAIPrimitiveType,
  IntegerCoercionOptions,
  isEmpty,
  isFalse,
  isTrue,
  isValidDateTime,
  matchDateFormat,
} from './utils';
import {Validator} from './validator';
const isRFC3339 = require('validator/lib/isRFC3339');
const debug = debugModule('loopback:rest:coercion');

/**
 * Coerce the http raw data to a JavaScript type data of a parameter
 * according to its OpenAPI schema specification.
 *
 * @param data - The raw data get from http request
 * @param schema - The parameter's schema defined in OpenAPI specification
 * @param options - The ajv validation options
 */
export async function coerceParameter(
  data: string | undefined | object,
  spec: ParameterObject,
  options?: ValueValidationOptions,
) {
  const schema = extractSchemaFromSpec(spec);

  if (!schema || isReferenceObject(schema)) {
    debug(
      'The parameter with schema %s is not coerced since schema' +
        'dereference is not supported yet.',
      schema,
    );
    return data;
  }
  const OAIType = getOAIPrimitiveType(schema.type, schema.format);
  const validator = new Validator({parameterSpec: spec});

  validator.validateParamBeforeCoercion(data);
  if (data === undefined) return data;

  switch (OAIType) {
    case 'byte':
      return coerceBuffer(data, spec);
    case 'date':
      return coerceDatetime(data, spec, {dateOnly: true});
    case 'date-time':
      return coerceDatetime(data, spec);
    case 'float':
    case 'double':
    case 'number':
      return coerceNumber(data, spec);
    case 'long':
      return coerceInteger(data, spec, {isLong: true});
    case 'integer':
      return coerceInteger(data, spec);
    case 'boolean':
      return coerceBoolean(data, spec);
    case 'object':
      return coerceObject(data, spec, options);
    case 'string':
    case 'password':
      return coerceString(data, spec);
    default:
      return data;
  }
}

function coerceString(data: string | object, spec: ParameterObject) {
  if (typeof data !== 'string')
    throw RestHttpErrors.invalidData(data, spec.name);

  debug('data of type string is coerced to %s', data);
  return data;
}

function coerceBuffer(data: string | object, spec: ParameterObject) {
  if (typeof data === 'object')
    throw RestHttpErrors.invalidData(data, spec.name);
  return Buffer.from(data, 'base64');
}

function coerceDatetime(
  data: string | object,
  spec: ParameterObject,
  options?: DateCoercionOptions,
) {
  if (typeof data === 'object' || isEmpty(data))
    throw RestHttpErrors.invalidData(data, spec.name);

  if (options?.dateOnly) {
    if (!matchDateFormat(data))
      throw RestHttpErrors.invalidData(data, spec.name);
  } else {
    if (!isRFC3339(data)) throw RestHttpErrors.invalidData(data, spec.name);
  }

  const coercedDate = new Date(data);
  if (!isValidDateTime(coercedDate))
    throw RestHttpErrors.invalidData(data, spec.name);
  return coercedDate;
}

function coerceNumber(data: string | object, spec: ParameterObject) {
  if (typeof data === 'object' || isEmpty(data))
    throw RestHttpErrors.invalidData(data, spec.name);

  const coercedNum = Number(data);
  if (isNaN(coercedNum)) throw RestHttpErrors.invalidData(data, spec.name);

  debug('data of type number is coerced to %s', coercedNum);
  return coercedNum;
}

function coerceInteger(
  data: string | object,
  spec: ParameterObject,
  options?: IntegerCoercionOptions,
) {
  if (typeof data === 'object' || isEmpty(data))
    throw RestHttpErrors.invalidData(data, spec.name);

  const coercedInt = Number(data);
  if (isNaN(coercedInt!)) throw RestHttpErrors.invalidData(data, spec.name);

  if (options?.isLong) {
    if (!Number.isInteger(coercedInt))
      throw RestHttpErrors.invalidData(data, spec.name);
  } else {
    if (!Number.isSafeInteger(coercedInt))
      throw RestHttpErrors.invalidData(data, spec.name);
  }

  debug('data of type integer is coerced to %s', coercedInt);
  return coercedInt;
}

function coerceBoolean(data: string | object, spec: ParameterObject) {
  if (typeof data === 'object' || isEmpty(data))
    throw RestHttpErrors.invalidData(data, spec.name);
  if (isTrue(data)) return true;
  if (isFalse(data)) return false;
  throw RestHttpErrors.invalidData(data, spec.name);
}

async function coerceObject(
  input: string | object,
  spec: ParameterObject,
  options: ValidationOptions = DEFAULT_AJV_VALIDATION_OPTIONS,
) {
  const data = parseJsonIfNeeded(input, spec);

  if (data == null) {
    // Skip any further checks and coercions, nothing we can do with `undefined`
    return data;
  }

  if (typeof data !== 'object' || Array.isArray(data))
    throw RestHttpErrors.invalidData(input, spec.name);

  const schema = extractSchemaFromSpec(spec);
  if (schema) {
    // Apply coercion based on properties defined by spec.schema
    await validateValueAgainstSchema(
      data,
      schema,
      {},
      {...options, coerceTypes: true, source: 'parameter'},
    );
  }

  return data;
}

/**
 * Extract the schema from an OpenAPI parameter specification. If the root level
 * one not found, search from media type 'application/json'.
 *
 * @param spec The parameter specification
 */
function extractSchemaFromSpec(
  spec: ParameterObject,
): SchemaObject | ReferenceObject | undefined {
  let schema = spec.schema;

  // If a query parameter is a url encoded Json object,
  // the schema is defined under content['application/json']
  if (!schema && spec.in === 'query') {
    schema = spec.content?.['application/json']?.schema;
  }

  return schema;
}

function parseJsonIfNeeded(
  data: string | object,
  spec: ParameterObject,
): string | object | undefined {
  if (typeof data !== 'string') return data;

  if (spec.in !== 'query' || (spec.in === 'query' && !spec.content)) {
    debug(
      'Skipping JSON.parse, argument %s is not a url encoded json object query parameter (since content field is missing in parameter schema)',
      spec.name,
    );
    return data;
  }

  if (data === '') {
    debug('Converted empty string to object value `undefined`');
    return undefined;
  }

  try {
    const result = parseJson(data);
    debug('Parsed parameter %s as %j', spec.name, result);
    return result;
  } catch (err) {
    debug('Cannot parse %s value %j as JSON: %s', spec.name, data, err.message);
    throw RestHttpErrors.invalidData(data, spec.name, {
      details: {
        syntaxError: err.message,
      },
    });
  }
}
