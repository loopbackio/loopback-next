// Copyright The LoopBack Authors 2020,2021. All Rights Reserved.
// Node module: @loopback/socketio
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context, ControllerClass} from '@loopback/core';
import {HttpServerOptions} from '@loopback/http-server';

export type SocketIoOptions = HttpServerOptions;

export interface SocketIoSequence {
  handle(methodName: string, args: unknown[], done: Function): Promise<void>;
}

export type SocketIoDoneFunction = (response: unknown) => Promise<void>;

export type SocketIoInvokeMethod = (
  context: Context,
  controller: ControllerClass,
  methodName: string,
  args: unknown[],
) => unknown;

export type SocketIoSendMethod = (done: Function, result: unknown) => unknown;

export type SocketIoRejectMethod = (done: Function, error: Error) => unknown;
