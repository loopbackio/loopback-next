// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  ClassDecoratorFactory,
  DecoratorFactory,
  MetadataAccessor,
  MetadataInspector,
  MetadataMap,
  MethodDecoratorFactory,
} from '@loopback/metadata';
import * as assert from 'assert';
import * as debugFactory from 'debug';
import {Binding, BindingTemplate} from './binding';
import {bind} from './binding-decorator';
import {filterByTag} from './binding-filter';
import {BindingSpec} from './binding-inspector';
import {BindingAddress} from './binding-key';
import {sortBindingsByPhase} from './binding-sorter';
import {Context} from './context';
import {
  ContextBindings,
  ContextTags,
  GLOBAL_INTERCEPTOR_NAMESPACE,
} from './keys';
import {
  transformValueOrPromise,
  tryWithFinally,
  ValueOrPromise,
} from './value-promise';
const debug = debugFactory('loopback:context:interceptor');
const getTargetName = DecoratorFactory.getTargetName;

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Array of arguments for a method invocation
 */
export type InvocationArgs = any[];

/**
 * Return value for a method invocation
 */
export type InvocationResult = any;

/**
 * A type for class or its prototype
 */
type ClassOrPrototype = any;

/* eslint-enable @typescript-eslint/no-explicit-any */

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
    // Make `parent` public so that the interceptor can add bindings to
    // the request context, for example, tracing id
    public readonly parent: Context,
    public readonly target: object,
    public readonly methodName: string,
    public readonly args: InvocationArgs,
  ) {
    super(parent);
  }

  /**
   * Discover all binding keys for global interceptors (tagged by
   * ContextTags.GLOBAL_INTERCEPTOR)
   */
  getGlobalInterceptorBindingKeys(): string[] {
    const bindings: Readonly<Binding<Interceptor>>[] = this.find(
      filterByTag(ContextTags.GLOBAL_INTERCEPTOR),
    );
    this.sortGlobalInterceptorBindings(bindings);
    return bindings.map(b => b.key);
  }

  /**
   * Sort global interceptor bindings by `globalInterceptorGroup` tags
   * @param bindings - An array of global interceptor bindings
   */
  private sortGlobalInterceptorBindings(
    bindings: Readonly<Binding<Interceptor>>[],
  ) {
    // Get predefined ordered groups for global interceptors
    const orderedGroups =
      this.getSync(ContextBindings.GLOBAL_INTERCEPTOR_ORDERED_GROUPS, {
        optional: true,
      }) || [];
    return sortBindingsByPhase(
      bindings,
      ContextTags.GLOBAL_INTERCEPTOR_GROUP,
      orderedGroups,
    );
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
    return DecoratorFactory.getTargetName(this.target, this.methodName);
  }

  /**
   * Description of the invocation
   */
  get description() {
    return `InvocationContext(${this.name}): ${this.targetName}`;
  }

  toString() {
    return this.description;
  }

  /**
   * Load all interceptors for the given invocation context. It adds
   * interceptors from possibly three sources:
   * 1. method level `@intercept`
   * 2. class level `@intercept`
   * 3. global interceptors discovered in the context
   */
  loadInterceptors() {
    let interceptors =
      MetadataInspector.getMethodMetadata(
        INTERCEPT_METHOD_KEY,
        this.target,
        this.methodName,
      ) || [];
    const targetClass =
      typeof this.target === 'function' ? this.target : this.target.constructor;
    const classInterceptors =
      MetadataInspector.getClassMetadata(INTERCEPT_CLASS_KEY, targetClass) ||
      [];
    // Inserting class level interceptors before method level ones
    interceptors = mergeInterceptors(classInterceptors, interceptors);
    const globalInterceptors = this.getGlobalInterceptorBindingKeys();
    // Inserting global interceptors
    interceptors = mergeInterceptors(globalInterceptors, interceptors);
    return interceptors;
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
   */
  invokeTargetMethod() {
    const targetWithMethods = this.assertMethodExists();
    /* istanbul ignore if */
    if (debug.enabled) {
      debug(
        'Invoking method %s',
        getTargetName(this.target, this.methodName),
        this.args,
      );
    }
    // Invoke the target method
    const result = targetWithMethods[this.methodName](...this.args);
    /* istanbul ignore if */
    if (debug.enabled) {
      debug(
        'Method invoked: %s',
        getTargetName(this.target, this.methodName),
        result,
      );
    }
    return result;
  }
}

