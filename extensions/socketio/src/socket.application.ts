import {
  Application,
  ApplicationConfig,
  Binding,
  Constructor,
  Server,
} from '@loopback/core';
import {format} from 'util';
import {SocketIOBindings} from './keys';
import {SocketIOComponent} from './socketio.component';
import {SocketIOServer} from './socketio.server';

export const ERR_NO_MULTI_SERVER = format(
  'SocketApplication does not support multiple servers!',
  'To create your own server bindings, please extend the Application class.',
);

export class SocketApplication extends Application {
  constructor(config?: ApplicationConfig) {
    super(config);
    this.component(SocketIOComponent);
  }

  /**
   * The main Socket server instance providing Socket connections for this application.
   */
  get socketServer(): SocketIOServer {
    return this.getSync<SocketIOServer>(SocketIOBindings.SERVER);
  }

  server(server: Constructor<Server>, name?: string): Binding {
    if (this.findByTag('server').length > 0) {
      throw new Error(ERR_NO_MULTI_SERVER);
    }
    return super.server(server, name);
  }
}
