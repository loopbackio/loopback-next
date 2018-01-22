// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/example-log-extension
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {LOG_LEVEL, EXAMPLE_LOG_BINDINGS} from '../keys';
import {Constructor, Reflector} from '@loopback/context';
import {LevelMetadata} from '../types';

/**
 * Mark a controller method as requiring logging (input, output & timing)
 * if it is set at or greater than Application LogLevel.
 * LOG_LEVEL.DEBUG < LOG_LEVEL.INFO < LOG_LEVEL.WARN < LOG_LEVEL.ERROR < LOG_LEVEL.OFF
 *
 * @param level The Log Level at or above it should log
 */
export function log(level?: number) {
  return function(target: Object, methodName: string): void {
    if (level === undefined) level = LOG_LEVEL.WARN;
    Reflector.defineMetadata(
      EXAMPLE_LOG_BINDINGS.METADATA,
      {level},
      target,
      methodName,
    );
  };
}

/**
 * Fetch log level stored by `@log` decorator.
 *
 * @param controllerClass Target controller
 * @param methodName Target method
 */
export function getLogMetadata(
  controllerClass: Constructor<{}>,
  methodName: string,
): LevelMetadata {
  return Reflector.getMetadata(
    EXAMPLE_LOG_BINDINGS.METADATA,
    controllerClass.prototype,
    methodName,
  );
}
