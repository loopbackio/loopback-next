import {Context, ControllerClass, CoreBindings, inject} from '@loopback/core';

import {
  WebsocketInvokeMethod,
  WebsocketRejectMethod,
  WebsocketSendMethod,
  WebsocketSequence,
} from './types';
import {WebsocketBindings} from './keys';

export class DefaultWebsocketSequence implements WebsocketSequence {
  constructor(
    @inject.context() protected context: Context,
    @inject(CoreBindings.CONTROLLER_CURRENT)
    protected controller: ControllerClass,
    @inject(WebsocketBindings.INVOKE_METHOD)
    protected invoke: WebsocketInvokeMethod,
    @inject(WebsocketBindings.SEND_METHOD)
    protected send: WebsocketSendMethod,
    @inject(WebsocketBindings.REJECT_METHOD)
    protected reject: WebsocketRejectMethod,
  ) {}

  async handle(methodName: string, args: unknown[], done: Function) {
    try {
      const result = await this.invoke(
        this.context,
        this.controller,
        methodName,
        args,
      );
      await this.send(done, result);
    } catch (err) {
      await this.reject(done, err);
    }
  }
}
