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

export interface RemoteMethodOptions {
  // todo: describe http, accepts, returns, etc.
}
