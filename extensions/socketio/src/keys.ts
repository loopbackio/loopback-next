// Copyright The LoopBack Authors 2019,2021. All Rights Reserved.
// Node module: @loopback/socketio
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingKey, CoreBindings} from '@loopback/core';
import {RequestListener} from '@loopback/http-server';
import {Server, Socket} from 'socket.io';
import {SocketIoServer, SocketIoServerOptions} from './socketio.server';
import {
  SocketIoInvokeMethod,
  SocketIoRejectMethod,
  SocketIoSendMethod,
  SocketIoSequence,
} from './types';

export namespace SocketIoBindings {
  export const CONFIG: BindingKey<SocketIoServerOptions> =
    CoreBindings.APPLICATION_CONFIG;

  export const IO = BindingKey.create<Server>('socketio.io');

  export const REQUEST_LISTENER = BindingKey.create<RequestListener>(
    'socketio.request.handler',
  );

  /**
   * Binding key for the server itself
   */
  export const SERVER = BindingKey.create<SocketIoServer>(
    'servers.SocketServer',
  );

  export const SOCKET = BindingKey.create<Socket>('socketio.socket');

  export const MESSAGE = BindingKey.create<unknown[]>('socketio.message');

  export const SEQUENCE =
    BindingKey.create<SocketIoSequence>('socketio.sequence');

  export const INVOKE_METHOD = BindingKey.create<SocketIoInvokeMethod>(
    'socketio.sequence.invokeMethod',
  );
  export const SEND_METHOD = BindingKey.create<SocketIoSendMethod>(
    'socketio.sequence.sendMethod',
  );
  export const REJECT_METHOD = BindingKey.create<SocketIoRejectMethod>(
    'socketio.sequence.rejectMethod',
  );

  /**
   * Binding key for setting and injecting the host name of Http Server
   */
  export const HOST = BindingKey.create<string | undefined>('socketio.host');
  /**
   * Binding key for setting and injecting the port number of Http Server
   */
  export const PORT = BindingKey.create<number>('socketio.port');

  export const CONTROLLERS_NAMESPACE = 'socketio.controllers';
}

export namespace SocketIoTags {
  export const SOCKET_IO = 'socketio';
}
