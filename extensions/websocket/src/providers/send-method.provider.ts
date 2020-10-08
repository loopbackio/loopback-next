// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/authentication-jwt
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

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
