// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: @loopback/logger
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Logger} from './keys';
import {Component} from '../../core';
import {LoggerProvider, SetupHttpLogger} from './providers/LoggerProvider';

const setupLoggerKey = Logger.SequenceActions.SETUP_LOGGER;
const loggerKey = Logger.SIMPLE_LOGGER;

export {Logger} from './keys';
export {SimpleLogger} from './providers/LoggerProvider';

export class LoggerComponent implements Component {
  providers = {
    [loggerKey]: LoggerProvider,
    [setupLoggerKey]: SetupHttpLogger,
  }
}
