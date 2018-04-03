// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/example-log-extension
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * Binding keys used by this component.
 */
export namespace EXAMPLE_LOG_BINDINGS {
  export const METADATA = 'example.log.metadata';
  export const APP_LOG_LEVEL = 'example.log.level';
  export const TIMER = 'example.log.timer';
  export const LOGGER = 'example.log.logger';
  export const LOG_ACTION = 'example.log.action';
}

/**
 * Enum to define the supported log levels
 */
export enum LOG_LEVEL {
  DEBUG,
  INFO,
  WARN,
  ERROR,
  OFF,
}
