// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Model} from './model';
import {AnyObject, Options} from '../index';

/**
 * Common properties/operations for connectors
 */
export interface Connector {
  name: string; // Name/type of the connector
  configModel?: Model; // The configuration model
  interfaces?: string[]; // A list of interfaces implemented by the connector
  connect(): Promise<void>; // Connect to the underlying system
  disconnect(): Promise<void>; // Disconnect from the underlying system
  ping(): Promise<void>; // Ping the underlying system
  execute?(
    query: string | AnyObject,
    // tslint:disable:no-any
    parameters: AnyObject | any[],
    options?: Options,
  ): Promise<AnyObject>;
}
