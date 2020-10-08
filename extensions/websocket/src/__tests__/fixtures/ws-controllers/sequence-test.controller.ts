import {ws} from '../../../decorators';

export const SEQUENCE_TEST_CONTROLER_NSP = '/sequences/ws';

@ws.controller(SEQUENCE_TEST_CONTROLER_NSP)
export class SequenceTestController {
  responseSuccess({oneParam}: {oneParam: string}) {
    return {text: `yes you are the first params: ${oneParam}`};
  }
  responseError({badParam}: {badParam: string}) {
    throw new Error(`this is a badParam: ${badParam}`);
  }
}