/**
 * The `BindingTemplate` function to configure a binding as a global interceptor
 * by tagging it with `ContextTags.INTERCEPTOR`
 * @param group - Group for ordering the interceptor
 */
export function asGlobalInterceptor(group?: string): BindingTemplate {
  return binding => {
    binding
      // Tagging with `GLOBAL_INTERCEPTOR` is required.
      .tag(ContextTags.GLOBAL_INTERCEPTOR)
      // `GLOBAL_INTERCEPTOR_NAMESPACE` is to make the binding key more readable.
      .tag({[ContextTags.NAMESPACE]: GLOBAL_INTERCEPTOR_NAMESPACE});
    if (group) binding.tag({[ContextTags.GLOBAL_INTERCEPTOR_GROUP]: group});
  };
}

/**
 * `@globalInterceptor` decorator to mark the class as a global interceptor
 * @param group - Group for ordering the interceptor
 * @param specs - Extra binding specs
 */
export function globalInterceptor(group?: string, ...specs: BindingSpec[]) {
  return bind(asGlobalInterceptor(group), ...specs);
}

/**
 * Interceptor function to intercept method invocations
 */
export interface Interceptor {
  /**
   * @param context - Invocation context
   * @param next - A function to invoke next interceptor or the target method
   * @returns A result as value or promise
   */
  (
    context: InvocationContext,
    next: () => ValueOrPromise<InvocationResult>,
  ): ValueOrPromise<InvocationResult>;
}

/**
 * Interceptor function or binding key that can be used as parameters for
 * `@intercept()`
 */
export type InterceptorOrKey = BindingAddress<Interceptor> | Interceptor;

/**
 * Metadata key for method-level interceptors
 */
export const INTERCEPT_METHOD_KEY = MetadataAccessor.create<
  InterceptorOrKey[],
  MethodDecorator
>('intercept:method');

/**
 * Adding interceptors from the spec to the front of existing ones. Duplicate
 * entries are eliminated from the spec side.
 *
 * For example:
 *
 * - [log] + [cache, log] => [cache, log]
 * - [log] + [log, cache] => [log, cache]
 * - [] + [cache, log] => [cache, log]
 * - [cache, log] + [] => [cache, log]
 * - [log] + [cache] => [log, cache]
 *
 * @param interceptorsFromSpec - Interceptors from `@intercept`
 * @param existingInterceptors - Interceptors already applied for the method
 */
export function mergeInterceptors(
  interceptorsFromSpec: InterceptorOrKey[],
  existingInterceptors: InterceptorOrKey[],
) {
  const interceptorsToApply = new Set(interceptorsFromSpec);
  const appliedInterceptors = new Set(existingInterceptors);
  // Remove interceptors that already exist
  for (const i of interceptorsToApply) {
    if (appliedInterceptors.has(i)) {
      interceptorsToApply.delete(i);
    }
  }
  // Add existing interceptors after ones from the spec
  for (const i of appliedInterceptors) {
    interceptorsToApply.add(i);
  }
  return Array.from(interceptorsToApply);
}

/**
 * Metadata key for method-level interceptors
 */
export const INTERCEPT_CLASS_KEY = MetadataAccessor.create<
  InterceptorOrKey[],
  ClassDecorator
>('intercept:class');

/**
 * A factory to define `@intercept` for classes. It allows `@intercept` to be
 * used multiple times on the same class.
 */
class InterceptClassDecoratorFactory extends ClassDecoratorFactory<
  InterceptorOrKey[]
> {
  protected mergeWithOwn(ownMetadata: InterceptorOrKey[], target: Object) {
    ownMetadata = ownMetadata || [];
    return mergeInterceptors(this.spec, ownMetadata);
  }
}

/**
 * A factory to define `@intercept` for methods. It allows `@intercept` to be
 * used multiple times on the same method.
 */
class InterceptMethodDecoratorFactory extends MethodDecoratorFactory<
  InterceptorOrKey[]
