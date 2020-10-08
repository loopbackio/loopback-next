// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/authentication-jwt
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Socket} from 'socket.io';
import {ws} from '../../../decorators';

export const SAMPLE_CONTROLER_NSP = '/sample/ws';

@ws.controller(SAMPLE_CONTROLER_NSP)
export class SampleTestController {
  @ws.subscribe('oneEvent')
  oneMethod({randomNumber}: {randomNumber: number}) {
    return {
      text: `the number is ${randomNumber}`,
    };
  }

  @ws.subscribe('anotherEvent')
  anotherMethod(
    {randomNumber}: {randomNumber: number},
    @ws.socket() socket: Socket,
  ) {
    socket.emit(
      'anotherEvent response',
      `this is another number: ${randomNumber}`,
    );
  }
}
