// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application, Server, ServerConfig} from '../../src';
import {Client} from './client';
import {Context} from '@loopback/context';
import * as bluebird from 'bluebird';
import * as http from 'http';

export function createApp(config?: ServerConfig) : Server {
  return new Server(config);
}

export function createClient(server : Server) {
  return new Client(server);
}

export function createServer(config?: ServerConfig) : Server {
  return new Server(config || {port: 0});
}

export function getContext() : Context {
  return new Context();
}
