// Copyright The LoopBack Authors 2020,2021. All Rights Reserved.
// Node module: @loopback/socketio
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Provider} from '@loopback/core';
import {SocketIoSendMethod} from '../types';

export class SocketIoSendProvider implements Provider<SocketIoSendMethod> {
  value(): SocketIoSendMethod {
    return (done, result) => this.action(done, result);
  }

  action(done: Function, result: unknown) {
    done({result});
  }
}
