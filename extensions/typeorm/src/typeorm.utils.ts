// Copyright IBM Corp. and LoopBack contributors 2020. All Rights Reserved.
// Node module: @loopback/typeorm
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {JsonSchemaOptions, ReferenceObject, SchemaObject} from '@loopback/rest';
import {getMetadataArgsStorage} from 'typeorm';
import {ColumnType} from 'typeorm/driver/types/ColumnTypes';
import {ColumnMetadataArgs} from 'typeorm/metadata-args/ColumnMetadataArgs';
import debugFactory from 'debug';

const debug = debugFactory('loopback:typeorm:mixin');

const modelSchemaCache = new WeakMap();

/**
 * Describe the provided Entity as a reference to a definition shared by multiple
 * endpoints. The definition is included in the returned schema.
 *
 * @param modelCtor - The entity constructor (e.g. `Product`)
 * @param options - Additional options
 */
export function getModelSchema<T extends object>(
  modelCtor: Function & {prototype: T},
  options?: JsonSchemaOptions<T>,
): SchemaObject {
  const cached = modelSchemaCache.get(modelCtor);
  if (cached) {
    return cached;
  }
  const allColumns: ColumnMetadataArgs[] = getMetadataArgsStorage().columns;
  const modelColumns = allColumns.filter(col => col.target === modelCtor);

  const properties: PropertyType = {};
  for (const col of modelColumns) {
    // Skip @PrimaryGeneratedColumn
    if (!col.options.primary) {
      properties[col.propertyName] = {
        type: getStringifiedType({
          func: col.options.type as ColumnType,
          entity: modelCtor.name,
          property: col.propertyName,
        }),
      };
    }
  }

  const schema: SchemaObject = {
    title: modelCtor.name,
    properties,
  };

  modelSchemaCache.set(modelCtor, schema);
  return schema;
}

type PropertyType = {
  [propertyName: string]: SchemaObject | ReferenceObject;
};

export type StringifiedTypeOptions = {
  func: ColumnType;
  entity: string;
  property: string;
};

// TODO: identify other data types
function getStringifiedType(
  options: StringifiedTypeOptions,
): SchemaObject['type'] {
  const {func, entity, property} = options;
  if (func === Number) {
    return 'number';
  } else if (func === String) {
    return 'string';
  } else if (func === Boolean) {
    return 'boolean';
  } else {
    debug(
      `${entity}.${property}: Type conversion of ${func} to OpenAPI format not implemented.`,
    );
    return undefined;
  }
}
