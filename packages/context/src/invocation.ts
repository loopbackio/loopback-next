// Copyright IBM Corp. and LoopBack contributors 2019,2020. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {DecoratorFactory} from '@loopback/metadata';
import assert from 'assert';
import debugFactory from 'debug';
import {Context} from './context';
import {invokeMethodWithInterceptors} from './interceptor';
import {ResolutionSession} from './resolution-session';
import {resolveInjectedArguments} from './resolver';
import {transformValueOrPromise, ValueOrPromise} from './value-promise';

const debug = debugFactory('loopback:context:invocation');
const getTargetName = DecoratorFactory.getTargetName;

/**
 * Return value for a method invocation
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type InvocationResult = any;

/**
 * Array of arguments for a method invocation
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type InvocationArgs = any[];

/**
 * An interface to represent the caller of the invocation
 */
export interface InvocationSource<T = unknown> {
  /**
   * Type of the invoker, such as `proxy` and `route`
   */
  readonly type: string;
  /**
   * Metadata for the source, such as `ResolutionSession`
   */
  readonly value: T;
}

/**
 * InvocationContext represents the context to invoke interceptors for a method.
 * The context can be used to access metadata about the invocation as well as
 * other dependencies.
 */
export class InvocationContext extends Context {
  /**
   * Construct a new instance of `InvocationContext`
   * @param parent - Parent context, such as the RequestContext
   * @param target - Target class (for static methods) or prototype/object
   * (for instance methods)
   * @param methodName - Method name
   * @param args - An array of arguments
   */
  constructor(
    parent: Context,
    public readonly target: object,
    public readonly methodName: string,
    public readonly args: InvocationArgs,
    public readonly source?: InvocationSource,
  ) {
    super(parent);
  }

  /**
   * The target class, such as `OrderController`
   */
  get targetClass() {
    return typeof this.target === 'function'
      ? this.target
      : this.target.constructor;
  }

  /**
   * The target name, such as `OrderController.prototype.cancelOrder`
   */
  get targetName() {
    return getTargetName(this.target, this.methodName);
  }

  /**
   * Description of the invocation
   */
  get description() {
    const source = this.source == null ? '' : `${this.source} => `;
    return `InvocationContext(${this.name}): ${source}${this.targetName}`;
  }

  toString() {
    return this.description;
  }

  /**
   * Assert the method exists on the target. An error will be thrown if otherwise.
   * @param context - Invocation context
   */
  assertMethodExists() {
    const targetWithMethods = this.target as Record<string, Function>;
    if (typeof targetWithMethods[this.methodName] !== 'function') {
      const targetName = getTargetName(this.target, this.methodName);
      assert(false, `Method ${targetName} not found`);
    }
    return targetWithMethods;
  }

  /**
   * Invoke the target method with the given context
   * @param context - Invocation context
   * @param options - Options for the invocation
   */
  invokeTargetMethod(
    options: InvocationOptions = {skipParameterInjection: true},
  ) {
    const targetWithMethods = this.assertMethodExists();
    if (!options.skipParameterInjection) {
      return invokeTargetMethodWithInjection(
        this,
        targetWithMethods,
        this.methodName,
        this.args,
        options.session,
      );
    }
    return invokeTargetMethod(
      this,
      targetWithMethods,
      this.methodName,
      this.args,
    );
  }
}

/**
 * Options to control invocations
 */
export type InvocationOptions = {
  /**
   * Skip dependency injection on method parameters
   */
  skipParameterInjection?: boolean;
  /**
   * Skip invocation of interceptors
   */
  skipInterceptors?: boolean;
  /**
   * Information about the source object that makes the invocation. For REST,
   * it's a `Route`. For injected proxies, it's a `Binding`.
   */
  source?: InvocationSource;
  /**
   * Resolution session
   */
  session?: ResolutionSession;
};

/**
 * Invoke a method using dependency injection. Interceptors are invoked as part
 * of the invocation.
 * @param target - Target of the method, it will be the class for a static
 * method, and instance or class prototype for a prototype method
 * @param method - Name of the method
 * @param ctx - Context object
 * @param nonInjectedArgs - Optional array of args for non-injected parameters
 * @param options - Options for the invocation
 */
export function invokeMethod(
  target: object,
  method: string,
  ctx: Context,
  nonInjectedArgs: InvocationArgs = [],
  options: InvocationOptions = {},
): ValueOrPromise<InvocationResult> {
  if (options.skipInterceptors) {
    if (options.skipParameterInjection) {
      // Invoke the target method directly without injection or interception
      return invokeTargetMethod(ctx, target, method, nonInjectedArgs);
    } else {
      return invokeTargetMethodWithInjection(
        ctx,
        target,
        method,
        nonInjectedArgs,
        options.session,
      );
    }
  }
  // Invoke the target method with interception but no injection
  return invokeMethodWithInterceptors(
    ctx,
    target,
    method,
    nonInjectedArgs,
    options,
  );
}

/**
 * Invoke a method. Method parameter dependency injection is honored.
 * @param target - Target of the method, it will be the class for a static
 * method, and instance or class prototype for a prototype method
 * @param method - Name of the method
 * @param ctx - Context
 * @param nonInjectedArgs - Optional array of args for non-injected parameters
 */
function invokeTargetMethodWithInjection(
  ctx: Context,
  target: object,
  method: string,
  nonInjectedArgs?: InvocationArgs,
  session?: ResolutionSession,
): ValueOrPromise<InvocationResult> {
  const methodName = getTargetName(target, method);
  /* istanbul ignore if */
  if (debug.enabled) {
    debug('Invoking method %s', methodName);
    if (nonInjectedArgs?.length) {
      debug('Non-injected arguments:', nonInjectedArgs);
    }
  }
  const argsOrPromise = resolveInjectedArguments(
    target,
    method,
    ctx,
    session,
    nonInjectedArgs,
  );
  const targetWithMethods = target as Record<string, Function>;
  assert(
    typeof targetWithMethods[method] === 'function',
    `Method ${method} not found`,
  );
  return transformValueOrPromise(argsOrPromise, args => {
    /* istanbul ignore if */
    if (debug.enabled) {
      debug('Injected arguments for %s:', methodName, args);
    }
    return invokeTargetMethod(ctx, targetWithMethods, method, args);
  });
}

/**
 * Invoke the target method
 * @param ctx - Context object
 * @param target - Target class or object
 * @param methodName - Target method name
 * @param args - Arguments
 */
function invokeTargetMethod(
  ctx: Context, // Not used
  target: object,
  methodName: string,
  args: InvocationArgs,
): InvocationResult {
  const targetWithMethods = target as Record<string, Function>;
  /* istanbul ignore if */
  if (debug.enabled) {
    debug('Invoking method %s', getTargetName(target, methodName), args);
  }
  // Invoke the target method
  const result = targetWithMethods[methodName](...args);
  /* istanbul ignore if */
  if (debug.enabled) {
    debug('Method invoked: %s', getTargetName(target, methodName), result);
  }
  return result;
}
