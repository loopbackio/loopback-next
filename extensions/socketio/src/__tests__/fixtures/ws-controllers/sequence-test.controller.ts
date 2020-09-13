// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/socketio
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {socketio} from '../../../decorators';

export const SEQUENCE_TEST_CONTROLER_NSP = '/sequences/ws';

@socketio(SEQUENCE_TEST_CONTROLER_NSP)
export class SequenceTestController {
  responseSuccess({oneParam}: {oneParam: string}) {
    return {text: `yes you are the first params: ${oneParam}`};
  }
  responseError({badParam}: {badParam: string}) {
    throw new Error(`this is a badParam: ${badParam}`);
  }
}
