// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/example-log-extension
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Component, ProviderMap} from '@loopback/core';
import {EXAMPLE_LOG_BINDINGS} from './keys';
import {LogActionProvider, TimerProvider} from './providers';

export class LogComponent implements Component {
  providers?: ProviderMap = {
    [EXAMPLE_LOG_BINDINGS.TIMER.key]: TimerProvider,
    [EXAMPLE_LOG_BINDINGS.LOG_ACTION.key]: LogActionProvider,
  };
}
