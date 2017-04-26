// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context} from './context';
import {Constructor, instantiateClass} from './resolver';

// tslint:disable-next-line:no-any
export type BoundValue = any;

// FIXME(bajtos) The binding class should be parameterized by the value type stored
export class Binding {
  private _tagName: string;

  // For bindings bound via toClass, this property contains the constructor function
  public valueConstructor: Constructor<BoundValue>;

  constructor(private readonly _context: Context, private readonly _key: string, public isLocked: boolean = false) {}
  get key() { return this._key; }
  get tagName() { return this._tagName; }

  /**
   * This is an internal function optimized for performance.
   * Users should use `@inject(key)` or `ctx.get(key)` instead.
   *
   * Get the value bound to this key. Depending on `isSync`, this function returns either:
   *  - the bound value
   *  - a promise of the bound value
   *
   * Consumers wishing to consume sync values directly should use `isPromise`
   * to check the type of the returned value to decide how to handle it.
   *
   * ```
   * const result = binding.getValue();
   * if (isPromise(result)) {
   *   result.then(doSomething)
   * } else {
   *   doSomething(result);
   * }
   * ```
   */
  getValue(): BoundValue | Promise<BoundValue> {
    return Promise.reject(new Error(`No value was configured for binding ${this._key}.`));
  }

  lock() {
    this.isLocked = true;
  }

  tag(tagName: string): this {
    this._tagName = tagName;
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
    this.getValue = factoryFn;
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
    this.getValue = () => instantiateClass(ctor, this._context);
    this.valueConstructor = ctor;
    return this;
  }

  unlock() {
    this.isLocked = false;
  }
}
