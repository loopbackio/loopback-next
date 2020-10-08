// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/authentication-jwt
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context, ControllerClass, invokeMethod, Provider} from '@loopback/core';
import {WebsocketInvokeMethod} from '../types';

export class WebsocketInvokeMethodProvider
  implements Provider<WebsocketInvokeMethod> {
  constructor() {}

  value(): WebsocketInvokeMethod {
    return (context, controller, methodName, args) =>
      this.action(context, controller, methodName, args);
  }

  action(
    context: Context,
    controller: ControllerClass,
    methodName: string,
    args: unknown[],
  ) {
    return invokeMethod(controller, methodName, context, args);
  }
}
