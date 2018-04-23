// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/openapi-v3-types
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {SchemaObject, ReferenceObject} from './openapi-v3-spec-types';

/**
 * Type guard for OpenAPI 3.0.0 schema object
 * @param schema An OpenAPI 3.0.0 schema object
 */

export function isSchemaObject(
  schema: SchemaObject | ReferenceObject,
): schema is SchemaObject {
  return !schema.hasOwnProperty('$ref');
}

export function isReferenceObject(obj: object): obj is ReferenceObject {
  return obj.hasOwnProperty('$ref');
}
