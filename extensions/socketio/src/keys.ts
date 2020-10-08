// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/socketio
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingKey, CoreBindings} from '@loopback/core';
import {Socket} from 'socket.io';
import {SocketIOServer, SocketIOServerOptions} from './socketio.server';

export namespace SocketIOBindings {
  export const CONFIG: BindingKey<SocketIOServerOptions> =
    CoreBindings.APPLICATION_CONFIG;

  /**
   * Binding key for the server itself
   */
  export const SERVER = BindingKey.create<SocketIOServer>(
    'servers.SocketServer',
  );

  export const SOCKET = BindingKey.create<Socket>('socketio.socket');

  export const MESSAGE = BindingKey.create<unknown[]>('socketio.message');

  /**
   * Binding key for setting and injecting the host name of Http Server
   */
  export const HOST = BindingKey.create<string | undefined>('socketio.host');
  /**
   * Binding key for setting and injecting the port number of Http Server
   */
  export const PORT = BindingKey.create<number>('socketio.port');
}

export namespace SocketIOTags {
  export const SOCKET_IO = 'socketio';
}
