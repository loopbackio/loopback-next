import {
  Application,
  ApplicationConfig,
  Binding,
  Constructor,
  Context,
  Server,
} from '@loopback/core';
import {format} from 'util';
import {SocketServer} from './socket.server';
import {SocketIOComponent} from './socketio.component';

export const ERR_NO_MULTI_SERVER = format(
  'SocketApplication does not support multiple servers!',
  'To create your own server bindings, please extend the Application class.',
);

export class SocketApplication extends Application {
  constructor(configOrParent?: ApplicationConfig | Context) {
    super(configOrParent);
    this.component(SocketIOComponent);
  }

  /**
   * The main Socket server instance providing Socket connections for this application.
   */
  get socketServer(): SocketServer {
    // Copying the implementation from rest application
    return this.getSync<SocketServer>('servers.SocketServer');
  }

  server(server: Constructor<Server>, name?: string): Binding {
    if (this.findByTag('server').length > 0) {
      throw new Error(ERR_NO_MULTI_SERVER);
    }
    return super.server(server, name);
  }
}
