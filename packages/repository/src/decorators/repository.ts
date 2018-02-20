// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as assert from 'assert';
import {Model, Entity} from '../model';
import {Repository} from '../repository';
import {DataSource} from '../datasource';
import {
  DefaultCrudRepository,
  DataSourceConstructor,
} from '../legacy-juggler-bridge';
import {juggler} from '../loopback-datasource-juggler';
import {inject, Context, Injection} from '@loopback/context';

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
  modelClass?: typeof Entity;
  /**
   * Name of the data source
   */
  dataSourceName?: string;
  /**
   * Instance of the data source
   */
  dataSource?: juggler.DataSource | DataSource;

  /**
   * Constructor for RepositoryMetadata
   *
   * @param model Name or class of the model. If the value is a string and
   * `dataSource` is not present, it will treated as the name of a predefined
   * repository
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
  constructor(
    modelOrRepo: string | typeof Entity,
    dataSource?: string | juggler.DataSource | DataSource,
  ) {
    this.name =
      typeof modelOrRepo === 'string' && dataSource === undefined
        ? modelOrRepo
        : undefined;
    this.modelName =
      typeof modelOrRepo === 'string' && dataSource != null
        ? modelOrRepo
        : undefined;
    this.modelClass =
      typeof modelOrRepo === 'function' ? modelOrRepo : undefined;
    this.dataSourceName =
      typeof dataSource === 'string' ? dataSource : undefined;
    this.dataSource = typeof dataSource === 'object' ? dataSource : undefined;
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
export function repository<T extends Model>(
  model: string | typeof Entity,
  dataSource?: string | juggler.DataSource,
) {
  const meta = new RepositoryMetadata(model, dataSource);
  return function(
    target: Object,
    key?: symbol | string,
    descriptor?: TypedPropertyDescriptor<Repository<T>> | number,
  ) {
    if (key || typeof descriptor === 'number') {
      if (meta.name) {
        // Make it shortcut to `@inject('repositories.MyRepo')`
        // Please note key is undefined for constructor. If strictNullChecks
        // is true, the compiler will complain as reflect-metadata won't
        // accept undefined or null for key. Use ! to fool the compiler.
        inject('repositories.' + meta.name, meta)(target, key!, descriptor);
      } else {
        // Use repository-factory to create a repository from model + dataSource
        // inject('repository-factory', meta)(target, key!, descriptor);
        inject('', meta, resolve)(target, key!, descriptor);
        // throw new Error('@repository(model, dataSource) is not implemented');
      }
      return;
    }
    // Mixin repository into the class
    throw new Error('Class level @repository is not implemented');
  };
}

/**
 * Resolve the @repository injection
 * @param ctx Context
 * @param injection Injection metadata
 */
async function resolve(ctx: Context, injection: Injection) {
  const meta = injection.metadata as RepositoryMetadata;
  let modelClass = meta.modelClass;
  if (meta.modelName) {
    modelClass = (await ctx.get('models.' + meta.modelName)) as typeof Entity;
  }
  if (!modelClass) {
    throw new Error(
      'Invalid repository config: ' +
        ' neither modelClass nor modelName was specified.',
    );
  }

  let dataSource = meta.dataSource;
  if (meta.dataSourceName) {
    dataSource = await ctx.get<DataSource>(
      'datasources.' + meta.dataSourceName,
    );
  }
  assert(
    dataSource instanceof DataSourceConstructor,
    'DataSource must be provided',
  );
  return new DefaultCrudRepository(
    modelClass,
    dataSource! as juggler.DataSource,
  );
}
