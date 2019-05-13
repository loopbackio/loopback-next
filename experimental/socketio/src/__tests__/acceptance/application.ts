// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/socketio
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application, ApplicationConfig} from '@loopback/core';
import {SocketIOServer} from '../..';
import {SocketIOController} from './controllers';

// const debug = debugFactory('loopback:socketio:application');

// tslint:disable:no-any

export class SocketIODemoApplication extends Application {
  readonly ioServer: SocketIOServer;

  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Create ws server from the http server
    const server = new SocketIOServer({httpServerOptions: options.socketio});
    this.bind('servers.socketio.SocketIOServer').to(server);
    /*
    server.use((socket, next) => {
      debug('Global middleware - socket:', socket.id);
      next();
    });
    // Add a route
    const ns = server.route(SocketIOController, /^\/chats\/.+$/);
    ns.use((socket, next) => {
      debug(
        'Middleware for namespace %s - socket: %s',
        socket.nsp.name,
        socket.id,
      );
      next();
    });
    */
    server.controller(SocketIOController);
    server.discoverAndRegister();
    this.ioServer = server;
  }

  start() {
    return this.ioServer.start();
  }

  stop() {
    return this.ioServer.stop();
  }
}
