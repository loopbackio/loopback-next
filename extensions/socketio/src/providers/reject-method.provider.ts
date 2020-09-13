// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/socketio
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Provider} from '@loopback/core';
import {SocketIoRejectMethod} from '../types';

export class SocketIoRejectProvider implements Provider<SocketIoRejectMethod> {
  value(): SocketIoRejectMethod {
    return (done, error) => this.action(done, error);
  }

  action(done: Function, error: Error) {
    done({error});
  }
}
