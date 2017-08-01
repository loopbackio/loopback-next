// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: @loopback/logger
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Logger} from './keys';
import {Component} from '../../core';
import {PinoLoggerProvider, SetupPinoHttpLogger} from './providers/LoggerProvider';

const setupLoggerKey = Logger.SequenceActions.SETUP_LOGGER;
const loggerProviderKey = Logger.System.LOGGER_PROVIDER;

export {Logger} from './keys';
export {SimpleLogger} from './providers/LoggerProvider';

export class PinoLoggerComponent implements Component {
  providers = {
    // PinoLoggerProvider is bound to the key [loggerProviderKey]
    // in the client's application context.
    [loggerProviderKey]: PinoLoggerProvider,
    // SetupPinoHttpLogger is bound to the key [setupLoggerKey]
    // in the client's application context.
    [setupLoggerKey]: SetupPinoHttpLogger,
  }
}
