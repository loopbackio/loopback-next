// Copyright IBM Corp. and LoopBack contributors 2018,2020. All Rights Reserved.
// Node module: @loopback/openapi-v3
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  FilterSchemaOptions,
  getFilterJsonSchemaFor,
  getWhereJsonSchemaFor,
  Model,
} from '@loopback/repository-json-schema';
import {isSchemaObject} from 'openapi3-ts';
import {jsonToSchemaObject} from './json-to-schema';
import {SchemaObject} from './types';

/**
 * Build an OpenAPI schema describing the format of the "filter" object
 * used to query model instances.
 *
 * Note we don't take the model properties into account yet and return
 * a generic json schema allowing any "where" condition.
 *
 * @param modelCtor - The model constructor to build the filter schema for.
 * @param options - Options to build the filter schema.
 */
export function getFilterSchemaFor(
  modelCtor: typeof Model,
  options?: FilterSchemaOptions,
): SchemaObject {
  const jsonSchema = getFilterJsonSchemaFor(modelCtor, options);
  const schema = jsonToSchemaObject(jsonSchema);
  if (isSchemaObject(schema)) {
    schema['x-typescript-type'] =
      `@loopback/repository#Filter<${modelCtor.name}>`;
  }
  return schema;
}

/**
 * Build a OpenAPI schema describing the format of the "where" object
 * used to filter model instances to query, update or delete.
 *
 * Note we don't take the model properties into account yet and return
 * a generic json schema allowing any "where" condition.
 *
 * @param modelCtor - The model constructor to build the filter schema for.
 */
export function getWhereSchemaFor(modelCtor: typeof Model): SchemaObject {
  const jsonSchema = getWhereJsonSchemaFor(modelCtor);
  const schema = jsonToSchemaObject(jsonSchema);
  if (isSchemaObject(schema)) {
    schema['x-typescript-type'] =
      `@loopback/repository#Where<${modelCtor.name}>`;
  }
  return schema;
}
