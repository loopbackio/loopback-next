// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/authentication-jwt
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Namespace, Server, Socket} from 'socket.io';
import {ws} from '../../../decorators';

export const DECORATOR_TEST_CONTROLER_NSP = '/decorators/ws';

@ws.controller({
  name: 'decoratorNsp',
  namespace: DECORATOR_TEST_CONTROLER_NSP,
})
export class DecoratorTestController {
  methodMustReturnSocket(@ws.socket() socket: Socket) {
    return socket;
  }
  methodMustReturnIoInstance(@ws.io() io: Server) {
    return io;
  }
  methodMustReturnNamespace(@ws.namespace('decoratorNsp') nsp: Namespace) {
    return nsp;
  }
}
