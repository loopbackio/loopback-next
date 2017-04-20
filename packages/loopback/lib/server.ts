// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import http = require('http');
import bluebird = require('bluebird');
import {Context} from '@loopback/ioc';
import {Application} from '../lib/application';
import {SwaggerRouter} from './router/SwaggerRouter';

const debug = require('debug')('loopback:Server');

export interface ServerConfig {
  port : number;
}

export enum ServerState {
  cold,
  starting,
  listening,
  crashed,
  stopped,
}

export class Server extends Context {
  public config: ServerConfig;
  // get runtime to enforce AppConfig as AppConfig
  constructor(config?: ServerConfig) {
    super();
    this.config = config || {port: 3000};
  }

  public state: ServerState = ServerState.cold;

  async start() {
    this.state = ServerState.starting;

    // TODO(bajtos) support hot-reloading of controllers
    // after the app started. The idea is to rebuild the SwaggerRouter
    // instance whenever a controller was added/deleted.
    const router = new SwaggerRouter();
    this.find('applications.*').forEach(appBinding => {
      debug('Registering app controllers for %j', appBinding.key);
      const app = appBinding.getValue() as Application;
      app.mountControllers(router);
    });

    const server = http.createServer(router.handler);

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
