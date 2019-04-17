// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  DecoratorFactory,
  InspectionOptions,
  MetadataAccessor,
  MetadataInspector,
  MetadataMap,
  ParameterDecoratorFactory,
  PropertyDecoratorFactory,
} from '@loopback/metadata';
import {Binding, BindingTag} from './binding';
import {
  BindingFilter,
  BindingSelector,
  filterByTag,
  isBindingAddress,
} from './binding-filter';
import {BindingAddress} from './binding-key';
import {BindingCreationPolicy, Context} from './context';
import {ContextView, createViewGetter} from './context-view';
import {ResolutionSession} from './resolution-session';
import {BoundValue, ValueOrPromise} from './value-promise';

const PARAMETERS_KEY = MetadataAccessor.create<Injection, ParameterDecorator>(
  'inject:parameters',
);
const PROPERTIES_KEY = MetadataAccessor.create<Injection, PropertyDecorator>(
  'inject:properties',
);

/**
 * A function to provide resolution of injected values
 */
export interface ResolverFunction {
  (
    ctx: Context,
    injection: Readonly<Injection>,
    session: ResolutionSession,
  ): ValueOrPromise<BoundValue>;
}

/**
 * An object to provide metadata for `@inject`
 */
export interface InjectionMetadata {
  /**
   * Name of the decorator function, such as `@inject` or `@inject.setter`.
   * It's usually set by the decorator implementation.
   */
  decorator?: string;
  /**
   * Control if the dependency is optional, default to false
   */
  optional?: boolean;
  /**
   * Other attributes
   */
  [attribute: string]: BoundValue;
}

/**
 * Descriptor for an injection point
 */
export interface Injection<ValueType = BoundValue> {
  target: Object;
  member?: string;
  methodDescriptorOrParameterIndex?:
    | TypedPropertyDescriptor<ValueType>
    | number;

  bindingSelector: BindingSelector<ValueType>; // Binding selector
  metadata: InjectionMetadata; // Related metadata
  resolve?: ResolverFunction; // A custom resolve function
}

/**
 * A decorator to annotate method arguments for automatic injection
 * by LoopBack IoC container.
 *
 * Usage - Typescript:
 *
 * ```ts
 * class InfoController {
 *   @inject('authentication.user') public userName: string;
 *
 *   constructor(@inject('application.name') public appName: string) {
 *   }
 *   // ...
 * }
 * ```
 *
 * Usage - JavaScript:
 *
 *  - TODO(bajtos)
 *
 * @param bindingSelector What binding to use in order to resolve the value of the
 * decorated constructor parameter or property.
 * @param metadata Optional metadata to help the injection
 * @param resolve Optional function to resolve the injection
 *
 */
export function inject(
  bindingSelector: BindingSelector,
  metadata?: InjectionMetadata,
  resolve?: ResolverFunction,
) {
  if (typeof bindingSelector === 'function' && !resolve) {
    resolve = resolveValuesByFilter;
  }
  const injectionMetadata = Object.assign({decorator: '@inject'}, metadata);
  return function markParameterOrPropertyAsInjected(
    target: Object,
    member: string,
    methodDescriptorOrParameterIndex?:
      | TypedPropertyDescriptor<BoundValue>
      | number,
  ) {
    if (typeof methodDescriptorOrParameterIndex === 'number') {
      // The decorator is applied to a method parameter
      // Please note propertyKey is `undefined` for constructor
      const paramDecorator: ParameterDecorator = ParameterDecoratorFactory.createDecorator<
        Injection
      >(
        PARAMETERS_KEY,
        {
          target,
          member,
          methodDescriptorOrParameterIndex,
          bindingSelector,
          metadata: injectionMetadata,
          resolve,
        },
        // Do not deep clone the spec as only metadata is mutable and it's
        // shallowly cloned
        {cloneInputSpec: false},
      );
      paramDecorator(target, member!, methodDescriptorOrParameterIndex);
    } else if (member) {
      // Property or method
      if (target instanceof Function) {
        throw new Error(
          '@inject is not supported for a static property: ' +
            DecoratorFactory.getTargetName(target, member),
        );
      }
      if (methodDescriptorOrParameterIndex) {
        // Method
        throw new Error(
          '@inject cannot be used on a method: ' +
            DecoratorFactory.getTargetName(
              target,
              member,
              methodDescriptorOrParameterIndex,
            ),
        );
      }
      const propDecorator: PropertyDecorator = PropertyDecoratorFactory.createDecorator<
        Injection
      >(
        PROPERTIES_KEY,
        {
          target,
          member,
          methodDescriptorOrParameterIndex,
          bindingSelector,
          metadata: injectionMetadata,
          resolve,
        },
        // Do not deep clone the spec as only metadata is mutable and it's
        // shallowly cloned
        {cloneInputSpec: false},
      );
      propDecorator(target, member!);
    } else {
      // It won't happen here as `@inject` is not compatible with ClassDecorator
      /* istanbul ignore next */
      throw new Error(
        '@inject can only be used on a property or a method parameter',
      );
    }
  };
}

