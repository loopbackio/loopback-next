// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application, Server, ServerConfig} from 'loopback';
import {Client} from './client';
import {Context} from '@loopback/ioc';
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

/**
 * Tell "server" to start listening and wait until it listens.
 * Return a promise that's resolved with the base URL where the
 * server is listening at.
 */
export async function listen(server: http.Server,
    port: number = 0, host: string = '127.0.0.1'): Promise<string> {

  if (port !== 0) {
    console.warn('Do not use a hard-coded port number in the tests, it makes them fragile.');
  }

  // NOTE(bajtos) bluebird.promisify looses type information about the original function
  // As a (temporary?) workaround, I am casting the result to "any function"
  // This would be a more accurate type: (port: number) => Promise<http.Server>
  const listen = bluebird.promisify(server.listen, { context: server }) as Function;
  await listen(port, host);
  return 'http://' + host + ':' + server.address().port;
}
