import {Provider} from '@loopback/core';
import {WebsocketRejectMethod} from '../types';

export class WebsocketRejectProvider
  implements Provider<WebsocketRejectMethod> {
  value(): WebsocketRejectMethod {
    return (done, error) => this.action(done, error);
  }

  action(done: Function, error: Error) {
    done({error});
  }
}
