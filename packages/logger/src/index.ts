// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: @loopback/logger
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingKeys} from './keys';
import {Component} from '../../core';
import {Logger, PinoLoggerProvider, WinstonLoggerProvider} from './providers/LoggerProvider';
const providerKey = BindingKeys.System.LOGGER_PROVIDER;

export {BindingKeys} from './keys';
export {Logger} from './providers/LoggerProvider';

export class PinoLoggerComponent implements Component {
  // PinoLoggerProvider is bound to the key [providerKey]
  // in the client's application context.
  providers = {
    [providerKey]: PinoLoggerProvider,
  }
}

export class WinstonLoggerComponent implements Component {
  providers = {
    [providerKey]: WinstonLoggerProvider,
  }
}
