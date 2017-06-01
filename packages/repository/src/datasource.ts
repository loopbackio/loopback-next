// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {AnyType} from './common';
import {Connector} from './connector';

/**
 * DataSource denotes a configured connector
 */
export interface DataSource {
  name: string; // Name of the data source
  connector: Connector; // The underlying connector
  [property: string]: AnyType; // Other properties that vary by connectors
}
