import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {ServiceMixin} from '@loopback/service-proxy';
import {SocketApplication, SocketIOServer} from '@loopback/socketio';
import debugFactory from 'debug';
import {SocketIOController} from './controllers';

const debug = debugFactory('loopback:example:socketio:demo');

export {ApplicationConfig};

export class SocketioApplication extends BootMixin(
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
      console.log('global');
      next();
    });

    const ns = this.socketServer.route(SocketIOController);
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
