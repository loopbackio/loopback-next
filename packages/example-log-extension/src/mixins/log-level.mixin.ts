// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/example-log-extension
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Constructor} from '@loopback/context';
import {EXAMPLE_LOG_BINDINGS} from '../keys';

/**
 * A mixin class for Application that can bind logLevel from `options`.
 * Also provides .logLevel() to bind application wide logLevel.
 * Functions with a log level set to logLevel or higher sill log data
 *
 * ```ts
 * class MyApplication extends LogLevelMixin(Application) {}
 * ```
 */
// tslint:disable-next-line:no-any
export function LogLevelMixin<T extends Constructor<any>>(superClass: T) {
  return class extends superClass {
    // A mixin class has to take in a type any[] argument!
    // tslint:disable-next-line:no-any
    constructor(...args: any[]) {
      super(...args);
      if (!this.options) this.options = {};

      if (this.options.logLevel) {
        this.logLevel(this.options.logLevel);
      }
    }

    /**
     * Set minimum logLevel to be displayed.
     *
     * @param level The log level to set for @log decorator
     *
     * ```ts
     * app.logLevel(LogLevel.INFO);
     * ```
     */
    logLevel(level: number) {
      this.bind(EXAMPLE_LOG_BINDINGS.APP_LOG_LEVEL).to(level);
    }
  };
}