> {
  protected mergeWithOwn(
    ownMetadata: MetadataMap<InterceptorOrKey[]>,
    target: Object,
    methodName: string,
    methodDescriptor: TypedPropertyDescriptor<unknown>,
  ) {
    ownMetadata = ownMetadata || {};
    const interceptors = ownMetadata[methodName] || [];

    // Adding interceptors to the list
    ownMetadata[methodName] = mergeInterceptors(this.spec, interceptors);

    return ownMetadata;
  }
}

/**
 * Decorator function `@intercept` for classes/methods to apply interceptors. It
 * can be applied on a class and its public methods. Multiple occurrences of
 * `@intercept` are allowed on the same target class or method. The decorator
 * takes a list of `interceptor` functions or binding keys.
 *
 * @example
 * ```ts
 * @intercept(log, metrics)
 * class MyController {
 *   @intercept('caching-interceptor')
 *   @intercept('name-validation-interceptor')
 *   greet(name: string) {
 *     return `Hello, ${name}`;
 *   }
 * }
 * ```
 *
 * @param interceptorOrKeys - One or more interceptors or binding keys that are
 * resolved to be interceptors
 */
export function intercept(...interceptorOrKeys: InterceptorOrKey[]) {
  return function interceptDecoratorForClassOrMethod(
    target: ClassOrPrototype,
    method?: string,
    // Use `any` to for `TypedPropertyDescriptor`
    // See https://github.com/strongloop/loopback-next/pull/2704
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    methodDescriptor?: TypedPropertyDescriptor<any>,
  ) {
    if (method && methodDescriptor) {
      // Method
      return InterceptMethodDecoratorFactory.createDecorator(
        INTERCEPT_METHOD_KEY,
        interceptorOrKeys,
      )(target, method, methodDescriptor!);
    }
    if (typeof target === 'function' && !method && !methodDescriptor) {
      // Class
      return InterceptClassDecoratorFactory.createDecorator(
        INTERCEPT_CLASS_KEY,
        interceptorOrKeys,
      )(target);
    }
    // Not on a class or method
    throw new Error(
      '@intercept cannot be used on a property: ' +
        DecoratorFactory.getTargetName(target, method, methodDescriptor),
    );
  };
}

/**
 * Invoke a method with the given context
 * @param context - Context object
 * @param target - Target class (for static methods) or object (for instance methods)
 * @param methodName - Method name
 * @param args - An array of argument values
 */
export function invokeMethodWithInterceptors(
  context: Context,
  target: object,
  methodName: string,
  args: InvocationArgs,
): ValueOrPromise<InvocationResult> {
  const invocationCtx = new InvocationContext(
    context,
    target,
    methodName,
    args,
  );

  invocationCtx.assertMethodExists();
  return tryWithFinally(
    () => {
      const interceptors = invocationCtx.loadInterceptors();
      return invokeInterceptors(invocationCtx, interceptors);
    },
    () => invocationCtx.close(),
  );
}

/**
 * Invoke the interceptor chain
 * @param context - Context object
 * @param interceptors - An array of interceptors
 */
function invokeInterceptors(
  context: InvocationContext,
  interceptors: InterceptorOrKey[],
): ValueOrPromise<InvocationResult> {
  let index = 0;
  return next();

  /**
   * Invoke downstream interceptors or the target method
   */
  function next(): ValueOrPromise<InvocationResult> {
    // No more interceptors
    if (index === interceptors.length) {
      return context.invokeTargetMethod();
    }
    return invokeNextInterceptor();
  }

  /**
   * Invoke downstream interceptors
   */
  function invokeNextInterceptor(): ValueOrPromise<InvocationResult> {
    const interceptor = interceptors[index++];
    const interceptorFn = loadInterceptor(interceptor);
    return transformValueOrPromise(interceptorFn, fn => {
      /* istanbul ignore if */
      if (debug.enabled) {
        debug(
          'Invoking interceptor %d (%s) on %s',
          index - 1,
          fn.name,
          getTargetName(context.target, context.methodName),
          context.args,
        );
      }
      return fn(context, next);
    });
  }

  /**
   * Return the interceptor function or resolve the interceptor function as a
   * binding from the context
   * @param interceptor - Interceptor function or binding key
   */
  function loadInterceptor(interceptor: InterceptorOrKey) {
    if (typeof interceptor === 'function') return interceptor;
    debug('Resolving interceptor binding %s', interceptor);
    return context.getValueOrPromise(interceptor) as ValueOrPromise<
      Interceptor
    >;
  }
}
