import {invokeMethod} from '@loopback/context';
import {Context, ControllerClass, Provider} from '@loopback/core';

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
