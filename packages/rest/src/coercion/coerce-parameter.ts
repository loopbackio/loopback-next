// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ParameterObject, isReferenceObject} from '@loopback/openapi-v3-types';
import {Validator} from './validator';
import * as debugModule from 'debug';
import {RestHttpErrors} from '../';
import {
  getOAIPrimitiveType,
  isEmpty,
  isFalse,
  isTrue,
  isValidDateTime,
  matchDateFormat,
  DateCoercionOptions,
  IntegerCoercionOptions,
} from './utils';
const isRFC3339 = require('validator/lib/isRFC3339');
const debug = debugModule('loopback:rest:coercion');

/**
 * Coerce the http raw data to a JavaScript type data of a parameter
 * according to its OpenAPI schema specification.
 *
 * @param data The raw data get from http request
 * @param schema The parameter's schema defined in OpenAPI specification
 */
export function coerceParameter(
  data: string | undefined | object,
  spec: ParameterObject,
) {
  const schema = spec.schema;
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
    case 'string':
    case 'password':
    // serialize will be supported in next PR
    case 'serialize':
    default:
      return data;
  }
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

  if (options && options.dateOnly) {
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

  if (options && options.isLong) {
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
