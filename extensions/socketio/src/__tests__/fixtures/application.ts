// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/socketio
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import debugFactory from 'debug';
import {SocketIoApplication} from '../../socketio.application';
import {SocketIoServer} from '../../socketio.server';
import {ChatController} from './ws-controllers';

const debug = debugFactory('loopback:socketio:demo');

export class SocketIoDemoApplication extends BootMixin(SocketIoApplication) {
  readonly ioServer: SocketIoServer;

  constructor(options: ApplicationConfig = {}) {
    super(options);

    this.projectRoot = __dirname;

    this.socketServer.use((socket, next) => {
      debug('Global middleware - socket:', socket.id);
      next();
    });
    const ns = this.socketServer.route(ChatController, /^\/chats\/.+$/);
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
