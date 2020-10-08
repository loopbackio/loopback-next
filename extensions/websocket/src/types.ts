// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/authentication-jwt
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context, ControllerClass} from '@loopback/core';
import {HttpServerOptions} from '@loopback/http-server';

export type WebsocketOptions = HttpServerOptions;

export interface WebsocketSequence {
  handle(methodName: string, args: unknown[], done: Function): Promise<void>;
}

export type WebsocketDoneFunction = (response: unknown) => Promise<void>;

export type WebsocketInvokeMethod = (
  context: Context,
  controller: ControllerClass,
  methodName: string,
  args: unknown[],
) => unknown;

export type WebsocketSendMethod = (done: Function, result: unknown) => unknown;

export type WebsocketRejectMethod = (done: Function, error: Error) => unknown;
