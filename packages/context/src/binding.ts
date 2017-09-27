// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context} from './context';
import {Constructor, instantiateClass} from './resolver';
import {isPromise} from './is-promise';
import {Provider} from './provider';

// tslint:disable-next-line:no-any
export type BoundValue = any;

export type ValueOrPromise<T> = T | Promise<T>;

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

  private _cache: BoundValue;
  private _getValue: (ctx?: Context) => BoundValue | Promise<BoundValue>;

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
    result: BoundValue | Promise<BoundValue>,
  ): BoundValue | Promise<BoundValue> {
    if (isPromise(result)) {
      if (this.scope === BindingScope.SINGLETON) {
        // Cache the value
        result = result.then(val => {
          this._cache = val;
          return val;
        });
      } else if (this.scope === BindingScope.CONTEXT) {
        // Cache the value
        result = result.then(val => {
          if (ctx.contains(this.key)) {
            // The ctx owns the binding
            this._cache = val;
          } else {
            // Create a binding of the cached value for the current context
            ctx.bind(this.key).to(val);
          }
          return val;
        });
      }
    } else {
      if (this.scope === BindingScope.SINGLETON) {
        // Cache the value
        this._cache = result;
      } else if (this.scope === BindingScope.CONTEXT) {
        if (ctx.contains(this.key)) {
          // The ctx owns the binding
          this._cache = result;
        } else {
          // Create a binding of the cached value for the current context
          ctx.bind(this.key).to(result);
        }
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
   */
  getValue(ctx: Context): BoundValue | Promise<BoundValue> {
    // First check cached value for non-transient
    if (this._cache !== undefined) {
      if (this.scope === BindingScope.SINGLETON) {
        return this._cache;
      } else if (this.scope === BindingScope.CONTEXT) {
        if (ctx.contains(this.key)) {
          return this._cache;
        }
      }
    }
    if (this._getValue) {
      const result = this._getValue(ctx);
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
   * Bind the key to a constant value.
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
  toDynamicValue(factoryFn: () => BoundValue | Promise<BoundValue>): this {
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
    this.type = BindingType.PROVIDER;
    this._getValue = ctx => {
      const providerOrPromise = instantiateClass<Provider<T>>(
        providerClass,
        ctx!,
      );
      if (isPromise(providerOrPromise)) {
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
    this.type = BindingType.CLASS;
    this._getValue = ctx => instantiateClass(ctor, ctx!);
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
