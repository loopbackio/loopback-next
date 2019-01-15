/// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/v3compat
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as assert from 'assert';
import {
  ParameterOptions,
  RemoteMethodOptions,
  RestRouteSettings,
  RetvalOptions,
} from './remoting-types';
import {CtorFunction, SharedClass} from './shared-class';

export class SharedMethod {
  readonly aliases: string[];
  readonly isStatic: boolean;
  readonly accepts: ParameterOptions[];
  readonly returns: RetvalOptions[];
  readonly description?: string;
  readonly notes?: string;
  readonly documented: boolean;
  readonly http: RestRouteSettings[];
  readonly shared: boolean;
  readonly ctor?: CtorFunction;
  readonly sharedCtor: SharedMethod;
  readonly isSharedCtor: boolean;
  readonly stringName: string;

  // user-defined extensions
  [customKey: string]: unknown;

  constructor(
    public readonly fn: (Function & RemoteMethodOptions) | undefined,
    public readonly name: string,
    public readonly sharedClass: SharedClass,
    public readonly options: RemoteMethodOptions = {},
  ) {
    const fnMeta: RemoteMethodOptions = fn || {};
    this.aliases = options.aliases || [];
    this.isStatic = options.isStatic || false;
    const accepts = options.accepts || fnMeta.accepts || [];
    const returns = options.returns || fnMeta.returns || [];
    // TODO: this.errors = options.errors || fn.errors || [];
    this.description = options.description || fnMeta.description;
    // TODO: this.accessType = options.accessType || fn.accessType;
    this.notes = options.notes || fnMeta.notes;
    this.documented =
      options.documented !== false && fnMeta.documented !== false;
    const http = options.http || fnMeta.http || {};
    // TODO: this.rest = options.rest || fn.rest || {};
    this.shared = isShared(fnMeta, options);
    this.sharedClass = sharedClass;

    if (sharedClass) {
      this.ctor = sharedClass.ctor;
      this.sharedCtor = sharedClass.sharedCtor;
    } else {
      assert(
        !!fn,
        'A shared method not attached to any class must provide the function.',
      );
    }
    this.isSharedCtor = name === 'sharedCtor';

    this.accepts = accepts && !Array.isArray(accepts) ? [accepts] : accepts;
    this.accepts.forEach(normalizeArgumentDescriptor);

    this.returns = returns && !Array.isArray(returns) ? [returns] : returns;
    this.returns.forEach(normalizeArgumentDescriptor);

    this.http = http && !Array.isArray(http) ? [http] : http;

    // TODO: handle stream types
    // TODO: handle error.options

    if (/^prototype\./.test(name)) {
      const msg =
        'Incorrect API usage. Shared methods on prototypes should be ' +
        'created via `new SharedMethod(fn, "name", { isStatic: false })`';
      throw new Error(msg);
    }

    this.stringName =
      (sharedClass ? sharedClass.name : '') +
      (this.isStatic ? '.' : '.prototype.') +
      name;

    // Include any remaining metadata to support custom user-defined extensions
    for (const key in options) {
      if (key in this) continue;
      this[key] = options[key];
    }
  }

  addAlias(alias: string) {
    if (this.aliases.indexOf(alias) !== -1) return;
    this.aliases.push(alias);
  }

  getFunction(): Function {
    if (!this.ctor) return this.fn!;

    let fn: Function;
    if (this.isStatic) {
      fn = this.ctor[this.name] as Function;
    } else {
      fn = this.ctor.prototype[this.name];
    }

    return fn || this.fn;
  }

  isDelegateFor(suspect: Function | string, isStatic: boolean = false) {
    if (suspect!) {
      switch (typeof suspect) {
        case 'function':
          return this.getFunction() === suspect;
        case 'string':
          if (this.isStatic !== isStatic) return false;
          return this.name === suspect || this.aliases.indexOf(suspect) !== -1;
      }
    }

    return false;
  }

  static fromFunction(
    fn: Function & RemoteMethodOptions,
    name: string,
    sharedClass: SharedClass,
    isStatic: boolean = false,
  ) {
    return new SharedMethod(fn, name, sharedClass, {
      isStatic: isStatic,
      accepts: fn.accepts,
      returns: fn.returns,
      errors: fn.errors,
      description: fn.description,
      notes: fn.notes,
      http: fn.http,
      rest: fn.rest,
    });
  }
}

function isShared(fn: RemoteMethodOptions, options: RemoteMethodOptions) {
  let shared = options.shared;
  if (shared === undefined) shared = true;
  if (fn.shared === false) shared = false;
  return shared;
}

function normalizeArgumentDescriptor(desc: ParameterOptions | RetvalOptions) {
  if (desc.type === 'array') desc.type = ['any'];
}
