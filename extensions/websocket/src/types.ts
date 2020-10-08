import {Context} from '@loopback/context';
import {ControllerClass} from '@loopback/core';
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
