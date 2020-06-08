// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/example-log-extension
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application, MixinTarget} from '@loopback/core';
import {LogComponent} from '../component';
import {EXAMPLE_LOG_BINDINGS, LOG_LEVEL} from '../keys';

/**
 * A mixin class for Application that can bind logLevel from `options`.
 * Also provides .logLevel() to bind application wide logLevel.
 * Functions with a log level set to logLevel or higher sill log data
 *
 * @example
 * ```ts
 * class MyApplication extends LogMixin(Application) {}
 * ```
 */
export function LogMixin<T extends MixinTarget<Application>>(superClass: T) {
  return class extends superClass {
    // A mixin class has to take in a type any[] argument!
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(...args);
      if (this.options?.logLevel) {
        this.logLevel(this.options.logLevel);
      }
      this.component(LogComponent);
    }

    /**
     * Set minimum logLevel to be displayed.
     *
     * @param level - The log level to set for @log decorator
     *
     * @example
     * ```ts
     * app.logLevel(LOG_LEVEL.INFO);
     * ```
     */
    logLevel(level: LOG_LEVEL) {
      this.bind(EXAMPLE_LOG_BINDINGS.APP_LOG_LEVEL).to(level);
    }
  };
}
