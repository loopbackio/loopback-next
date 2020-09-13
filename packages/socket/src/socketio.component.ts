// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/rest
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
import {SocketIOBindings} from './keys';
import {SocketIOServerOptions, SocketServer} from './socket.server';

export class SocketIOComponent implements Component {
  providers: ProviderMap = {};
  /**
   * Add built-in body parsers
   */
  bindings: Binding[] = [];
  servers: {
    [name: string]: Constructor<Server>;
  } = {
    SocketServer: SocketServer,
  };

  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE) app: Application,
    @inject(SocketIOBindings.CONFIG) config?: SocketIOServerOptions,
  ) {}
}
