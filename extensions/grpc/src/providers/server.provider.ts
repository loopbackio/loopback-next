// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/grpc
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Server} from '@grpc/grpc-js';
import {Provider} from '@loopback/core';

/**
 * This provider will creates a GRPC Server
 */
export class ServerProvider implements Provider<Server> {
  private server = new Server();
  public value(): Server {
    return this.server;
  }
}
