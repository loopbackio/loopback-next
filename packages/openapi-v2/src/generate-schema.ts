// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/openapi-v2
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ParameterType, SchemaObject} from '@loopback/openapi-spec';
import * as stream from 'stream';

/**
 * Get openapi type name for a JavaScript type
 * @param type JavaScript type
 */
export function getTypeForNonBodyParam(type: Function): ParameterType {
  if (type === String) {
    return 'string';
  } else if (type === Number) {
    return 'number';
  } else if (type === Boolean) {
    return 'boolean';
  } else if (type === Array) {
    return 'array';
  } else if (isReadableStream(type)) {
    return 'file';
  }
  return 'string';
}

/**
 * Get openapi schema for a JavaScript type for a body parameter
 * @param type JavaScript type
 */
export function getSchemaForBodyParam(type: Function): SchemaObject {
  const schema: SchemaObject = {};
  let typeName;
  if (type === String) {
    typeName = 'string';
  } else if (type === Number) {
    typeName = 'number';
  } else if (type === Boolean) {
    typeName = 'boolean';
  } else if (type === Array) {
    // item type cannot be inspected
    typeName = 'array';
  } else if (isReadableStream(type)) {
    typeName = 'file';
  } else if (type === Object) {
    typeName = 'object';
  }
  if (typeName) {
    schema.type = typeName;
  } else {
    schema.$ref = '#/definitions/' + type.name;
  }
  return schema;
}

/**
 * Check if the given type is `stream.Readable` or a subclasses of
 * `stream.Readable`
 * @param type JavaScript type function
 */
export function isReadableStream(type: Object): boolean {
  if (typeof type !== 'function') return false;
  if (type === stream.Readable) return true;
  return isReadableStream(Object.getPrototypeOf(type));
}
