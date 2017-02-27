// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import http = require('http');
import bluebird = require('bluebird');
import {Context} from './context';
import {Application} from '../lib/application';
import SwaggerRouter from './router/SwaggerRouter';

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
  // get runtime to enforce AppConfig as AppConfig
  constructor(public config?: ServerConfig) {
    super();
    if (config === undefined) {
      this.config = {port: 3000};
    }
  }

  public state: ServerState = ServerState.cold;

  async start() {
    this.state = ServerState.starting;

    // TODO(bajtos) support hot-reloading of controllers
    // after the app started. The idea is to rebuild the SwaggerRouter
    // instance whenever a controller was added/deleted.
    const router = new SwaggerRouter();
    this.find('applications.*').forEach(appBinding => {
      const app = appBinding.getValue() as Application;
      app.find('controllers.*').forEach(b => router.controller(b.getValue()));
    });

    const server = http.createServer(router.handler);

    // NOTE(bajtos) bluebird.promisify looses type information about the original function
    // As a (temporary?) workaround, I am casting the result to "any function"
    // This would be a more accurate type: (port: number) => Promise<http.Server>
    const listen = bluebird.promisify(server.listen, {context: server}) as Function;
    await listen(this.config.port);
    this.config.port = server.address().port;
    this.state = ServerState.listening;
  }
}
