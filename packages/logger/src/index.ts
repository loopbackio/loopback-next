// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: @loopback/logger
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Component} from '../../core';
import {LoggerProvider} from './providers/LoggerProvider';

export class LoggerComponent implements Component {
  providers = {
    loggerProvider: LoggerProvider,
  }
}
