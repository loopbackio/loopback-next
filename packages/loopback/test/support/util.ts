// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application, AppConfig} from 'loopback';
import {Client} from './client';
import {Context} from '../../lib/context';

export function createApp(config?: AppConfig) : Application {
  return new Application(config);
}

export function createClient(app : Application) {
  return new Client(app);
}

export function getContext() : Context {
  return new Context();
}
