// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/socketio
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Application,
  ApplicationConfig,
  Binding,
  Constructor,
  Server,
} from '@loopback/core';
import {format} from 'util';
import {SocketIoBindings} from './keys';
import {SocketIoComponent} from './socketio.component';
import {SocketIoServer} from './socketio.server';

export const ERR_NO_MULTI_SERVER = format(
  'SocketApplication does not support multiple servers!',
  'To create your own server bindings, please extend the Application class.',
);

export class SocketIoApplication extends Application {
  constructor(config?: ApplicationConfig) {
    super(config);
    this.component(SocketIoComponent);
  }

  /**
   * The main Socket server instance providing Socket connections for this application.
   */
  get socketServer(): SocketIoServer {
    return this.getSync<SocketIoServer>(SocketIoBindings.SERVER);
  }

  server(server: Constructor<Server>, name?: string): Binding {
    if (this.findByTag('server').length > 0) {
      throw new Error(ERR_NO_MULTI_SERVER);
    }
    return super.server(server, name);
  }
}
