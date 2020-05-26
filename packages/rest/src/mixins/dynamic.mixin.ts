// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application, MixinTarget} from '@loopback/core';
import {juggler} from '@loopback/repository/src';
import debugFactory from 'debug';

const debug = debugFactory('loopback:rest:mixin');

/**
 * Interface for classes with `new` operator.
 */
export interface Class<T> {
  // new MyClass(...args) ==> T
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new(...args: any[]): T;
}

/* eslint-enable @typescript-eslint/no-unused-vars */

/**
 * A mixin class for Application that creates a .dynamic()
 * function to build models, repositories and controllers dynamically at runtime.
 *
 * @example
 * ```ts
 * class MyApplication extends DynamicMixin(Application) {}
 *
 * const app = new MyApplication();
 * await app.start();
 * app.dynamic(
 *   {
 *     name: 'dynamo',
 *     connector: 'loopback-connector-mongodb',
 *     connectionString: 'mongodb://sysop:moon@localhost/records',
 *     restApi: false,
 *   }
 * );
 * ```
 *
 */
export function DynamicMixin<T extends MixinTarget<Application>>(
  superClass: T,
) {
  return class extends superClass {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async dynamic(options: DynamicOptions) {
      const {name, connector, connectionString} = options;
      if (!connectionString && connector !== 'memory') {
        throw new Error(`Connection string is required for ${connector}`);
      }
      // Enable REST API by default
      const restApi = ('restApi' in options) ? options.restApi : true;

      const ds = new juggler.DataSource({
        name: name,
        connector: require(connector),
        url: connectionString,
      });
      await ds.connect();
      this.dataSource(ds, name);
    }
  };
}

export type DynamicOptions = {
  name: string;
  connector: string;
  connectionString?: string;
  restApi: boolean;
}
