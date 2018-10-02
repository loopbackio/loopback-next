// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  MetadataInspector,
  DecoratorFactory,
  ParameterDecoratorFactory,
  PropertyDecoratorFactory,
  MetadataMap,
  MetadataAccessor,
  InspectionOptions,
} from '@loopback/metadata';
import {BoundValue, ValueOrPromise, resolveList} from './value-promise';
import {Context} from './context';
import {BindingKey, BindingAddress} from './binding-key';
import {ResolutionSession} from './resolution-session';

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
    session?: ResolutionSession,
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

  bindingKey: BindingAddress<ValueType>; // Binding key
  metadata?: InjectionMetadata; // Related metadata
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
 * @param bindingKey What binding to use in order to resolve the value of the
 * decorated constructor parameter or property.
 * @param metadata Optional metadata to help the injection
 * @param resolve Optional function to resolve the injection
 *
 */
export function inject(
  bindingKey: string | BindingKey<BoundValue>,
  metadata?: InjectionMetadata,
  resolve?: ResolverFunction,
) {
  metadata = Object.assign({decorator: '@inject'}, metadata);
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
          bindingKey,
          metadata,
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
          bindingKey,
          metadata,
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
 * The function injected by `@inject.getter(key)`.
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
 * The function injected by `@inject.setter(key)`.
 */
export type Setter<T> = (value: T) => void;

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
   * @param bindingKey The key of the value we want to eventually get.
   * @param metadata Optional metadata to help the injection
   */
  export const getter = function injectGetter(
    bindingKey: BindingAddress<BoundValue>,
    metadata?: InjectionMetadata,
  ) {
    metadata = Object.assign({decorator: '@inject.getter'}, metadata);
    return inject(bindingKey, metadata, resolveAsGetter);
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
    bindingKey: BindingAddress<BoundValue>,
    metadata?: InjectionMetadata,
  ) {
    metadata = Object.assign({decorator: '@inject.setter'}, metadata);
    return inject(bindingKey, metadata, resolveAsSetter);
  };

  /**
   * Inject an array of values by a tag pattern string or regexp
   *
   * @example
   * ```ts
   * class AuthenticationManager {
   *   constructor(
   *     @inject.tag('authentication.strategy') public strategies: Strategy[],
   *   ) {}
   * }
   * ```
   * @param bindingTag Tag name or regex
   * @param metadata Optional metadata to help the injection
   */
  export const tag = function injectTag(
    bindingTag: string | RegExp,
    metadata?: InjectionMetadata,
  ) {
    metadata = Object.assign(
      {decorator: '@inject.tag', tag: bindingTag},
      metadata,
    );
    return inject('', metadata, resolveByTag);
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

function resolveAsGetter(
  ctx: Context,
  injection: Readonly<Injection>,
  session?: ResolutionSession,
) {
  // We need to clone the session for the getter as it will be resolved later
  session = ResolutionSession.fork(session);
  return function getter() {
    return ctx.get(injection.bindingKey, {
      session,
      optional: injection.metadata && injection.metadata.optional,
    });
  };
}

function resolveAsSetter(ctx: Context, injection: Injection) {
  // No resolution session should be propagated into the setter
  return function setter(value: BoundValue) {
    ctx.bind(injection.bindingKey).to(value);
  };
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

function resolveByTag(
  ctx: Context,
  injection: Readonly<Injection>,
  session?: ResolutionSession,
) {
  const tag: string | RegExp = injection.metadata!.tag;
  const bindings = ctx.findByTag(tag);

  return resolveList(bindings, b => {
    // We need to clone the session so that resolution of multiple bindings
    // can be tracked in parallel
    return b.getValue(ctx, ResolutionSession.fork(session));
  });
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
