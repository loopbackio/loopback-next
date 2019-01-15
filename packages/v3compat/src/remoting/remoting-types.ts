// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/v3compat
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

// FIXME Use a real context class/interface from strong-remoting here
// tslint:disable-next-line:no-any
export type RemotingContext = any;

/**
 * The handler function passed to `Model.beforeRemote` and `Model.afterRemote`.
 */
export type RemotingHook = RemotingHookCallback | RemotingHookPromise;

export type RemotingHookPromise = (
  ctx: RemotingContext,
  unused: void,
) => Promise<void>;
export type RemotingHookCallback = (
  ctx: RemotingContext,
  unused: void,
  next: (err?: Error) => void,
) => void;

/**
 * The handler function passed to `Model.afterRemoteError`.
 */
export type RemotingErrorHook =
  | RemotingErrorHookCallback
  | RemotingErrorHookPromise;

export type RemotingErrorHookPromise = (ctx: RemotingContext) => Promise<void>;
export type RemotingErrorHookCallback = (
  ctx: RemotingContext,
  next: (err?: Error) => void,
) => void;

export interface RemoteClassOptions {
  // TODO: are there any well-known class options?
}

export interface RemoteMethodOptions {
  aliases?: string[];
  isStatic?: boolean;
  accepts?: ParameterOptions | ParameterOptions[];
  returns?: RetvalOptions | RetvalOptions[];
  // TODO: errors
  description?: string;
  notes?: string;
  documented?: boolean;
  http?: RestRouteSettings | RestRouteSettings[];
  // TODO: rest
  shared?: boolean;

  // user-defined extensions
  [customKey: string]: unknown;
}

export interface ParameterOptions {
  arg?: string;
  type?: string | [string];
  model?: string;
  required?: boolean;
  description?: string;
  http?: RestParameterMapping; // TODO: support function `(ctx) => value`
}

export interface RestParameterMapping {
  source?:
    | 'req'
    | 'res'
    | 'body'
    | 'form'
    | 'query'
    | 'path'
    | 'header'
    | 'context';
}

export interface RetvalOptions {
  arg?: string;
  type?: string | [string];
  model?: string;
  root?: boolean;
  description?: string;
  http?: RestRetvalMapping;
}

export interface RestRetvalMapping {
  target?: 'status' | 'header';
}

export interface RestRouteSettings {
  path?: string;
  verb?: string;
}
