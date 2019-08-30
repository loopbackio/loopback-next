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
import {sortBindingsByPhase} from './binding-sorter';
import {Context} from './context';
import {
  GenericInterceptor,
  GenericInterceptorOrKey,
  invokeInterceptors,
} from './interceptor-chain';
import {
  InvocationArgs,
  InvocationContext,
  InvocationOptions,
  InvocationResult,
} from './invocation';
import {
  ContextBindings,
  ContextTags,
  GLOBAL_INTERCEPTOR_NAMESPACE,
} from './keys';
import {tryWithFinally, ValueOrPromise} from './value-promise';
const debug = debugFactory('loopback:context:interceptor');

/**
 * A specialized InvocationContext for interceptors
 */
export class InterceptedInvocationContext extends InvocationContext {
  /**
   * Discover all binding keys for global interceptors (tagged by
   * ContextTags.GLOBAL_INTERCEPTOR)
   */
  getGlobalInterceptorBindingKeys(): string[] {
    const bindings: Readonly<Binding<Interceptor>>[] = this.find(
      filterByTag(ContextTags.GLOBAL_INTERCEPTOR),
    );
    this.sortGlobalInterceptorBindings(bindings);
    const keys = bindings.map(b => b.key);
    debug('Global interceptor binding keys:', keys);
    return keys;
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
    debug('Interceptors for %s', this.targetName, interceptors);
    return interceptors;
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
export interface Interceptor extends GenericInterceptor<InvocationContext> {}

/**
 * Interceptor function or binding key that can be used as parameters for
 * `@intercept()`
 */
export type InterceptorOrKey = GenericInterceptorOrKey<InvocationContext>;

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
    // Class or a prototype
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    target: any,
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
        {decoratorName: '@intercept'},
      )(target, method, methodDescriptor!);
    }
    if (typeof target === 'function' && !method && !methodDescriptor) {
      // Class
      return InterceptClassDecoratorFactory.createDecorator(
        INTERCEPT_CLASS_KEY,
        interceptorOrKeys,
        {decoratorName: '@intercept'},
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
 * @param options - Options for the invocation
 */
export function invokeMethodWithInterceptors(
  context: Context,
  target: object,
  methodName: string,
  args: InvocationArgs,
  options: InvocationOptions = {},
): ValueOrPromise<InvocationResult> {
  // Do not allow `skipInterceptors` as it's against the function name
  // `invokeMethodWithInterceptors`
  assert(!options.skipInterceptors, 'skipInterceptors is not allowed');
  const invocationCtx = new InterceptedInvocationContext(
    context,
    target,
    methodName,
    args,
  );

  invocationCtx.assertMethodExists();
  return tryWithFinally(
    () => {
      const interceptors = invocationCtx.loadInterceptors();
      const targetMethodInvoker = () =>
        invocationCtx.invokeTargetMethod(options);
      interceptors.push(targetMethodInvoker);
      return invokeInterceptors(invocationCtx, interceptors);
    },
    () => invocationCtx.close(),
  );
}
