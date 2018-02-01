// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/example-log-extension
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {EXAMPLE_LOG_BINDINGS} from './keys';
import {Component, ProviderMap} from '@loopback/core';
import {TimerProvider, LogActionProvider} from './';

export class LogComponent implements Component {
  providers?: ProviderMap = {
    [EXAMPLE_LOG_BINDINGS.TIMER]: TimerProvider,
    [EXAMPLE_LOG_BINDINGS.LOG_ACTION]: LogActionProvider,
  };
}
