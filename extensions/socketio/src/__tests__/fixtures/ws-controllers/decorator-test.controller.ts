// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/socketio
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Namespace, Server, Socket} from 'socket.io';
import {socketio} from '../../../decorators';

export const DECORATOR_TEST_CONTROLER_NSP = '/decorators/ws';

@socketio({
  name: 'decoratorNsp',
  namespace: DECORATOR_TEST_CONTROLER_NSP,
})
export class DecoratorTestController {
  methodMustReturnSocket(@socketio.socket() socket: Socket) {
    return socket;
  }
  methodMustReturnIoInstance(@socketio.io() io: Server) {
    return io;
  }
  methodMustReturnNamespace(
    @socketio.namespace('decoratorNsp') nsp: Namespace,
  ) {
    return nsp;
  }
}
