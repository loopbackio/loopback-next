// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/socketio
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingKey} from '@loopback/core';
import {SocketIOServerOptions} from './socketio.server';

export namespace SocketIOBindings {
  export const CONFIG = BindingKey.create<SocketIOServerOptions>(
    'socketio.server.options',
  );
}

export namespace SocketIOTags {
  export const SOCKET_IO = 'socketio';
}
