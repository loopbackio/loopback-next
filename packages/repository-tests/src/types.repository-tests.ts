// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository-tests
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Entity,
  EntityCrudRepository,
  juggler,
  Options,
} from '@loopback/repository';

/**
 * DataSource configuration (connector name, connection string, etc.).
 */
export type DataSourceOptions = Options;

/**
 * List of flags describing connector-specific behavior. These flags
 * are used by the test suite to tweak assertions and skip tests
 * for scenarios not supported by some connectors.
 */
export interface CrudConnectorFeatures {
  /**
   * What type is used for auto-generated primary keys?
   * - SQL databases typically use auto-incremented numbers,
   * - NoSQL databases tend to use GUID/UUID strings.
   *
   * Default: `'string'`.
   */
  idType: 'string' | 'number';

  /**
   * Does the database (or the connector) require a fixed schema,
   * or can it support additional (free-form) properties?
   * SQL databases typically don't support free-form properties.
   *
   * Default: `true`
   */
  freeFormProperties: boolean;
}

/**
 * A constructor of a class implementing CrudRepository interface,
 * accepting the Entity class (constructor) and a dataSource instance.
 */
export type CrudRepositoryCtor = new <
  T extends Entity,
  ID,
  Relations extends object
>(
  entityClass: typeof Entity & {prototype: T},
  dataSource: juggler.DataSource,
) => EntityCrudRepository<T, ID, Relations>;

/**
 * Additional properties added to Mocha TestContext/SuiteContext.
 * @internal
 */
export interface CrudTestContext {
  dataSourceOptions: DataSourceOptions;
  repositoryClass: CrudRepositoryCtor;
  connectorFeatures: CrudConnectorFeatures;
  dataSource: juggler.DataSource;
}
