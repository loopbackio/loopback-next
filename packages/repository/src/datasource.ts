// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {AnyObject} from './common-types';
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
