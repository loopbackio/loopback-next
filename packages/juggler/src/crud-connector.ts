// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: juggler
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import { Connector } from './connector';
import { Entity } from './model';
import { Filter, Where } from './query';
import { Class, ObjectType, Options, AnyType } from './common';

export type EntityData = ObjectType<Entity>;

/**
 * CRUD operations for connector implementations
 */
export interface CrudConnector extends Connector {
  /**
   * Create a new entity
   */
  create(modelClass: Class<Entity>, entity: EntityData, options?: Options):
    Promise<EntityData>;

  createAll?(modelClass: Class<Entity>, entities: EntityData[], options?: Options):
    Promise<EntityData[]>;

  save?(modelClass: Class<Entity>, entity: EntityData, options?: Options):
    Promise<EntityData>;

  /**
   * Find matching entities by the filter
   */
  find(modelClass: Class<Entity>, filter?: Filter, options?: Options):
    Promise<EntityData[]>;

  findById?(modelClass: Class<Entity>, id: AnyType, options?: Options):
    Promise<EntityData>;

  update?(modelClass: Class<Entity>, entity: EntityData, options?: Options):
    Promise<boolean>;

  delete?(modelClass: Class<Entity>, entity: EntityData, options?: Options):
    Promise<boolean>;

  /**
   * Update matching entities
   */
  updateAll(modelClass: Class<Entity>, data: EntityData,
    where?: Where, options?: Options):
    Promise<number>;

  updateById?(modelClass: Class<Entity>, id: AnyType, data: EntityData,
    options?: Options): Promise<boolean>;

  replaceById?(modelClass: Class<Entity>, id: AnyType, data: EntityData,
    options?: Options): Promise<boolean>;

  /**
   * Delete matching entities
   */
  deleteAll(modelClass: Class<Entity>, where?: Where, options?: Options):
    Promise<number>;

  deleteById?(modelClass: Class<Entity>, id: AnyType, options?: Options):
    Promise<boolean>;

  /**
   * Count matching entities
   */
  count(modelClass: Class<Entity>, where?: Where, options?: Options):
    Promise<number>;

  exists?(modelClass: Class<Entity>, id: AnyType, options?: Options):
    Promise<boolean>;
}
