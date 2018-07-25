// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/service-proxy
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as legacy from 'loopback-datasource-juggler';

export namespace juggler {
  export import DataSource = legacy.DataSource;
}

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
export async function getService<T = GenericService>(
  ds: legacy.DataSource,
): Promise<T> {
  await ds.connect();
  // tslint:disable-next-line:no-any
  return ds.DataAccessObject as any;
}
