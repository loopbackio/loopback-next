// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import { Class, AnyType } from '../common-types';
import { Model } from '../model';
import { Repository } from '../repository';
import { DataSource } from '../datasource';
import { inject } from '@loopback/context';

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
  constructor(modelOrRepo: string | Class<Model>, dataSource?: string | DataSource) {
    this.name = typeof modelOrRepo === 'string' && dataSource === undefined ?
      modelOrRepo : undefined;
    this.modelName = typeof modelOrRepo === 'string' && dataSource != null ?
      modelOrRepo : undefined;
    this.modelClass = typeof modelOrRepo === 'function' ?
      modelOrRepo : undefined;
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
 * @returns {(target:AnyType)}
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
  const meta = new RepositoryMetadata(model, dataSource);
  return function(target: Object, key?: symbol | string,
    descriptor?: TypedPropertyDescriptor<Repository<AnyType>> | number) {
    if ((typeof descriptor === 'number') && meta.name) {
      // Make it shortcut to `@inject('repositories:MyRepo')`
      // Please note key is undefined for constructor. If strictNullChecks
      // is true, the compiler will complain as reflect-metadata won't
      // accept undefined or null for key. Use ! to fool the compiler.
      inject('repositories:' + meta.name)(target, key!, descriptor);
      return;
    }
    // Apply model definition to the model class
  };
}
