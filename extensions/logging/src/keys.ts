// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/extension-logging
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingKey, GenericInterceptor} from '@loopback/core';
import {FluentSender} from 'fluent-logger';
import * as WinstonTransport from 'winston-transport';
import {LoggingComponent} from './logging.component';
import {WinstonLogger} from './winston';

/**
 * Binding keys used by this component.
 */
export namespace LoggingBindings {
  export const COMPONENT = BindingKey.create<LoggingComponent>(
    'components.LoggingComponent',
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const FLUENT_SENDER = BindingKey.create<FluentSender<any>>(
    'logging.fluent.sender',
  );

  /**
   * Binding key for winston logger
   */
  export const WINSTON_LOGGER = BindingKey.create<WinstonLogger>(
    'logging.winston.logger',
  );

  /**
   * Binding key for winston transport backed by fluent
   */
  export const WINSTON_TRANSPORT_FLUENT = BindingKey.create<WinstonTransport>(
    'logging.winston.transports.fluent',
  );

  /**
   * Binding key for method invocation logger with winston
   */
  export const WINSTON_INVOCATION_LOGGER = BindingKey.create<
    GenericInterceptor
  >('logging.winston.invocationLogger');

  /**
   * Binding key for http access logger with winston
   */
  export const WINSTON_HTTP_ACCESS_LOGGER = BindingKey.create<
    GenericInterceptor
  >('logging.winston.httpAccessLogger');
}
