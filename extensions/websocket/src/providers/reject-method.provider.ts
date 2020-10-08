// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/authentication-jwt
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

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