/**
 * The function injected by `@inject.getter(bindingSelector)`. It can be used
 * to fetch bound value(s) from the underlying binding(s). The return value will
 * be an array if the `bindingSelector` is a `BindingFilter` function.
 */
export type Getter<T> = () => Promise<T>;

export namespace Getter {
  /**
   * Convert a value into a Getter returning that value.
   * @param value
   */
  export function fromValue<T>(value: T): Getter<T> {
    return () => Promise.resolve(value);
  }
}

/**
 * The function injected by `@inject.setter(bindingKey)`. It sets the underlying
 * binding to a constant value using `binding.to(value)`.
 *
 * For example:
 *
 * ```ts
 * setterFn('my-value');
 * ```
 * @param value The value for the underlying binding
 */
export type Setter<T> = (value: T) => void;

/**
 * Metadata for `@inject.binding`
 */
export interface InjectBindingMetadata extends InjectionMetadata {
  /**
   * Controls how the underlying binding is resolved/created
   */
  bindingCreation?: BindingCreationPolicy;
}

export namespace inject {
  /**
   * Inject a function for getting the actual bound value.
   *
   * This is useful when implementing Actions, where
   * the action is instantiated for Sequence constructor, but some
   * of action's dependencies become bound only after other actions
   * have been executed by the sequence.
   *
   * See also `Getter<T>`.
   *
   * @param bindingSelector The binding key or filter we want to eventually get
   * value(s) from.
   * @param metadata Optional metadata to help the injection
   */
  export const getter = function injectGetter(
    bindingSelector: BindingSelector<unknown>,
    metadata?: InjectionMetadata,
  ) {
    metadata = Object.assign({decorator: '@inject.getter'}, metadata);
    return inject(
      bindingSelector,
      metadata,
      isBindingAddress(bindingSelector)
        ? resolveAsGetter
        : resolveAsGetterByFilter,
    );
  };

  /**
   * Inject a function for setting (binding) the given key to a given
   * value. (Only static/constant values are supported, it's not possible
   * to bind a key to a class or a provider.)
   *
   * This is useful e.g. when implementing Actions that are contributing
   * new Elements.
   *
   * See also `Setter<T>`.
   *
   * @param bindingKey The key of the value we want to set.
   * @param metadata Optional metadata to help the injection
   */
  export const setter = function injectSetter(
    bindingKey: BindingAddress,
    metadata?: InjectBindingMetadata,
  ) {
    metadata = Object.assign({decorator: '@inject.setter'}, metadata);
    return inject(bindingKey, metadata, resolveAsSetter);
  };

  /**
   * Inject the binding object for the given key. This is useful if a binding
   * needs to be set up beyond just a constant value allowed by
   * `@inject.setter`. The injected binding is found or created based on the
   * `metadata.bindingCreation` option. See `BindingCreationPolicy` for more
   * details.
   *
   * For example:
   *
   * ```ts
   * class MyAuthAction {
   *   @inject.binding('current-user', {
   *     bindingCreation: BindingCreationPolicy.ALWAYS_CREATE,
   *   })
   *   private userBinding: Binding<UserProfile>;
   *
   *   async authenticate() {
   *     this.userBinding.toDynamicValue(() => {...});
   *   }
   * }
   * ```
   *
   * @param bindingKey Binding key
   * @param metadata Metadata for the injection
   */
  export const binding = function injectBinding(
    bindingKey: BindingAddress,
    metadata?: InjectBindingMetadata,
  ) {
    metadata = Object.assign({decorator: '@inject.binding'}, metadata);
    return inject(bindingKey, metadata, resolveAsBinding);
  };

