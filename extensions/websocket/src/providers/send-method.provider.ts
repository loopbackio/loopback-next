import {Provider} from '@loopback/core';
import {WebsocketSendMethod} from '../types';

export class WebsocketSendProvider implements Provider<WebsocketSendMethod> {
  value(): WebsocketSendMethod {
    return (done, result) => this.action(done, result);
  }

  action(done: Function, result: unknown) {
    done({result});
  }
}
