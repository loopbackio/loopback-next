// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/v3compat
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ModelBase} from 'loopback-datasource-juggler';
import {
  RemoteMethodOptions,
  RemotingErrorHook,
  RemotingHook,
} from '../remoting';
import {Lb3Application} from './lb3-application';
import {Lb3Registry} from './lb3-registry';
import {ModelProperties, ModelSettings} from './lb3-types';

export type ModelClass = typeof Model;

export declare class Model extends ModelBase {
  static app: Lb3Application;
  static registry: Lb3Registry;
  // TODO: sharedClass

  static setup(): void;
  static beforeRemote(name: string, handler: RemotingHook): void;
  static afterRemote(name: string, handler: RemotingHook): void;
  static afterRemoteError(name: string, handler: RemotingErrorHook): void;
  static remoteMethod(name: string, options: RemoteMethodOptions): void;
  static disableRemoteMethodByName(name: string): void;

  // TODO (later)
  // - createOptionsFromRemotingContext
  // - belongsToRemoting
  // - hasOneRemoting
  // - hasManyRemoting
  // - scopeRemoting
  // - nestRemoting

  // TODO fix juggler typings and add this method to ModelBase
  static extend<M extends typeof Model = typeof Model>(
    modelName: string,
    properties?: ModelProperties,
    settings?: ModelSettings,
  ): M;

  // LB3 models allow arbitrary additional properties by default
  // NOTE(bajtos) I tried to allow consumers to specify a white-list of allowed
  // properties, but failed to find a viable way. Also the complexity of such
  // solution was quickly growing out of hands.
  // tslint:disable-next-line:no-any
  [prop: string]: any;
}

export function setupModelClass(registry: Lb3Registry): typeof Model {
  const ModelCtor = registry.modelBuilder.define('Model') as typeof Model;
  ModelCtor.registry = registry;

  // TODO copy implementation of setup, before/after remote hooks, etc.
  // from LB3's lib/model.js

  return ModelCtor;
}
