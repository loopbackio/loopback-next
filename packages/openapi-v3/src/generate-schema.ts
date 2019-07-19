// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/openapi-v3
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import { getTitleSuffix } from '@loopback/repository-json-schema';
import { TS_TYPE_KEY } from './controller-spec';
import { SchemaOptions } from './decorators/request-body.option1.decorator';
import { SchemaObject } from './types';

/**
 * Generate the `type` and `format` property in a Schema Object according to a
 * parameter's type.
 * `type` and `format` will be preserved if provided in `schema`
 *
 * @internal
 * @param type - The JavaScript type of a parameter
 * @param schema - The schema object provided in an parameter object
 */
export function resolveSchema(
  fn?: Function,
  schema: SchemaObject = {},
  options?: SchemaOptions,
): SchemaObject {
  let resolvedSchema: SchemaObject = {};

  if (typeof fn === 'function') {
    const noTsType = !(options && options[TS_TYPE_KEY]);
    if (fn === String) {
      resolvedSchema = { type: 'string' };
    } else if (fn === Number) {
      resolvedSchema = { type: 'number' };
    } else if (fn === Boolean) {
      resolvedSchema = { type: 'boolean' };
    } else if (fn === Date) {
      resolvedSchema = { type: 'string', format: 'date-time' };
    } else if (fn === Object && noTsType) {
      resolvedSchema = { type: 'object' };
    } else if (fn === Array) {
      resolvedSchema = { type: 'array' };
    } else {
      // schemaName will override the function name
      const schemaName = options && options.schemaName;
      const titleFromMeta = fn.name + getTitleSuffix(options);
      resolvedSchema = { $ref: `#/components/schemas/${schemaName || titleFromMeta}` };
    }
  }

  return Object.assign(schema, resolvedSchema, { options: Object.assign(options, { isVisited: true }) });
}
