// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/socketio
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingKey} from '@loopback/core';
import {Socket} from 'socket.io';
import {SocketIOServerOptions} from './socketio.server';

export namespace SocketIOBindings {
  export const CONFIG = BindingKey.create<SocketIOServerOptions>(
    'socketio.server.options',
  );

  export const SOCKET = BindingKey.create<Socket>('socketio.socket');

  export const MESSAGE = BindingKey.create<unknown[]>('socketio.message');
}

export namespace SocketIOTags {
  export const SOCKET_IO = 'socketio';
}
