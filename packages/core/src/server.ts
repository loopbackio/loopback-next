// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application} from './application';
import {SwaggerRouter} from './router/SwaggerRouter';
import {Sequence} from './Sequence';

import {Context} from '@loopback/context';

import bluebird = require('bluebird');
const debug = require('debug')('loopback:Server');
import {createServer, ServerRequest, ServerResponse} from 'http';

export class Server extends Context {
  public state: ServerState;

  constructor(public config: ServerConfig = {port: 3000}) {
    super();
    this.state = ServerState.cold;
  }

  async start() {
    this.state = ServerState.starting;

    const server = createServer(async (req: ServerRequest, res: ServerResponse) => {
      const sequence = new Sequence();
      await sequence.run(this, req, res);
    });

    // NOTE(bajtos) bluebird.promisify looses type information about the original function
    // As a (temporary?) workaround, I am casting the result to "any function"
    // This would be a more accurate type: (port: number) => Promise<http.Server>
    const listen = bluebird.promisify(server.listen, {context: server}) as Function;
    await listen(this.config.port);
    // FIXME(bajtos) The updated port number should be part of "status" object,
    // we shouldn't be changing original config IMO.
    // Consider exposing full base URL including http/https scheme prefix
    this.config.port = server.address().port;
    this.state = ServerState.listening;
  }
}

export interface ServerConfig {
  port: number;
}

export enum ServerState {
  cold,
  starting,
  listening,
  crashed,
  stopped,
}
