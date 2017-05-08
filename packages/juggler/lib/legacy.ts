export const jugglerModule = require('loopback-datasource-juggler');

import {MixinBuilder} from './mixin';
import {Constructor, Class, Options, Callback, AnyObject} from './common';

export declare namespace juggler {
  /**
   * Return type for promisified Node.js async methods
   */
  export type PromiseOrVoid<T> = Promise<T> | void;

  /**
   * DataSource instance properties/operations
   */
  export interface DataSource {
    name: string;
    settings: AnyObject;
    createModel(name: string, properties?: Object, options?: Options): ModelClass<Model>;
  }

  export type DataSourceClass = Class<DataSource>;

  /**
   * Model instance properties/operations
   */
  export interface Model {
  }

  /**
   * Union type for model instance or plain object representing the model instance
   */
  export type ModelData = Model|AnyObject;

  /**
   * Model definition
   */
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

  /**
   * PerisistedModel static properties/operations
   */
  export interface PersistedModelClass<T extends PersistedModel> extends ModelClass<T> {
  }

  /**
   * PeristedModel instance properties/operations
   */
  export interface PersistedModel {
    /**
     * Save a model instance
     * @param options
     * @param callback
     */
    save(options?:Options, callback?:Callback<ModelData>):PromiseOrVoid<boolean>;

    /**
     * Delete a model instance
     * @param options
     * @param callback
     */
     remove(options?:Options, callback?:Callback<boolean>):PromiseOrVoid<boolean>;
     delete(options?:Options, callback?:Callback<boolean>):PromiseOrVoid<boolean>;
     destroy(options?:Options, callback?:Callback<boolean>):PromiseOrVoid<boolean>;

    /**
     * Update a model instance with given attributes
     * @param data Attributes to be updated
     * @param options
     * @param callback
     */
     updateAttributes(data:ModelData, options?:Options,
       callback?:Callback<ModelData>):PromiseOrVoid<boolean>;
     patchAttributes(data:ModelData, options?:Options,
       callback?:Callback<ModelData>):PromiseOrVoid<boolean>;

    /**
     * Replace the model instance with attributes from the data object
     * @param {T|Object} data Data object keyed by property names
     * @param options
     * @param callback
     */
    replaceAttributes(data:ModelData, options?:Options,
      callback?:Callback<ModelData>):PromiseOrVoid<boolean>;
  }
}

export const DataSource = jugglerModule.DataSource as juggler.DataSourceClass;
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
