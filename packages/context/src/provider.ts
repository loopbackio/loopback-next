// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context} from './context';
import {BoundValue, ValueOrPromise} from './binding';
import {Constructor, instantiateClass} from './resolver';

/**
 * Provider of a value
 */
export interface Provider<T> {
  value(ctx?: Context): ValueOrPromise<T>;
}

/**
 * BindingProvider provisions injecting a value into the binding asynchronously
 * @example:
 * ```ts
 * ctx.bind('provider_key').toProvider(MyProvider);
 * ```
 */
export abstract class BindingProvider<T> implements Provider<T> {
  /**
   * binding source which provides the value
   */
  abstract source(): T;
  /**
   * target value to return
   * @param ctx - context object
   */
  abstract value(ctx: Context): ValueOrPromise<BoundValue>;
}

/**
 * ValueProvider to provide the source of a value
 * @example:
 * ```ts
 * export class MyProvider extends ValueProvider {
 *   constructor(@inject('value') param){}
 *   source<string>(): string {
 *     return computed_value;
 *   }
 * }
 * ```
 */
export abstract class ValueProvider implements BindingProvider<ValueOrPromise<BoundValue>> {
  /**
   * return a value
   */
  abstract source(): ValueOrPromise<BoundValue>;
  value(ctx: Context): ValueOrPromise<BoundValue> {
    return this.source();
  }
}

/**
 * FunctionProvider to provide the function source of a value
 * @example:
 * ```ts
 * export class MyProvider extends FunctionProvider {
 *   constructor(@inject('value') param){}
 *   source<() => string>(): () => string {
 *     if (param)
 *        return function1
 *     else
 *        return function2;
 *   }
 * }
 * ```
 */
export abstract class FunctionProvider implements BindingProvider<(ctx: Context) => ValueOrPromise<BoundValue>> {
  /**
   * return a function to get dynamic value
   */
  abstract source(): (ctx: Context) => ValueOrPromise<BoundValue>;

  value(ctx: Context): ValueOrPromise<BoundValue> {
    return this.executeFunction(ctx);
  }
  /**
   * get dynamic value from a factory function
   */
  async executeFunction(ctx: Context): Promise<BoundValue> {
    const factoryFn = this.source();
    return factoryFn(ctx);
  }
}

/**
 * ConstructorProvider to provide the constructor source of an object instance
 * @example:
 * ```ts
 * export class MyProvider extends ConstructorProvider {
 *   constructor(@inject('value') param){}
 *   source<T>(): Constructor<T> {
 *     return class1;
 *   }
 * }
 * ```
 */
export abstract class ConstructorProvider<T> implements BindingProvider<Constructor<T>> {
  /**
   * return a constructor
   */
  abstract source(): Constructor<T>;

  value(ctx: Context): ValueOrPromise<BoundValue> {
    return this.getInstanceFromConstructor(ctx);
  }
  /**
   * get an instance from a constructor
   */
  getInstanceFromConstructor<T>(ctx: Context): ValueOrPromise<BoundValue> {
    const ctor = this.source();
    return instantiateClass(ctor, ctx);
  }
}
