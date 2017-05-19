import { Connector } from './connector';
import { Options } from './common';
import { Entity } from './model';
import { Filter, Where } from './query';
import { Class, ObjectType } from './common';

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

  findById?(modelClass: Class<Entity>, id: any, options?: Options):
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

  updateById?(modelClass: Class<Entity>, id: any, data: EntityData,
    options?: Options): Promise<boolean>;

  replaceById?(modelClass: Class<Entity>, id: any, data: EntityData,
    options?: Options): Promise<boolean>

  /**
   * Delete matching entities
   */
  deleteAll(modelClass: Class<Entity>, where?: Where, options?: Options):
    Promise<number>;

  deleteById?(modelClass: Class<Entity>, id: any, options?: Options):
    Promise<boolean>;

  /**
   * Count matching entities
   */
  count(modelClass: Class<Entity>, where?: Where, options?: Options):
    Promise<number>;

  exists?(modelClass: Class<Entity>, id: any, options?: Options):
    Promise<boolean>;
}
