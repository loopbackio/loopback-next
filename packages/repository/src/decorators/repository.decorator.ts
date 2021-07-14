// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context, inject, Injection} from '@loopback/core';
import assert from 'assert';
import {Class} from '../common-types';
import {DataSource} from '../datasource';
import {Entity, Model} from '../model';
import {DefaultCrudRepository, Repository} from '../repositories';
import {juggler} from '../repositories/legacy-juggler-bridge';

/**
 * Type definition for decorators returned by `@repository` decorator factory
 */
export type RepositoryDecorator = (
  target: Object,
  key?: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  descriptorOrIndex?: TypedPropertyDescriptor<any> | number,
) => void;

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
   * @param modelOrRepo - Name or class of the model. If the value is a string and
   * `dataSource` is not present, it will treated as the name of a predefined
   * repository
   * @param dataSource - Name or instance of the data source
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
 * Decorator for repository injections on properties or method arguments
 *
 * @example
 * ```ts
 * class CustomerController {
 *   @repository(CustomerRepository) public custRepo: CustomerRepository;
 *
 *   constructor(
 *     @repository(ProductRepository) public prodRepo: ProductRepository,
 *   ) {}
 *   // ...
 * }
 * ```
 *
 * @param repositoryName - Name of the repo
 */
export function repository(
  repositoryName: string | Class<Repository<Model>>,
): RepositoryDecorator;

/**
 * Decorator for DefaultCrudRepository generation and injection on properties
 * or method arguments based on the given model and dataSource (or their names)
 *
 * @example
 * ```ts
 * class CustomerController {
 *   @repository('Customer', 'mySqlDataSource')
 *   public custRepo: DefaultCrudRepository<
 *     Customer,
 *     typeof Customer.prototype.id
 *   >;
 *
 *   constructor(
 *     @repository(Product, mySqlDataSource)
 *     public prodRepo: DefaultCrudRepository<
 *       Product,
 *       typeof Product.prototype.id
 *     >,
 *   ) {}
 *   // ...
 * }
 * ```
 *
 * @param model - Name/class of the model
 * @param dataSource - Name/instance of the dataSource
 */
export function repository(
  model: string | typeof Entity,
  dataSource: string | juggler.DataSource,
): RepositoryDecorator;

export function repository(
  modelOrRepo: string | Class<Repository<Model>> | typeof Entity,
  dataSource?: string | juggler.DataSource,
) {
  // if string, repository or not a model ctor,
  // keep it a string / assign to ctor's name (string) for DI
  const stringOrModel =
    typeof modelOrRepo !== 'string' && !modelOrRepo.prototype.getId
      ? modelOrRepo.name
      : (modelOrRepo as typeof Entity);
  const meta = new RepositoryMetadata(stringOrModel, dataSource);
  return function (
    target: Object,
    key?: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    descriptorOrIndex?: TypedPropertyDescriptor<any> | number,
  ) {
    if (key || typeof descriptorOrIndex === 'number') {
      if (meta.name) {
        // Make it shortcut to `@inject('repositories.MyRepo')`
        // Please note key is undefined for constructor. If strictNullChecks
        // is true, the compiler will complain as reflect-metadata won't
        // accept undefined or null for key. Use ! to fool the compiler.
        inject('repositories.' + meta.name, meta)(
          target,
          key!,
          descriptorOrIndex,
        );
      } else {
        // Use repository-factory to create a repository from model + dataSource
        inject('', meta, resolve)(target, key!, descriptorOrIndex);
      }
      return;
    }
    // Mixin repository into the class
    throw new Error('Class level @repository is not implemented');
  };
}

export namespace repository {
  /**
   * Decorator used to inject a Getter for a repository
   * Mainly intended for usage with repository injections on relation repository
   * factory
   * @param nameOrClass - The repository class (ProductRepository) or a string name ('ProductRepository').
   */
  export function getter(nameOrClass: string | Class<Repository<Model>>) {
    const name =
      typeof nameOrClass === 'string' ? nameOrClass : nameOrClass.name;
    return inject.getter(`repositories.${name}`);
  }
}

/**
 * Resolve the @repository injection
 * @param ctx - Context
 * @param injection - Injection metadata
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
    dataSource instanceof juggler.DataSource,
    'DataSource must be provided',
  );
  return new DefaultCrudRepository(
    modelClass,
    dataSource! as juggler.DataSource,
  );
}
