// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/socket
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {ServiceMixin} from '@loopback/service-proxy';
import {SocketServer} from '../..';
import {SocketApplication} from '../../socket.application';
import {SocketIOController} from './controllers';

// const debug = debugFactory('loopback:socketio:application');

export class SocketIODemoApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(SocketApplication)),
) {
  readonly ioServer: SocketServer;

  constructor(options: ApplicationConfig = {}) {
    options.ioServer = options.ioServer || {};
    options.ioServer.port = +(process.env.PORT || 3000);
    options.ioServer.host = process.env.HOST || '127.0.0.1';
    options.ioServer.url = '127.0.0.1:3000';
    super(options);

    // Create ws server from the http server
    // const server = new SocketIOServer({httpServerOptions: options.socketio});
    // this.bind('servers.socketio.SocketIOServer').to(server);
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
    console.log('SERVER ::', this.socketServer);
    this.controller(SocketIOController);
    // server.controller(SocketIOController);
    // server.discoverAndRegister();
    // this.ioServer = server;
  }

  // start() {
  //   return this.ioServer.start();
  // }

  // stop() {
  //   return this.ioServer.stop();
  // }
}
