// Copyright The LoopBack Authors 2020,2021. All Rights Reserved.
// Node module: @loopback/socketio
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context, ControllerClass, CoreBindings, inject} from '@loopback/core';
import {SocketIoBindings} from './keys';
import {
  SocketIoInvokeMethod,
  SocketIoRejectMethod,
  SocketIoSendMethod,
  SocketIoSequence,
} from './types';

export class DefaultSocketIoSequence implements SocketIoSequence {
  constructor(
    @inject.context() protected context: Context,
    @inject(CoreBindings.CONTROLLER_CURRENT)
    protected controller: ControllerClass,
    @inject(SocketIoBindings.INVOKE_METHOD)
    protected invoke: SocketIoInvokeMethod,
    @inject(SocketIoBindings.SEND_METHOD)
    protected send: SocketIoSendMethod,
    @inject(SocketIoBindings.REJECT_METHOD)
    protected reject: SocketIoRejectMethod,
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
