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
    if (key.indexOf(Binding.PROPERTY_SEPARATOR) !== -1) {
      throw new Error(`Binding key ${key} cannot contain`
        + ` '${Binding.PROPERTY_SEPARATOR}'.`);
    }
    return key;
  }

  /**
   * Remove the segament that denotes a property path
   * @param key Binding key, such as `a, a.b, a:b, a/b, a.b#x, a:b#x.y, a/b#x.y`
   */
  static normalizeKey(key: string) {
    const index = key.indexOf(Binding.PROPERTY_SEPARATOR);
    if (index !== -1) key = key.substr(0, index);
    key = key.trim();
    return key;
  }

  /**
   * Get the property path separated by `#`
   * @param key Binding key
   */
  static getKeyPath(key: string) {
    const index = key.indexOf(Binding.PROPERTY_SEPARATOR);
    if (index !== -1) return key.substr(index + 1);
    return undefined;
  }

  private readonly _key: string;
  private _tags: Set<string> = new Set();

  // For bindings bound via toClass, this property contains the constructor
  // function
  public valueConstructor: Constructor<BoundValue>;

  constructor(_key: string, public isLocked: boolean = false) {
    Binding.validateKey(_key);
    this._key = _key;
  }

  get key() {
    return this._key;
  }

  get tags() {
    return this._tags;
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
    return Promise.reject(
      new Error(`No value was configured for binding ${this._key}.`),
    );
  }

  lock(): this {
    this.isLocked = true;
    return this;
  }

  tag(tagName: string | string[]): this {
    if (typeof tagName === 'string') {
      this._tags.add(tagName);
    } else {
      tagName.forEach(t => {
        this._tags.add(t);
      });
    }
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
    this.getValue = () => value;
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
    // TODO(bajtos) allow factoryFn with @inject arguments
    this.getValue = ctx => factoryFn();
    return this;
  }

  /**
   * Bind the key to a BindingProvider
   */
  public toProvider<T>(providerClass: Constructor<Provider<T>>): this {
    this.getValue = ctx => {
      const providerOrPromise = instantiateClass<Provider<T>>(
        providerClass,
        ctx,
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
    this.getValue = context => instantiateClass(ctor, context);
    this.valueConstructor = ctor;
    return this;
  }

  unlock(): this {
    this.isLocked = false;
    return this;
  }
}
