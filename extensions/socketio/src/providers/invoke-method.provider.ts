// Copyright The LoopBack Authors 2020,2021. All Rights Reserved.
// Node module: @loopback/socketio
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context, ControllerClass, invokeMethod, Provider} from '@loopback/core';
import {SocketIoInvokeMethod} from '../types';

export class SocketIoInvokeMethodProvider
  implements Provider<SocketIoInvokeMethod>
{
  constructor() {}

  value(): SocketIoInvokeMethod {
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
