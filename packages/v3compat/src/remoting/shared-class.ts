/// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/v3compat
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  RemoteClassOptions,
  RestRouteSettings,
  RemoteMethodOptions,
} from './remoting-types';
import {SharedMethod} from './shared-method';
import assert = require('assert');

export type CtorFunction = Function & {
  http?: RestRouteSettings;
  sharedCtor?: Function;

  [staticKey: string]: Function | unknown;
};

// See strong-remoting's lib/shared-class.js
export class SharedClass {
  private readonly _methods: SharedMethod[] = [];
  readonly http: RestRouteSettings;
  readonly sharedCtor: SharedMethod;

  // TODO: _resolvers, _disabledMethods

  constructor(
    public name: string,
    public ctor: CtorFunction,
    public options: RemoteClassOptions,
  ) {
    const http = ctor && ctor.http;

    const defaultHttp: RestRouteSettings = {};
    defaultHttp.path = '/' + this.name;

    if (Array.isArray(http)) {
      // use array as is
      this.http = http;
      if (http.length === 0) {
        http.push(defaultHttp);
      }
    } else {
      // set http.path using the name unless it is defined
      this.http = Object.assign(defaultHttp, http);
    }

    if (typeof ctor === 'function' && ctor.sharedCtor) {
      this.sharedCtor = new SharedMethod(ctor.sharedCtor, 'sharedCtor', this);
    }

    assert(
      this.name,
      'must include a remoteNamespace when creating a SharedClass',
    );
  }

  methods(/*TODO: options*/) {
    const ctor = this.ctor;
    const methods: SharedMethod[] = [];
    const sc = this;
    const functionIndex: Function[] = [];

    // static methods
    eachRemoteFunctionInObject(ctor, function(fn, name) {
      if (functionIndex.indexOf(fn) === -1) {
        functionIndex.push(fn);
      } else {
        const sharedMethod = find(methods, fn);
        sharedMethod!.addAlias(name);
        return;
      }
      methods.push(SharedMethod.fromFunction(fn, name, sc, true));
    });

    // instance methods
    eachRemoteFunctionInObject(ctor.prototype, function(fn, name) {
      if (functionIndex.indexOf(fn) === -1) {
        functionIndex.push(fn);
      } else {
        const sharedMethod = find(methods, fn);
        sharedMethod!.addAlias(name);
        return;
      }

      methods.push(SharedMethod.fromFunction(fn, name, sc));
    });

    // TODO: resolvers

    methods.push(...this._methods);

    // TODO: optionally filter disabled methods

    return methods;
  }

  defineMethod(name: string, options: RemoteMethodOptions, fn?: Function) {
    const sharedMethod = new SharedMethod(fn, name, this, options);
    this._methods.push(sharedMethod);
  }
}

function eachRemoteFunctionInObject(
  // tslint:disable-next-line:no-any
  obj: any,
  f: (fn: Function, key: string) => void,
) {
  if (!obj) return;

  for (const key in obj) {
    if (key === 'super_') {
      // Skip super class
      continue;
    }
    let fn;

    try {
      fn = obj[key];
    } catch (e) {}

    // HACK: [rfeng] Do not expose model constructors
    // We have the following usage to set other model classes as properties
    // User.email = Email;
    // User.accessToken = AccessToken;
    // Both Email and AccessToken can have shared flag set to true
    if (typeof fn === 'function' && fn.shared && !fn.modelName) {
      f(fn, key);
    }
  }
}
function find(
  methods: SharedMethod[],
  fn: Function,
  isStatic: boolean = false,
) {
  for (const method of methods) {
    if (method.isDelegateFor(fn, isStatic)) return method;
  }
  return null;
}
