// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/openapi-v3
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {SchemaObject} from '@loopback/openapi-v3-types';
import {
  getFilterJsonSchemaFor,
  getWhereJsonSchemaFor,
  Model,
} from '@loopback/repository-json-schema';
import {jsonToSchemaObject} from './json-to-schema';

/**
 * Build an OpenAPI schema describing the format of the "filter" object
 * used to query model instances.
 *
 * Note we don't take the model properties into account yet and return
 * a generic json schema allowing any "where" condition.
 *
 * @param modelCtor The model constructor to build the filter schema for.
 */
export function getFilterSchemaFor(modelCtor: typeof Model): SchemaObject {
  const jsonSchema = getFilterJsonSchemaFor(modelCtor);
  const schema = jsonToSchemaObject(jsonSchema);
  return schema;
}

/**
 * Build a OpenAPI schema describing the format of the "where" object
 * used to filter model instances to query, update or delete.
 *
 * Note we don't take the model properties into account yet and return
 * a generic json schema allowing any "where" condition.
 *
 * @param modelCtor The model constructor to build the filter schema for.
 */
export function getWhereSchemaFor(modelCtor: typeof Model): SchemaObject {
  const jsonSchema = getWhereJsonSchemaFor(modelCtor);
  const schema = jsonToSchemaObject(jsonSchema);
  return schema;
}
