// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context} from './context';
import {invokeMethodWithInterceptors} from './interceptor';
import {InvocationArgs} from './invocation';
import {ValueOrPromise} from './value-promise';

/**
 * Create the Promise type for `T`. If `T` extends `Promise`, the type is `T`,
 * otherwise the type is `ValueOrPromise<T>`.
 */
export type AsValueOrPromise<T> = T extends Promise<unknown>
  ? T
  : ValueOrPromise<T>;

/**
 * The intercepted variant of a function to return `ValueOrPromise<T>`.
 * If `T` is not a function, the type is `T`.
 */
export type AsInterceptedFunction<T> = T extends (
  ...args: InvocationArgs
) => infer R
  ? (...args: InvocationArgs) => AsValueOrPromise<R>
  : T;

/**
 * The proxy type for `T`. The return type for any method of `T` with original
 * return type `R` becomes `ValueOrPromise<R>` if `R` does not extend `Promise`.
 * Property types stay untouched.
 *
 * @example
 * ```ts
 * class MyController {
 *   name: string;
 *
 *   greet(name: string): string {
 *     return `Hello, ${name}`;
 *   }
 *
 *   async hello(name: string) {
 *     return `Hello, ${name}`;
 *   }
 * }
 * ```
 *
 * `AsyncProxy<MyController>` will be:
 * ```ts
 * {
 *   name: string; // the same as MyController
 *   greet(name: string): ValueOrPromise<string>; // the return type becomes `ValueOrPromise<string>`
 *   hello(name: string): Promise<string>; // the same as MyController
 * }
 * ```
 */
export type AsyncProxy<T> = {[P in keyof T]: AsInterceptedFunction<T[P]>};

/**
 * A proxy handler that applies interceptors
 *
 * See https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Proxy
 */
export class InterceptionHandler<T extends object> implements ProxyHandler<T> {
  constructor(private context = new Context()) {}

  get(target: T, propertyName: PropertyKey, receiver: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const targetObj = target as any;
    if (typeof propertyName !== 'string') return targetObj[propertyName];
    const propertyOrMethod = targetObj[propertyName];
    if (typeof propertyOrMethod === 'function') {
      return (...args: InvocationArgs) => {
        return invokeMethodWithInterceptors(
          this.context,
          target,
          propertyName,
          args,
        );
      };
    } else {
      return propertyOrMethod;
    }
  }
}

/**
 * Create a proxy that applies interceptors for method invocations
 * @param target - Target class or object
 * @param context - Context object
 */
export function createProxyWithInterceptors<T extends object>(
  target: T,
  context?: Context,
): AsyncProxy<T> {
  return new Proxy(target, new InterceptionHandler(context)) as AsyncProxy<T>;
}
