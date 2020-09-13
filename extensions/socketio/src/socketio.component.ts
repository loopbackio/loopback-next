// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Binding,
  Component,
  Constructor,
  ProviderMap,
  Server,
} from '@loopback/core';
import {SocketIOServer} from './socketio.server';

export class SocketIOComponent implements Component {
  providers: ProviderMap = {};
  /**
   * Add built-in body parsers
   */
  bindings: Binding[] = [];
  servers: {
    [name: string]: Constructor<Server>;
  } = {
    SocketServer: SocketIOServer,
  };

  constructor() {}
}
