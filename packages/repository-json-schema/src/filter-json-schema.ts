// Copyright IBM Corp. and LoopBack contributors 2018,2020. All Rights Reserved.
// Node module: @loopback/repository-json-schema
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {getModelRelations, Model, model} from '@loopback/repository';
import {JSONSchema7 as JsonSchema, JSONSchema7Definition} from 'json-schema';

export interface FilterSchemaOptions {
  /**
   * Set this flag if you want the schema to set generated title property.
   *
   * By default the setting is enabled. (e.g. {setTitle: true})
   *
   */
  setTitle?: boolean;

  /**
   * To exclude one or more property from `filter`
   */
  exclude?: string[] | string;
}

export const AnyScopeFilterSchema: JsonSchema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {},
    additionalProperties: true,
  },
};

/**
 * Build a JSON schema describing the format of the "scope" object
 * used to query model instances.
 *
 * Note we don't take the model properties into account yet and return
 * a generic json schema allowing any "where" condition.
 *
 * @param modelCtor - The model constructor to build the filter schema for.
 */
export function getScopeFilterJsonSchemaFor(
  modelCtor: typeof Model,
  options: FilterSchemaOptions = {},
): JsonSchema {
  @model({settings: {strict: false}})
  class EmptyModel extends Model {}

  const schema: JsonSchema = {
    type: 'object',
    ...getFilterJsonSchemaFor(EmptyModel, {
      setTitle: false,
    }),
    ...(options.setTitle !== false && {
      title: `${modelCtor.modelName}.ScopeFilter`,
    }),
  };

  // To include nested models, we need to hard-code the inclusion
  // filter schema for EmptyModel to allow any object query.
  schema.properties!.include = {...AnyScopeFilterSchema};
  return schema;
}

/**
 * Build a JSON schema describing the format of the "filter" object
 * used to query model instances.
 *
 * Note we don't take the model properties into account yet and return
 * a generic json schema allowing any "where" condition.
 *
 * @param modelCtor - The model constructor to build the filter schema for.
 * @param options - Options to build the filter schema.
 */
export function getFilterJsonSchemaFor(
  modelCtor: typeof Model,
  options: FilterSchemaOptions = {},
): JsonSchema {
  let excluded: string[];
  if (typeof options.exclude === 'string') {
    excluded = [options.exclude];
  } else {
    excluded = options.exclude ?? [];
  }
  const properties: Record<string, JSONSchema7Definition> = {
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
      oneOf: [
        {
          type: 'string',
        },
        {
          type: 'array',
          items: {
            type: 'string',
          },
        },
      ],
    },
  };

  if (!excluded.includes('where')) {
    properties.where = getWhereJsonSchemaFor(modelCtor, options);
  }
  if (!excluded.includes('fields')) {
    properties.fields = getFieldsJsonSchemaFor(modelCtor, options);
  }

  // Remove excluded properties
  for (const p of excluded) {
    delete properties[p];
  }

  const schema: JsonSchema = {
    type: 'object',
    ...(options.setTitle !== false && {
      title: `${modelCtor.modelName}.Filter`,
    }),
    properties,
    additionalProperties: false,
  };

  const modelRelations = getModelRelations(modelCtor);
  const hasRelations = Object.keys(modelRelations).length > 0;

  if (hasRelations && !excluded.includes('include')) {
    schema.properties!.include = {
      ...(options.setTitle !== false && {
        title: `${modelCtor.modelName}.IncludeFilter`,
      }),
      type: 'array',
      items: {
        anyOf: [
          {
            ...(options.setTitle !== false && {
              title: `${modelCtor.modelName}.IncludeFilter.Items`,
            }),
            type: 'object',
            properties: {
              // TODO(bajtos) restrict values to relations defined by "model"
              relation: {type: 'string', enum: Object.keys(modelRelations)},
              // TODO(bajtos) describe the filter for the relation target model
              scope: getScopeFilterJsonSchemaFor(modelCtor, options),
            },
          },
          {
            type: 'string',
          },
        ],
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
export function getWhereJsonSchemaFor(
  modelCtor: typeof Model,
  options: FilterSchemaOptions = {},
): JsonSchema {
  const schema: JsonSchema = {
    ...(options.setTitle !== false && {
      title: `${modelCtor.modelName}.WhereFilter`,
    }),
    type: 'object',
    // TODO(bajtos) enumerate "model" properties and operators like "and"
    // See https://github.com/loopbackio/loopback-next/issues/1748
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

export function getFieldsJsonSchemaFor(
  modelCtor: typeof Model,
  options: FilterSchemaOptions = {},
): JsonSchema {
  const schema: JsonSchema = {oneOf: []};
  if (options.setTitle !== false) {
    schema.title = `${modelCtor.modelName}.Fields`;
  }

  const properties = Object.keys(modelCtor.definition.properties);
  const additionalProperties = modelCtor.definition.settings.strict === false;

  schema.oneOf?.push({
    type: 'object',
    properties: properties.reduce(
      (prev, crr) => ({...prev, [crr]: {type: 'boolean'}}),
      {},
    ),
    additionalProperties,
  });

  schema.oneOf?.push({
    type: 'array',
    items: {
      type: 'string',
      enum: properties.length && !additionalProperties ? properties : undefined,
      examples: properties,
    },
    uniqueItems: true,
  });

  return schema;
}
