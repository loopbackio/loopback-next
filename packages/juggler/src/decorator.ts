import {Class} from './common';
import {Model} from './model';
import {Repository} from './repository';
import {DataSource} from './datasource';
import {inject} from '@loopback/context';

/**
 * Metadata for a repository
 */
export class RepositoryMetadata {
  /**
   * Name of the predefined repository
   */
  name?: string;
  /**
   * Name of the model
   */
  modelName?: string;
  /**
   * Class of the model
   */
  modelClass?: Class<Model>;
  /**
   * Name of the data source
   */
  dataSourceName?: string;
  /**
   * Instance of the data source
   */
  dataSource?: DataSource;

  /**
   * Constructor for RepositoryMetadata
   *
   * @param model Name or class of the model. If the value is a string and
   * `dataSource` is not present, it will treated as the name of a predefined repository
   * @param dataSource Name or instance of the data source
   *
   * For example:
   *
   * - new RepositoryMetadata(repoName);
   * - new RepositoryMetadata(modelName, dataSourceName);
   * - new RepositoryMetadata(modelClass, dataSourceInstance);
   * - new RepositoryMetadata(modelName, dataSourceInstance);
   * - new RepositoryMetadata(modelClass, dataSourceName);
   */
  constructor(model: string | Class<Model>, dataSource?: string | DataSource) {
    this.name = typeof model === 'string' && dataSource === undefined ?
      model : undefined;
    this.modelName = typeof model === 'string' ?
      model : undefined;
    this.modelClass = typeof model === 'function' ?
      model : undefined;
    this.dataSourceName = typeof dataSource === 'string' ?
      dataSource : undefined;
    this.dataSource = typeof dataSource === 'object' ?
      dataSource : undefined;
  }
}

/**
 * Decorator for model definitions
 * @param model Name of the repo or name/class of the model
 * @param dataSource Name or instance of the data source
 * @returns {(target:any)}
 *
 * For example:
 *
 * - @repository('myCustomerRepo')
 * - @repository('Customer', 'mysqlDataSource')
 * - @repository(Customer, mysqlDataSource)
 * - @repository('Customer', mysqlDataSource)
 * - @repository(Customer, 'mysqlDataSource')
 */
export function repository(model: string | Class<Model>,
  dataSource?: string | DataSource) {
  let meta = new RepositoryMetadata(model, dataSource);
  return function (target: Object, key?: symbol | string,
    descriptor?: TypedPropertyDescriptor<Repository<any>> | number) {
    // Apply model definition to the model class
  }
}

/**
 * Decorator for model definitions
 * @param definition
 * @returns {(target:any)}
 */
export function model(definition?: Object) {
  return function(target: any) {
    // Apply model definition to the model class
  }
}

/**
 * Decorator for model properties
 * @param definition
 * @returns {(target:any, key:string)}
 */
export function property(definition?: Object) {
  return function(target: any, key:string) {
    // Apply model definition to the model class
  }
}

/**
 * Decorator for relations
 * @param definition
 * @returns {(target:any, key:string)}
 */
export function relation(definition?: Object) {
  return function(target: any, key:string) {
    // Apply model definition to the model class
  }
}

/**
 * Decorator for belongsTo
 * @param definition
 * @returns {(target:any, key:string)}
 */
export function belongsTo(definition?: Object) {
  return function(target: any, key:string) {
    // Apply model definition to the model class
  }
}

/**
 * Decorator for hasOne
 * @param definition
 * @returns {(target:any, key:string)}
 */
export function hasOne(definition?: Object) {
  return function(target: any, key:string) {
    // Apply model definition to the model class
  }
}

/**
 * Decorator for hasMany
 * @param definition
 * @returns {(target:any, key:string)}
 */
export function hasMany(definition?: Object) {
  return function(target: any, key:string) {
    // Apply model definition to the model class
  }
}

/**
 * Decorator for embedsOne
 * @param definition
 * @returns {(target:any, key:string)}
 */
export function embedsOne(definition?: Object) {
  return function(target: any, key:string) {
    // Apply model definition to the model class
  }
}


/**
 * Decorator for embedsMany
 * @param definition
 * @returns {(target:any, key:string)}
 */
export function embedsMany(definition?: Object) {
  return function(target: any, key:string) {
    // Apply model definition to the model class
  }
}


/**
 * Decorator for referencesOne
 * @param definition
 * @returns {(target:any, key:string)}
 */
export function referencesOne(definition?: Object) {
  return function(target: any, key:string) {
    // Apply model definition to the model class
  }
}

/**
 * Decorator for referencesMany
 * @param definition
 * @returns {(target:any, key:string)}
 */
export function referencesMany(definition?: Object) {
  return function(target: any, key:string) {
    // Apply model definition to the model class
  }
}
