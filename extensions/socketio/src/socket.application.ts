import {
  Application,
  ApplicationConfig,
  Binding,
  Constructor,
  Context,
  Server,
} from '@loopback/core';
import {format} from 'util';
import {SocketIOBindings} from './keys';
import {SocketIOServer} from './socketio.server';
import {SocketIOComponent} from './socketio.component';

export const ERR_NO_MULTI_SERVER = format(
  'SocketApplication does not support multiple servers!',
  'To create your own server bindings, please extend the Application class.',
);

export class SocketApplication extends Application {
  /**
   * Create a REST application with the given parent context
   * @param parent - Parent context
   */
  constructor(parent: Context);
  /**
   * Create a REST application with the given configuration and parent context
   * @param config - Application configuration
   * @param parent - Parent context
   */
  constructor(config?: ApplicationConfig, parent?: Context);

  constructor(configOrParent?: ApplicationConfig | Context) {
    super(configOrParent);
    // getting server options and binding it to SocketIOBindings.CONFIG
    if (
      configOrParent &&
      (configOrParent as ApplicationConfig).rest &&
      (configOrParent as ApplicationConfig).rest.port
    ) {
      this.bind(SocketIOBindings.PORT).to(
        (configOrParent as ApplicationConfig).rest.port,
      );
    }

    if (
      configOrParent &&
      (configOrParent as ApplicationConfig).rest &&
      (configOrParent as ApplicationConfig).rest.host
    ) {
      this.bind(SocketIOBindings.PORT).to(
        (configOrParent as ApplicationConfig).rest.host,
      );
    }

    this.component(SocketIOComponent);
  }

  /**
   * The main Socket server instance providing Socket connections for this application.
   */
  get socketServer(): SocketIOServer {
    // Copying the implementation from rest application
    return this.getSync<SocketIOServer>('servers.SocketServer');
  }

  server(server: Constructor<Server>, name?: string): Binding {
    if (this.findByTag('server').length > 0) {
      throw new Error(ERR_NO_MULTI_SERVER);
    }
    return super.server(server, name);
  }
}