  /**
   * Inject an array of values by a tag pattern string or regexp
   *
   * For example,
   * ```ts
   * class AuthenticationManager {
   *   constructor(
   *     @inject.tag('authentication.strategy') public strategies: Strategy[],
   *   ) {}
   * }
   * ```
   * @param bindingTag Tag name, regex or object
   * @param metadata Optional metadata to help the injection
   */
  export const tag = function injectByTag(
    bindingTag: BindingTag | RegExp,
    metadata?: InjectionMetadata,
  ) {
    metadata = Object.assign(
      {decorator: '@inject.tag', tag: bindingTag},
      metadata,
    );
    return inject(filterByTag(bindingTag), metadata);
  };

  /**
   * Inject matching bound values by the filter function
   *
   * ```ts
   * class MyControllerWithView {
   *   @inject.view(filterByTag('foo'))
   *   view: ContextView<string[]>;
   * }
   * ```
   * @param bindingFilter A binding filter function
   * @param metadata
   */
  export const view = function injectByFilter(
    bindingFilter: BindingFilter,
    metadata?: InjectionMetadata,
  ) {
    metadata = Object.assign({decorator: '@inject.view'}, metadata);
    return inject(bindingFilter, metadata, resolveAsContextView);
  };

  /**
   * Inject the context object.
   *
   * @example
   * ```ts
   * class MyProvider {
   *  constructor(@inject.context() private ctx: Context) {}
   * }
   * ```
   */
  export const context = function injectContext() {
    return inject('', {decorator: '@inject.context'}, ctx => ctx);
  };
}

/**
 * Assert the target type inspected from TypeScript for injection to be the
 * expected type. If the types don't match, an error is thrown.
 * @param injection Injection information
 * @param expectedType Expected type
 * @param expectedTypeName Name of the expected type to be used in the error
 * @returns The name of the target
 */
export function assertTargetType(
  injection: Readonly<Injection>,
  expectedType: Function,
  expectedTypeName?: string,
) {
  const targetName = ResolutionSession.describeInjection(injection).targetName;
  const targetType = inspectTargetType(injection);

  if (!isDesignTypeSupported()) {
    // If design:type is not emitted, skip the check
    // See https://github.com/strongloop/loopback-next/issues/2764
    return targetName;
  }
  if (targetType && targetType !== expectedType) {
    expectedTypeName = expectedTypeName || expectedType.name;
    throw new Error(
      `The type of ${targetName} (${
        targetType.name
      }) is not ${expectedTypeName}`,
    );
  }
  return targetName;
}

/**
 * Cache the flag to see if `design:type` is supported
 */
let designTypeSupported: boolean | undefined = undefined;

/**
 * Check if `design:type` is emitted by TypeScript compiler
 */
function isDesignTypeSupported() {
  if (typeof designTypeSupported === 'boolean') return designTypeSupported;
  class DesignTypeTest {
    @inject('env')
    public getEnv: Getter<string>;
  }
  const designType = MetadataInspector.getDesignTypeForProperty(
    DesignTypeTest.prototype,
    'getEnv',
  );
  designTypeSupported = designType === Function;
  return designTypeSupported;
}

/**
 * Resolver for `@inject.getter`
 * @param ctx
 * @param injection
 * @param session
 */
function resolveAsGetter(
  ctx: Context,
  injection: Readonly<Injection>,
  session: ResolutionSession,
) {
  assertTargetType(injection, Function, 'Getter function');
  const bindingSelector = injection.bindingSelector as BindingAddress;
  // We need to clone the session for the getter as it will be resolved later
  const forkedSession = ResolutionSession.fork(session);
  return function getter() {
    return ctx.get(bindingSelector, {
      session: forkedSession,
      optional: injection.metadata.optional,
    });
  };
}

/**
 * Resolver for `@inject.setter`
 * @param ctx
 * @param injection
 */
function resolveAsSetter(ctx: Context, injection: Injection) {
  const targetName = assertTargetType(injection, Function, 'Setter function');
  const bindingSelector = injection.bindingSelector;
  if (!isBindingAddress(bindingSelector)) {
    throw new Error(
      `@inject.setter (${targetName}) does not allow BindingFilter.`,
    );
  }
  // No resolution session should be propagated into the setter
  return function setter(value: unknown) {
    const binding = findOrCreateBindingForInjection(ctx, injection);
    binding.to(value);
  };
}

