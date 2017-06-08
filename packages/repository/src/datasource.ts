// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Connector} from './connector';

/**
 * DataSource denotes a configured connector
 */
export interface DataSource {
  name: string; // Name of the data source
  connector: Connector; // The underlying connector

  // tslint:disable-next-line:no-any
  [property: string]: any; // Other properties that vary by connectors
}
