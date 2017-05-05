export const jugglerModule = require('loopback-datasource-juggler');

import {MixinBuilder} from './mixin';
import {Constructor, Class, Options} from './common';

export declare namespace juggler {
  export interface DataSource {
    name: string;
    createModel(name: string, properties?: Object, options?: Options): ModelClass<Model>;
  }

  export interface Model {
  }

  export interface ModelDefinition {
  }

  /**
   * Interface for legacy model classes
   */
  export interface ModelClass<T extends Model> extends Class<T> {
    modelName: string;
    definition: ModelDefinition;
    attachTo(ds: DataSource): void;
  }
}

export const DataSource = jugglerModule.DataSource as Class<juggler.DataSource>;
export const Model = jugglerModule.ModelBaseClass as juggler.ModelClass<juggler.Model>;

/**
 * This is a bridge to the legacy DAO class. The function mixes DAO methods
 * into a model class and attach it to a given data source
 * @param ds {DataSource} Data source
 * @param modelClass {} Model class
 * @returns {} The new model class with DAO (CRUD) operations
 */
export function bindModel(ds: juggler.DataSource,
  modelClass: juggler.ModelClass<any>): juggler.ModelClass<any> {
  let boundModelClass = class extends modelClass {};
  boundModelClass.attachTo(ds);
  return boundModelClass;
};
