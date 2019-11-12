// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/extension-logging
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingKey} from '@loopback/core';
import {FluentSender} from 'fluent-logger';
import {Logger} from 'winston';
import * as Transport from 'winston-transport';
import {LoggingComponent} from './logging.component';

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

  export const WINSTON_LOGGER = BindingKey.create<Logger>(
    'logging.winston.logger',
  );

  export const WINSTON_TRANSPORT_FLUENT = BindingKey.create<Transport>(
    'logging.winston.transports.fluent',
  );
}
