// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {AnyObject, Options} from './common-types';
import {Connector} from './connectors';

/**
 * DataSource denotes a configured connector
 */
export interface DataSource {
  name: string; // Name of the data source
  connector?: Connector; // The underlying connector instance

  settings: AnyObject; // Settings
  // tslint:disable-next-line:no-any
  [property: string]: any; // Other properties that vary by connectors
}

export interface SchemaMigrationOptions extends Options {
  /**
   * When set to 'drop', schema migration will drop existing tables and recreate
   * them from scratch, removing any existing data along the way.
   *
   * When set to 'alter', schema migration will try to preserve current schema
   * and data, and perform a non-destructive incremental update.
   */
  existingSchema?: 'drop' | 'alter';

  /**
   * List of model names to migrate.
   *
   * By default, all models are migrated.
   */
  models?: string[];
}
