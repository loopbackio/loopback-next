// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/service-proxy
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const jugglerModule = require('loopback-datasource-juggler');

import {juggler} from './loopback-datasource-juggler';

export const DataSourceConstructor = jugglerModule.DataSource as typeof juggler.DataSource;

/**
 * A generic service interface with any number of methods that return a promise
 */
export interface GenericService {
  // tslint:disable-next-line:no-any
  [methodName: string]: (...args: any[]) => Promise<any>;
}

/**
 * Get a service proxy from a LoopBack 3.x data source backed by
 * service-oriented connectors such as `rest`, `soap`, and `grpc`.
 *
 * @param ds A legacy data source
 * @typeparam T The generic type of service interface
 */
export function getService<T = GenericService>(ds: juggler.DataSource): T {
  return ds.DataAccessObject as T;
}
