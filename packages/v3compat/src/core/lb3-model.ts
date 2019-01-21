// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/v3compat
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ModelBase, Options, Callback} from 'loopback-datasource-juggler';
import {
  RemoteMethodOptions,
  RemotingErrorHook,
  RemotingHook,
  SharedClass,
} from '../remoting';
import {Lb3Application} from './lb3-application';
import {Lb3Registry} from './lb3-registry';
import {
  ModelProperties,
  ModelSettings,
  PlainDataObject,
  ComplexValue,
} from './lb3-types';
import {PersistedModelClass} from './lb3-persisted-model';

// A workaround for https://github.com/Microsoft/TypeScript/issues/6480
// I was not able to find a way how to mix arbitrary static properties
// while preserving constructor signature. We need to contribute this
// feature to TypeScript ourselves.
export interface AnyStaticMethods {
  [methodName: string]: Function;
}

export type ModelClass = typeof Model;

export declare class Model extends ModelBase {
  static app: Lb3Application;
  static registry: Lb3Registry;
  // TODO: sharedClass

  static readonly super_: ModelClass;
  static readonly settings: ModelSettings;
  static sharedCtor?: Function & RemoteMethodOptions;
  static sharedClass: SharedClass;

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

  // TODO fix juggler typings and include these property getters
  static readonly base: ModelClass;

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

  ModelCtor.setup = function(this: ModelClass) {
    // tslint:disable-next-line:no-shadowed-variable
    const ModelCtor: ModelClass = this;
    const Parent = ModelCtor.super_;

    if (!ModelCtor.registry && Parent && Parent.registry) {
      ModelCtor.registry = Parent.registry;
    }

    const options = ModelCtor.settings;

    // support remoting prototype methods
    // it's important to setup this function *before* calling `new SharedClass`
    // otherwise remoting metadata from our base model is picked up
    ModelCtor.sharedCtor = function(
      data: PlainDataObject | undefined | null,
      id: ComplexValue,
      // tslint:disable-next-line:no-shadowed-variable
      options: Options | undefined,
      fn: Callback,
    ) {
      // tslint:disable-next-line:no-shadowed-variable no-invalid-this
      const ModelCtor: ModelClass = this;

      const isRemoteInvocationWithOptions =
        typeof data !== 'object' &&
        typeof id === 'object' &&
        typeof options === 'function';
      if (isRemoteInvocationWithOptions) {
        // sharedCtor(id, options, fn)
        fn = options as Callback;
        options = id as Options;
        id = data as ComplexValue;
        data = null;
      } else if (typeof data === 'function') {
        // sharedCtor(fn)
        fn = data;
        data = null;
        id = null;
        options = undefined;
      } else if (typeof id === 'function') {
        // sharedCtor(data, fn)
        // sharedCtor(id, fn)
        fn = id;
        options = undefined;

        if (typeof data !== 'object') {
          id = data;
          data = null;
        } else {
          id = null;
        }
      }

      if (id != null && data) {
        const model = new ModelCtor(data);
        model.id = id;
        fn(null, model);
      } else if (data) {
        fn(null, new ModelCtor(data));
      } else if (id != null) {
        const filter = {};
        (ModelCtor as PersistedModelClass).findById(
          id,
          filter,
          options,
          function(err, model) {
            if (err) {
              fn(err);
            } else if (model) {
              fn(null, model);
            } else {
              err = new Error(`could not find a model with id ${id}`);
              err.statusCode = 404;
              err.code = 'MODEL_NOT_FOUND';
              fn(err);
            }
          },
        );
      } else {
        fn(new Error('must specify an {{id}} or {{data}}'));
      }
    };

    const idDesc = ModelCtor.modelName + ' id';
    ModelCtor.sharedCtor.accepts = [
      {
        arg: 'id',
        type: 'any',
        required: true,
        http: {source: 'path'},
        description: idDesc,
      },
      // TODO: options from the context
      // {arg: 'options', type: 'object', http: createOptionsViaModelMethod},
    ];

    ModelCtor.sharedCtor.http = [{path: '/:id'}];

    ModelCtor.sharedCtor.returns = {root: true};

    const remotingOptions = {};
    Object.assign(remotingOptions, options.remoting);

    // create a sharedClass
    ModelCtor.sharedClass = new SharedClass(
      ModelCtor.modelName,
      ModelCtor,
      remotingOptions,
    );

    ModelCtor.beforeRemote = function(name: string, fn: RemotingHook) {
      // TODO
      console.warn('beforeRemote hook not implemented yet');
    };

    // after remote hook
    ModelCtor.afterRemote = function(name: string, fn: RemotingHook) {
      // TODO
      console.warn('afterRemote hook not implemented yet');
    };

    ModelCtor.afterRemoteError = function(name: string, fn: RemotingErrorHook) {
      console.warn('afterRemoteError hook not implemented yet');
    };

    // TODO: resolve relation functions
  };

  ModelCtor.remoteMethod = function(this: ModelClass, name, options) {
    if (options.isStatic === undefined) {
      const m = name.match(/^prototype\.(.*)$/);
      if (m) {
        options.isStatic = false;
        name = m[1];
      } else {
        options.isStatic = true;
      }
    }

    // TODO: setupOptionsArgs

    this.sharedClass.defineMethod(name, options);
    // TODO this.emit('remoteMethodAdded', this.sharedClass);
  };

  ModelCtor.setup();

  return ModelCtor;
}
