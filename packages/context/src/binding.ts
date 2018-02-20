// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context} from './context';
import {ResolutionSession} from './resolution-session';
import {instantiateClass} from './resolver';
import {
  Constructor,
  isPromiseLike,
  BoundValue,
  ValueOrPromise,
} from './value-promise';
import {Provider} from './provider';

import * as debugModule from 'debug';
const debug = debugModule('loopback:context:binding');

/**
 * Scope for binding values
 */
export enum BindingScope {
  /**
   * The binding provides a value that is calculated each time. This will be
   * the default scope if not set.
   *
   * For example, with the following context hierarchy:
   *
   * - app (with a binding 'b1' that produces sequential values 0, 1, ...)
   *   - req1
   *   - req2
   *
   * // get('b1') produces a new value each time for app and its descendants
   * app.get('b1') ==> 0
   * req1.get('b1') ==> 1
   * req2.get('b1') ==> 2
   * req2.get('b1') ==> 3
   * app.get('b1') ==> 4
   */
  TRANSIENT = 'Transient',

  /**
   * The binding provides a value as a singleton within each local context. The
   * value is calculated only once per context and cached for subsequenicial
   * uses. Child contexts have their own value and do not share with their
   * ancestors.
   *
   * For example, with the following context hierarchy:
   *
   * - app (with a binding 'b1' that produces sequential values 0, 1, ...)
   *   - req1
   *   - req2
   *
   * // 0 is the singleton for app afterward
   * app.get('b1') ==> 0
   *
   * // 'b1' is found in app but not in req1, a new value 1 is calculated.
   * // 1 is the singleton for req1 afterward
   * req1.get('b1') ==> 1
   *
   * // 'b1' is found in app but not in req2, a new value 2 is calculated.
   * // 2 is the singleton for req2 afterward
   * req2.get('b1') ==> 2
   */
  CONTEXT = 'Context',

  /**
   * The binding provides a value as a singleton within the context hierarchy
   * (the owning context and its descendants). The value is calculated only
   * once for the owning context and cached for subsequenicial uses. Child
   * contexts share the same value as their ancestors.
   *
   * For example, with the following context hierarchy:
   *
   * - app (with a binding 'b1' that produces sequential values 0, 1, ...)
   *   - req1
   *   - req2
   *
   * // 0 is the singleton for app afterward
   * app.get('b1') ==> 0
   *
   * // 'b1' is found in app, reuse it
   * req1.get('b1') ==> 0
   *
   * // 'b1' is found in app, reuse it
   * req2.get('b1') ==> 0
   */
  SINGLETON = 'Singleton',
}

export enum BindingType {
  CONSTANT = 'Constant',
  DYNAMIC_VALUE = 'DynamicValue',
  CLASS = 'Class',
  PROVIDER = 'Provider',
}

// FIXME(bajtos) The binding class should be parameterized by the value
// type stored
export class Binding {
  static PROPERTY_SEPARATOR = '#';

  /**
   * Validate the binding key format. Please note that `#` is reserved.
   * @param key Binding key, such as `a, a.b, a:b, a/b
   */
  static validateKey(key: string) {
    if (!key) throw new Error('Binding key must be provided.');
    if (key.includes(Binding.PROPERTY_SEPARATOR)) {
      throw new Error(
        `Binding key ${key} cannot contain` +
          ` '${Binding.PROPERTY_SEPARATOR}'.`,
      );
    }
    return key;
  }

  /**
   * Build a binding key from a key and a path
   * @param key The key
   * @param path The path
   *
   */
  static buildKeyWithPath(key: string, path: string) {
    return `${key}${Binding.PROPERTY_SEPARATOR}${path}`;
  }

  /**
   * Parse a string containing both the binding key and the path to the deeply
   * nested property to retrieve.
   *
   * @param keyWithPath The key with an optional path,
   *  e.g. "application.instance" or "config#rest.port".
   */
  static parseKeyWithPath(keyWithPath: string) {
    const index = keyWithPath.indexOf(Binding.PROPERTY_SEPARATOR);
    if (index === -1) {
      return {key: keyWithPath, path: undefined};
    }

    return {
      key: keyWithPath.substr(0, index).trim(),
      path: keyWithPath.substr(index + 1),
    };
  }

