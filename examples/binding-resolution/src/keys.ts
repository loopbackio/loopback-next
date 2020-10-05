// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-binding-resolution
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingKey} from '@loopback/core';
import {Counter} from './services';
import {Logger} from './util';

export const LOGGER_SERVICE = BindingKey.create<Logger>('services.Logger');

export const APPLICATION_COUNTER = BindingKey.create<Counter>(
  'application.counter',
);

export const SERVER_COUNTER = BindingKey.create<Counter>('server.counter');

export const REQUEST_COUNTER = BindingKey.create<Counter>('request.counter');
