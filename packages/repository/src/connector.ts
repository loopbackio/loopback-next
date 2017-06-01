// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {AnyType} from './common';
import {Model} from './model';

/**
 * Common properties/operations for connectors
 */
export interface Connector {
  name: string; // Name/type of the connector
  configModel?: Model; // The configuration model
  interfaces?: string[]; // A list of interfaces implemented by the connector
  connect(): Promise<AnyType>; // Connect to the underlying system
  disconnect(): Promise<AnyType>; // Disconnect from the underlying system
  ping(): Promise<AnyType>; // Ping the underlying system
}