  public readonly key: string;
  public readonly tags: Set<string> = new Set();
  public scope: BindingScope = BindingScope.TRANSIENT;
  public type: BindingType;

  private _cache: WeakMap<Context, BoundValue>;
  private _getValue: (
    ctx?: Context,
    session?: ResolutionSession,
  ) => ValueOrPromise<BoundValue>;

  // For bindings bound via toClass, this property contains the constructor
  // function
  public valueConstructor: Constructor<BoundValue>;

  constructor(key: string, public isLocked: boolean = false) {
    Binding.validateKey(key);
    this.key = key;
  }

  /**
   * Cache the resolved value by the binding scope
   * @param ctx The current context
   * @param result The calculated value for the binding
   */
  private _cacheValue(
    ctx: Context,
    result: ValueOrPromise<BoundValue>,
  ): ValueOrPromise<BoundValue> {
    // Initialize the cache as a weakmap keyed by context
    if (!this._cache) this._cache = new WeakMap<Context, BoundValue>();
    if (isPromiseLike(result)) {
      if (this.scope === BindingScope.SINGLETON) {
        // Cache the value at owning context level
        result = result.then(val => {
          this._cache.set(ctx.getOwnerContext(this.key)!, val);
          return val;
        });
      } else if (this.scope === BindingScope.CONTEXT) {
        // Cache the value at the current context
        result = result.then(val => {
          this._cache.set(ctx, val);
          return val;
        });
      }
    } else {
      if (this.scope === BindingScope.SINGLETON) {
        // Cache the value
        this._cache.set(ctx.getOwnerContext(this.key)!, result);
      } else if (this.scope === BindingScope.CONTEXT) {
        // Cache the value at the current context
        this._cache.set(ctx, result);
      }
    }
    return result;
  }

  /**
   * This is an internal function optimized for performance.
   * Users should use `@inject(key)` or `ctx.get(key)` instead.
   *
   * Get the value bound to this key. Depending on `isSync`, this
   * function returns either:
   *  - the bound value
   *  - a promise of the bound value
   *
   * Consumers wishing to consume sync values directly should use `isPromise`
   * to check the type of the returned value to decide how to handle it.
   *
   * ```
   * const result = binding.getValue(ctx);
   * if (isPromise(result)) {
   *   result.then(doSomething)
   * } else {
   *   doSomething(result);
   * }
   * ```
   *
   * @param ctx Context for the resolution
   * @param session Optional session for binding and dependency resolution
   */
  getValue(
    ctx: Context,
    session?: ResolutionSession,
  ): ValueOrPromise<BoundValue> {
    /* istanbul ignore if */
    if (debug.enabled) {
      debug('Get value for binding %s', this.key);
    }
    // First check cached value for non-transient
    if (this._cache) {
      if (this.scope === BindingScope.SINGLETON) {
        const ownerCtx = ctx.getOwnerContext(this.key);
        if (ownerCtx && this._cache.has(ownerCtx)) {
          return this._cache.get(ownerCtx);
        }
      } else if (this.scope === BindingScope.CONTEXT) {
        if (this._cache.has(ctx)) {
          return this._cache.get(ctx);
        }
      }
    }
    if (this._getValue) {
      let result = ResolutionSession.runWithBinding(
        s => this._getValue(ctx, s),
        this,
        session,
      );
      return this._cacheValue(ctx, result);
    }
    return Promise.reject(
      new Error(`No value was configured for binding ${this.key}.`),
    );
  }

  lock(): this {
    this.isLocked = true;
    return this;
  }

  tag(tagName: string | string[]): this {
    if (typeof tagName === 'string') {
      this.tags.add(tagName);
    } else {
      tagName.forEach(t => {
        this.tags.add(t);
      });
    }
    return this;
  }

  inScope(scope: BindingScope): this {
    this.scope = scope;
    return this;
  }

