import {Connector} from './connector';
import {Options} from './common';
import {Entity} from './model';
import {Filter, Where} from './query';
import {Constructor} from './common';

export type Data = Entity | {};

export interface CrudConnector extends Connector {
  /**
   * Create a new entity
   */
  create(modelClass: Constructor<Entity>, entity: Data, options?: Options): Promise<Data>;

  createAll?(modelClass: Constructor<Entity>, entities: Data[], options?: Options): Promise<Data[]>;

  save?(modelClass: Constructor<Entity>, entity: Data, options?: Options): Promise<Data>;

  /**
   * Find matching entities by the filter
   */
  find(modelClass: Constructor<Entity>, filter?: Filter, options?: Options): Promise<Data[]>;

  findById?(modelClass: Constructor<Entity>, id: any, options?: Options): Promise<Data[]>;

  update?(modelClass: Constructor<Entity>, entity: Data, options?: Options): Promise<boolean>;

  delete?(modelClass: Constructor<Entity>, entity: Data, options?: Options): Promise<boolean>;

  /**
   * Update matching entities
   */
  updateAll(modelClass: Constructor<Entity>, data: Data, where?: Where, options?: Options): Promise<number>;

  updateById?(modelClass: Constructor<Entity>, id: any, data: {}, options?: Options): Promise<number>;

  replaceById?(modelClass: Constructor<Entity>, id: any, data: {}, options?: Options): Promise<number>

  /**
   * Delete matching entities
   */
  deleteAll(modelClass: Constructor<Entity>, where?: Where, options?: Options): Promise<number>;

  deleteById?(modelClass: Constructor<Entity>, id: any, options?: Options): Promise<number>;

   /**
    * Count matching entities
    */
  count(modelClass: Constructor<Entity>, where?: Where, options?: Options): Promise<number>;
}
