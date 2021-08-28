// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/socketio
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Server} from 'socket.io';

export class DummySocket {
  on(_eventName: string | symbol, _cb: (...args: unknown[]) => void) {}
  use(
    _cb: (
      packet: Parameters<Server['use']>[0],
      next: (err?: unknown) => void,
    ) => void,
  ) {}
}