  /**
   * Bind the key to a constant value. The value must be already available
   * at binding time, it is not allowed to pass a Promise instance.
   *
   * @param value The bound value.
   *
   * @example
   *
   * ```ts
   * ctx.bind('appName').to('CodeHub');
   * ```
   */
  to(value: BoundValue): this {
    if (isPromiseLike(value)) {
      // Promises are a construct primarily intended for flow control:
      // In an algorithm with steps 1 and 2, we want to wait for the outcome
      // of step 1 before starting step 2.
      //
      // Promises are NOT a tool for storing values that may become available
      // in the future, depending on the success or a failure of a background
      // async task.
      //
      // Values stored in bindings are typically accessed only later,
      // in a different turn of the event loop or the Promise micro-queue.
      // As a result, when a promise is stored via `.to()` and is rejected
      // later, then more likely than not, there will be no error (catch)
      // handler registered yet, and Node.js will print
      // "Unhandled Rejection Warning".
      throw new Error(
        'Promise instances are not allowed for constant values ' +
          'bound via ".to()". Register an async getter function ' +
          'via ".toDynamicValue()" instead.',
      );
    }
    /* istanbul ignore if */
    if (debug.enabled) {
      debug('Bind %s to constant:', this.key, value);
    }
    this.type = BindingType.CONSTANT;
    this._getValue = () => value;
    return this;
  }

  /**
   * Bind the key to a computed (dynamic) value.
   *
   * @param factoryFn The factory function creating the value.
   *   Both sync and async functions are supported.
   *
   * @example
   *
   * ```ts
   * // synchronous
   * ctx.bind('now').toDynamicValue(() => Date.now());
   *
   * // asynchronous
   * ctx.bind('something').toDynamicValue(
   *  async () => Promise.delay(10).then(doSomething)
   * );
   * ```
   */
  toDynamicValue(factoryFn: () => ValueOrPromise<BoundValue>): this {
    /* istanbul ignore if */
    if (debug.enabled) {
      debug('Bind %s to dynamic value:', this.key, factoryFn);
    }
    this.type = BindingType.DYNAMIC_VALUE;
    this._getValue = ctx => factoryFn();
    return this;
  }

  /**
   * Bind the key to a value computed by a Provider.
   *
   * * @example
   *
   * ```ts
   * export class DateProvider implements Provider<Date> {
   *   constructor(@inject('stringDate') private param: String){}
   *   value(): Date {
   *     return new Date(param);
   *   }
   * }
   * ```
   *
   * @param provider The value provider to use.
   */
  public toProvider<T>(providerClass: Constructor<Provider<T>>): this {
    /* istanbul ignore if */
    if (debug.enabled) {
      debug('Bind %s to provider %s', this.key, providerClass.name);
    }
    this.type = BindingType.PROVIDER;
    this._getValue = (ctx, session) => {
      const providerOrPromise = instantiateClass<Provider<T>>(
        providerClass,
        ctx!,
        session,
      );
      if (isPromiseLike(providerOrPromise)) {
        return providerOrPromise.then(p => p.value());
      } else {
        return providerOrPromise.value();
      }
    };
    return this;
  }

  /**
   * Bind the key to an instance of the given class.
   *
   * @param ctor The class constructor to call. Any constructor
   *   arguments must be annotated with `@inject` so that
   *   we can resolve them from the context.
   */
  toClass<T>(ctor: Constructor<T>): this {
    /* istanbul ignore if */
    if (debug.enabled) {
      debug('Bind %s to class %s', this.key, ctor.name);
    }
    this.type = BindingType.CLASS;
    this._getValue = (ctx, session) => instantiateClass(ctor, ctx!, session);
    this.valueConstructor = ctor;
    return this;
  }

  unlock(): this {
    this.isLocked = false;
    return this;
  }

  toJSON(): Object {
    // tslint:disable-next-line:no-any
    const json: {[name: string]: any} = {
      key: this.key,
      scope: this.scope,
      tags: Array.from(this.tags),
      isLocked: this.isLocked,
    };
    if (this.type != null) {
      json.type = this.type;
    }
    return json;
  }
}
