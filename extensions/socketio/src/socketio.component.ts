// Copyright The LoopBack Authors 2020,2021. All Rights Reserved.
// Node module: @loopback/socketio
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Application,
  Binding,
  Component,
  Constructor,
  CoreBindings,
  inject,
  ProviderMap,
  Server,
} from '@loopback/core';
import {SocketIoBooter} from './booters';
import {SocketIoBindings} from './keys';
import {
  SocketIoInvokeMethodProvider,
  SocketIoRejectProvider,
  SocketIoSendProvider,
} from './providers';
import {DefaultSocketIoSequence} from './socketio.sequence';
import {SocketIoServer} from './socketio.server';

export class SocketIoComponent implements Component {
  booters = [SocketIoBooter];
  providers: ProviderMap = {
    [SocketIoBindings.INVOKE_METHOD.key]: SocketIoInvokeMethodProvider,
    [SocketIoBindings.SEND_METHOD.key]: SocketIoSendProvider,
    [SocketIoBindings.REJECT_METHOD.key]: SocketIoRejectProvider,
  };
  /**
   * Add built-in body parsers
   */
  bindings: Binding[] = [];
  servers: {
    [name: string]: Constructor<Server>;
  } = {
    SocketServer: SocketIoServer,
  };

  constructor(@inject(CoreBindings.APPLICATION_INSTANCE) app: Application) {
    app.bind(SocketIoBindings.REQUEST_LISTENER).to(() => {});

    app.bind(SocketIoBindings.SEQUENCE).toClass(DefaultSocketIoSequence);
  }
}
