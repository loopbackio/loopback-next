// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/authentication-jwt
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingKey, CoreBindings} from '@loopback/core';
import {RequestListener} from '@loopback/http-server';
import {Server, ServerOptions, Socket} from 'socket.io';
import {
  WebsocketInvokeMethod,
  WebsocketOptions,
  WebsocketRejectMethod,
  WebsocketSendMethod,
  WebsocketSequence,
} from './types';
import {WebsocketServer} from './websocket.server';

export namespace WebsocketBindings {
  export const CONFIG: BindingKey<WebsocketOptions> = CoreBindings.APPLICATION_CONFIG.deepProperty(
    'websocket.config',
  );
  export const OPTIONS: BindingKey<ServerOptions> = CoreBindings.APPLICATION_CONFIG.deepProperty(
    'websocket.options',
  );
  export const IO = BindingKey.create<Server>('ws.server');

  export const REQUEST_LISTENER = BindingKey.create<RequestListener>(
    'ws.request.handler',
  );
  export const SERVER = BindingKey.create<WebsocketServer>('ws.server.class');
  export const SOCKET = BindingKey.create<Socket>('ws.socket');

  export const SEQUENCE = BindingKey.create<WebsocketSequence>('ws.sequence');

  export const MESSAGE = BindingKey.create<unknown[]>('ws.message');

  export const INVOKE_METHOD = BindingKey.create<WebsocketInvokeMethod>(
    'ws.sequence.invokeMethod',
  );
  export const SEND_METHOD = BindingKey.create<WebsocketSendMethod>(
    'ws.sequence.sendMethod',
  );
  export const REJECT_METHOD = BindingKey.create<WebsocketRejectMethod>(
    'ws.sequence.rejectMethod',
  );

  export const CONTROLLERS_NAMESPACE = 'ws.controllers';
}

export namespace WebsocketTags {
  export const SOCKET_IO = 'websocket';
}
