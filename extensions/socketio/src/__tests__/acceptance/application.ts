// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/socket
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {ServiceMixin} from '@loopback/service-proxy';
import debugFactory from 'debug';
import {SocketApplication, SocketIOServer} from '../..';
import {SocketIOController} from './controllers';
const debug = debugFactory('loopback:socketio:demo');

export class SocketIODemoApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(SocketApplication)),
) {
  readonly ioServer: SocketIOServer;

  constructor(options: ApplicationConfig = {}) {
    options.rest = options.rest || {};
    options.rest.port = +(process.env.PORT || 3000);
    options.rest.host = process.env.HOST || '127.0.0.1';
    options.rest.url = '127.0.0.1:3000';
    super(options);

    this.projectRoot = __dirname;

    this.socketServer.use((socket, next) => {
      debug('Global middleware - socket:', socket.id);
      next();
    });
    const ns = this.socketServer.route(SocketIOController, /^\/chats\/.+$/);
    ns.use((socket, next) => {
      debug(
        'Middleware for namespace %s - socket: %s',
        socket.nsp.name,
        socket.id,
      );
      next();
    });
  }
}