function resolveAsBinding(ctx: Context, injection: Injection) {
  const targetName = assertTargetType(injection, Binding);
  const bindingSelector = injection.bindingSelector;
  if (!isBindingAddress(bindingSelector)) {
    throw new Error(
      `@inject.binding (${targetName}) does not allow BindingFilter.`,
    );
  }
  return findOrCreateBindingForInjection(ctx, injection);
}

function findOrCreateBindingForInjection(
  ctx: Context,
  injection: Injection<unknown>,
) {
  const bindingCreation =
    injection.metadata &&
    (injection.metadata as InjectBindingMetadata).bindingCreation;
  const binding: Binding<unknown> = ctx.findOrCreateBinding(
    injection.bindingSelector as BindingAddress,
    bindingCreation,
  );
  return binding;
}

/**
 * Return an array of injection objects for parameters
 * @param target The target class for constructor or static methods,
 * or the prototype for instance methods
 * @param method Method name, undefined for constructor
 */
export function describeInjectedArguments(
  target: Object,
  method?: string,
): Readonly<Injection>[] {
  method = method || '';
  const options: InspectionOptions = {};
  if (method === '') {
    // A hacky way to check if an explicit constructor exists
    // See https://github.com/strongloop/loopback-next/issues/1565
    if (target.toString().match(/\s+constructor\s*\([^\)]*\)\s+\{/m)) {
      options.ownMetadataOnly = true;
    }
  } else if (target.hasOwnProperty(method)) {
    // The method exists in the target, no injections on the super method
    // should be honored
    options.ownMetadataOnly = true;
  }
  const meta = MetadataInspector.getAllParameterMetadata<Readonly<Injection>>(
    PARAMETERS_KEY,
    target,
    method,
    options,
  );
  return meta || [];
}

/**
 * Inspect the target type for the injection to find out the corresponding
 * JavaScript type
 * @param injection Injection information
 */
function inspectTargetType(injection: Readonly<Injection>) {
  let type = MetadataInspector.getDesignTypeForProperty(
    injection.target,
    injection.member!,
  );
  if (type) {
    return type;
  }
  const designType = MetadataInspector.getDesignTypeForMethod(
    injection.target,
    injection.member!,
  );
  type =
    designType.parameterTypes[
      injection.methodDescriptorOrParameterIndex as number
    ];
  return type;
}

/**
 * Resolve an array of bound values matching the filter function for `@inject`.
 * @param ctx Context object
 * @param injection Injection information
 * @param session Resolution session
 */
function resolveValuesByFilter(
  ctx: Context,
  injection: Readonly<Injection>,
  session: ResolutionSession,
) {
  assertTargetType(injection, Array);
  const bindingFilter = injection.bindingSelector as BindingFilter;
  const view = new ContextView(ctx, bindingFilter);
  return view.resolve(session);
}

/**
 * Resolve to a getter function that returns an array of bound values matching
 * the filter function for `@inject.getter`.
 *
 * @param ctx Context object
 * @param injection Injection information
 * @param session Resolution session
 */
function resolveAsGetterByFilter(
  ctx: Context,
  injection: Readonly<Injection>,
  session: ResolutionSession,
) {
  assertTargetType(injection, Function, 'Getter function');
  const bindingFilter = injection.bindingSelector as BindingFilter;
  return createViewGetter(ctx, bindingFilter, session);
}

/**
 * Resolve to an instance of `ContextView` by the binding filter function
 * for `@inject.view`
 * @param ctx Context object
 * @param injection Injection information
 */
function resolveAsContextView(ctx: Context, injection: Readonly<Injection>) {
  assertTargetType(injection, ContextView);

  const bindingFilter = injection.bindingSelector as BindingFilter;
  const view = new ContextView(ctx, bindingFilter);
  view.open();
  return view;
}

/**
 * Return a map of injection objects for properties
 * @param target The target class for static properties or
 * prototype for instance properties.
 */
export function describeInjectedProperties(
  target: Object,
): MetadataMap<Readonly<Injection>> {
  const metadata =
    MetadataInspector.getAllPropertyMetadata<Readonly<Injection>>(
      PROPERTIES_KEY,
      target,
    ) || {};
  return metadata;
}
