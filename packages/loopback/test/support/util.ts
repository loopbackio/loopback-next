// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application, Server, ServerConfig} from 'loopback';
import {Client} from './client';
import {Context} from '../../lib/context';

export function createApp(config?: ServerConfig) : Server {
  return new Server(config);
}

export function createClient(server : Server) {
  return new Client(server);
}

export function createServer(config?: ServerConfig) : Server {
  return new Server(config);
}

export function getContext() : Context {
  return new Context();
}
