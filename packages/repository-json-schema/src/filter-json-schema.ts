// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/repository-json-schema
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {getModelRelations, Model, model} from '@loopback/repository';
import {JSONSchema6 as JsonSchema} from 'json-schema';

@model({settings: {strict: false}})
class EmptyModel extends Model {}

const scopeFilter = getFilterJsonSchemaFor(EmptyModel);

/**
 * Build a JSON schema describing the format of the "filter" object
 * used to query model instances.
 *
 * Note we don't take the model properties into account yet and return
 * a generic json schema allowing any "where" condition.
 *
 * @param modelCtor - The model constructor to build the filter schema for.
 */
export function getFilterJsonSchemaFor(modelCtor: typeof Model): JsonSchema {
  const schema: JsonSchema = {
    properties: {
      where: getWhereJsonSchemaFor(modelCtor),

      fields: getFieldsJsonSchemaFor(modelCtor),

      offset: {
        type: 'integer',
        minimum: 0,
      },

      limit: {
        type: 'integer',
        minimum: 1,
        examples: [100],
      },

      skip: {
        type: 'integer',
        minimum: 0,
      },

      order: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
    },
    additionalProperties: false,
  };

  const modelRelations = getModelRelations(modelCtor);
  const hasRelations = Object.keys(modelRelations).length > 0;

  if (hasRelations) {
    schema.properties!.include = {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          // TODO(bajtos) restrict values to relations defined by "model"
          relation: {type: 'string'},
          // TODO(bajtos) describe the filter for the relation target model
          scope: scopeFilter,
        },
      },
    };
  }

  return schema;
}

/**
 * Build a JSON schema describing the format of the "where" object
 * used to filter model instances to query, update or delete.
 *
 * Note we don't take the model properties into account yet and return
 * a generic json schema allowing any "where" condition.
 *
 * @param modelCtor - The model constructor to build the filter schema for.
 */
export function getWhereJsonSchemaFor(modelCtor: typeof Model): JsonSchema {
  const schema: JsonSchema = {
    type: 'object',
    // TODO(bajtos) enumerate "model" properties and operators like "and"
    // See https://github.com/strongloop/loopback-next/issues/1748
    additionalProperties: true,
  };
  return schema;
}

/**
 * Build a JSON schema describing the format of the "fields" object
 * used to include or exclude properties of model instances.
 *
 * @param modelCtor - The model constructor to build the filter schema for.
 */

export function getFieldsJsonSchemaFor(modelCtor: typeof Model): JsonSchema {
  const schema: JsonSchema = {
    type: 'object',
    properties: Object.assign(
      {},
      ...Object.keys(modelCtor.definition.properties).map(k => ({
        [k]: {type: 'boolean'},
      })),
    ),
    additionalProperties: modelCtor.definition.settings.strict === false,
  };
  return schema;
}
