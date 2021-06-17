// Copyright The LoopBack Authors 2020,2021. All Rights Reserved.
// Node module: @loopback/socketio
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Socket} from 'socket.io';
import {socketio} from '../../../decorators';

export const SAMPLE_CONTROLER_NSP = '/sample/ws';

@socketio(SAMPLE_CONTROLER_NSP)
export class SampleTestController {
  @socketio.subscribe('oneEvent')
  oneMethod({randomNumber}: {randomNumber: number}) {
    return {
      text: `the number is ${randomNumber}`,
    };
  }

  @socketio.subscribe('anotherEvent')
  anotherMethod(
    {randomNumber}: {randomNumber: number},
    @socketio.socket() socket: Socket,
  ) {
    socket.emit(
      'anotherEvent response',
      `this is another number: ${randomNumber}`,
    );
  }
}
