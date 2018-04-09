// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/example-log-extension
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingKey} from '@loopback/context';
import {TimerFn, LogFn, LogWriterFn} from './types';

/**
 * Binding keys used by this component.
 */
export namespace EXAMPLE_LOG_BINDINGS {
  export const APP_LOG_LEVEL = BindingKey.create<LOG_LEVEL>(
    'example.log.level',
  );
  export const TIMER = BindingKey.create<TimerFn>('example.log.timer');
  export const LOGGER = BindingKey.create<LogWriterFn>('example.log.logger');
  export const LOG_ACTION = BindingKey.create<LogFn>('example.log.action');
}

/**
 * The key used to store log-related via @loopback/metadata and reflection.
 */
export const EXAMPLE_LOG_METADATA_KEY = 'example.log.metadata';

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
