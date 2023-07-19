// Copyright IBM Corp. and LoopBack contributors 2018,2019. All Rights Reserved.
// Node module: @loopback/service-proxy
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import legacy from 'loopback-datasource-juggler';

export namespace juggler {
  export import DataSource = legacy.DataSource;
}

/**
 * A generic service interface with any number of methods that return a promise
 */
export interface GenericService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [methodName: string]: (...args: any[]) => Promise<any>;
}

/**
 * Get a service proxy from a LoopBack 3.x data source backed by
 * service-oriented connectors such as `rest`, `soap`, and `grpc`.
 *
 * @param ds - A legacy data source
 * @typeParam T - The generic type of service interface
 */
export async function getService<T = GenericService>(
  ds: legacy.DataSource,
): Promise<T> {
  await ds.connect();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ds.DataAccessObject as any;
}
