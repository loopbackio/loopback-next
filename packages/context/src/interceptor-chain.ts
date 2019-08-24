// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as debugFactory from 'debug';
import {BindingFilter} from './binding-filter';
import {BindingAddress} from './binding-key';
import {BindingComparator} from './binding-sorter';
import {Context} from './context';
import {InvocationResult} from './invocation';
import {transformValueOrPromise, ValueOrPromise} from './value-promise';
const debug = debugFactory('loopback:context:interceptor-chain');

/**
 * The `next` function that can be used to invoke next generic interceptor in
 * the chain
 */
export type Next = () => ValueOrPromise<InvocationResult>;

/**
 * An interceptor function to be invoked in a chain for the given context.
 * It serves as the base interface for various types of interceptors, such
 * as method invocation interceptor or request/response processing interceptor.
 *
 * @typeParam C - `Context` class or a subclass of `Context`
 * @param context - Context object
 * @param next - A function to proceed with downstream interceptors or the
 * target operation
 *
 * @returns The invocation result as a value (sync) or promise (async)
 */
export type GenericInterceptor<C extends Context = Context> = (
  context: C,
  next: Next,
) => ValueOrPromise<InvocationResult>;

/**
 * Interceptor function or a binding key that resolves a generic interceptor
 * function
 * @typeParam C - `Context` class or a subclass of `Context`
 * @typeParam T - Return type of `next()`
 */
export type GenericInterceptorOrKey<C extends Context = Context> =
  | BindingAddress<GenericInterceptor<C>>
  | GenericInterceptor<C>;

/**
 * Invocation state of an interceptor chain
 */
class InterceptorChainState<C extends Context = Context> {
  private _index = 0;
  /**
   * Create a state for the interceptor chain
   * @param interceptors - Interceptor functions or binding keys
   */
  constructor(private interceptors: GenericInterceptorOrKey<C>[]) {}

  /**
   * Get the index for the current interceptor
   */
  get index() {
    return this._index;
  }

  /**
   * Check if the chain is done - all interceptors are invoked
   */
  done() {
    return this._index === this.interceptors.length;
  }

  /**
   * Get the next interceptor to be invoked
   */
  next() {
    if (this.done()) {
      throw new Error('No more interceptor is in the chain');
    }
    return this.interceptors[this._index++];
  }
}

/**
 * A chain of generic interceptors to be invoked for the given context
 *
 * @typeParam C - `Context` class or a subclass of `Context`
 */
export class GenericInterceptorChain<C extends Context = Context> {
  /**
   * A getter for an array of interceptor functions or binding keys
   */
  protected getInterceptors: () => GenericInterceptorOrKey<C>[];

  /**
   * Create an invocation chain with a list of interceptor functions or
   * binding keys
   * @param context - Context object
   * @param interceptors - An array of interceptor functions or binding keys
   */
  constructor(context: C, interceptors: GenericInterceptorOrKey<C>[]);

  /**
   * Create an invocation interceptor chain with a binding filter and comparator.
   * The interceptors are discovered from the context using the binding filter and
   * sorted by the comparator (if provided).
   *
   * @param context - Context object
   * @param filter - A binding filter function to select interceptors
   * @param comparator - An optional comparator to sort matched interceptor bindings
   */
  constructor(
    context: C,
    filter: BindingFilter,
    comparator?: BindingComparator,
  );

  // Implementation
  constructor(
    private context: C,
    interceptors: GenericInterceptorOrKey<C>[] | BindingFilter,
    comparator?: BindingComparator,
  ) {
    if (typeof interceptors === 'function') {
      const interceptorsView = context.createView(interceptors, comparator);
      this.getInterceptors = () => {
        const bindings = interceptorsView.bindings;
        if (comparator) {
          bindings.sort(comparator);
        }
        return bindings.map(b => b.key);
      };
    } else if (Array.isArray(interceptors)) {
      this.getInterceptors = () => interceptors;
    }
  }

  /**
   * Invoke the interceptor chain
   */
  invokeInterceptors(): ValueOrPromise<InvocationResult> {
    // Create a state for each invocation to provide isolation
    const state = new InterceptorChainState<C>(this.getInterceptors());
    return this.next(state);
  }

  /**
   * Invoke downstream interceptors or the target method
   */
  private next(
    state: InterceptorChainState<C>,
  ): ValueOrPromise<InvocationResult> {
    if (state.done()) {
      // No more interceptors
      return undefined;
    }
    // Invoke the next interceptor in the chain
    return this.invokeNextInterceptor(state);
  }

  /**
   * Invoke downstream interceptors
   */
  private invokeNextInterceptor(
    state: InterceptorChainState<C>,
  ): ValueOrPromise<InvocationResult> {
    const index = state.index;
    const interceptor = state.next();
    const interceptorFn = this.loadInterceptor(interceptor);
    return transformValueOrPromise(interceptorFn, fn => {
      /* istanbul ignore if */
      if (debug.enabled) {
        debug('Invoking interceptor %d (%s) on %s', index, fn.name);
      }
      return fn(this.context, () => this.next(state));
    });
  }

  /**
   * Return the interceptor function or resolve the interceptor function as a binding
   * from the context
   *
   * @param interceptor - Interceptor function or binding key
   */
  private loadInterceptor(interceptor: GenericInterceptorOrKey<C>) {
    if (typeof interceptor === 'function') return interceptor;
    debug('Resolving interceptor binding %s', interceptor);
    return this.context.getValueOrPromise(interceptor) as ValueOrPromise<
      GenericInterceptor<C>
    >;
  }
}

/**
 * Invoke a chain of interceptors with the context
 * @param context - Context object
 * @param interceptors - An array of interceptor functions or binding keys
 */
export function invokeInterceptors<
  C extends Context = Context,
  T = InvocationResult
>(
  context: C,
  interceptors: GenericInterceptorOrKey<C>[],
): ValueOrPromise<T | undefined> {
  const chain = new GenericInterceptorChain(context, interceptors);
  return chain.invokeInterceptors();
}
