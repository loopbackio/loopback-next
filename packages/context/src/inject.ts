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
} from '@loopback/metadata';
import {
  BoundValue,
  ValueOrPromise,
  isPromise,
  getDeepProperty,
  resolveList,
} from './value-promise';
import {Binding} from './binding';
import {Context} from './context';
import {ResolutionSession} from './resolution-session';

const PARAMETERS_KEY = 'inject:parameters';
const PROPERTIES_KEY = 'inject:properties';

/**
 * A function to provide resolution of injected values
 */
export interface ResolverFunction {
  (
    ctx: Context,
    injection: Injection,
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
export interface Injection {
  target: Object;
  member?: string | symbol;
  methodDescriptorOrParameterIndex?:
    | TypedPropertyDescriptor<BoundValue>
    | number;

  bindingKey: string; // Binding key
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
  bindingKey: string,
  metadata?: InjectionMetadata,
  resolve?: ResolverFunction,
) {
  metadata = Object.assign({decorator: '@inject'}, metadata);
  return function markParameterOrPropertyAsInjected(
    target: Object,
    member: string | symbol,
    methodDescriptorOrParameterIndex?:
      | TypedPropertyDescriptor<BoundValue>
      | number,
  ) {
    if (typeof methodDescriptorOrParameterIndex === 'number') {
      // The decorator is applied to a method parameter
      // Please note propertyKey is `undefined` for constructor
      const paramDecorator: ParameterDecorator = ParameterDecoratorFactory.createDecorator<
        Injection
      >(PARAMETERS_KEY, {
        target,
        member,
        methodDescriptorOrParameterIndex,
        bindingKey,
        metadata,
        resolve,
      });
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
      >(PROPERTIES_KEY, {
        target,
        member,
        methodDescriptorOrParameterIndex,
        bindingKey,
        metadata,
        resolve,
      });
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
    bindingKey: string,
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
    bindingKey: string,
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
   * @param bindingTag Tag name or regex
   * @param metadata Optional metadata to help the injection
   */
  export const context = function injectContext() {
    return inject('', {decorator: '@inject.context'}, ctx => ctx);
  };

  /**
   * Inject an option from `options` of the parent binding. If no corresponding
   * option value is present, `undefined` will be injected.
   *
   * @example
   * ```ts
   * class Store {
   *   constructor(
   *     @inject.options('x') public optionX: number,
   *     @inject.options('y') public optionY: string,
   *   ) { }
   * }
   *
   * ctx.bind('store1').toClass(Store).withOptions({ x: 1, y: 'a' });
   * ctx.bind('store2').toClass(Store).withOptions({ x: 2, y: 'b' });
   *
   *  const store1 = ctx.getSync('store1');
   *  expect(store1.optionX).to.eql(1);
   *  expect(store1.optionY).to.eql('a');

   * const store2 = ctx.getSync('store2');
   * expect(store2.optionX).to.eql(2);
   * expect(store2.optionY).to.eql('b');
   * ```
   *
   * @param optionPath Optional property path of the option. If is `''` or not
   * present, the `options` object will be returned.
   * @param metadata Optional metadata to help the injection
   */
  export const options = function injectOptions(
    optionPath?: string,
    metadata?: Object,
  ) {
    optionPath = optionPath || '';
    metadata = Object.assign(
      {optionPath, decorator: '@inject.options', optional: true},
      metadata,
    );
    return inject('', metadata, resolveAsOptions);
  };
}

function resolveAsGetter(
  ctx: Context,
  injection: Injection,
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
 * Try to resolve key/path from the binding key hierarchy
 * For example, if the binding key is `servers.rest.server1`, we'll try the
 * following entries:
 * 1. servers.rest.server1:$options#host
 * 2. servers.rest:$options#server1.host
 * 3. servers.$options#rest.server1.host`
 * 4. $options#servers.rest.server1.host
 *
 * @param ctx Context object
 * @param key Binding key with namespaces as prefixes separated by `.`)
 * @param path The property path
 * @param session ResolutionSession
 */
function resolveOptionsByNamespaces(
  ctx: Context,
  key: string,
  path: string,
  session?: ResolutionSession,
) {
  let options;
  while (true) {
    const optionKeyAndPath = Binding.buildKeyWithPath(
      key ? `${key}:$options` : '$options',
      path,
    );
    options = ctx.getValueOrPromise(optionKeyAndPath, {
      session,
      optional: true,
    });
    // Found the corresponding options
    if (options !== undefined) return options;

    // We have tried all levels
    if (!key) return undefined;

    // Move last part of the key into the path
    const index = key.lastIndexOf('.');
    path = `${key.substring(index + 1)}.${path}`;
    key = key.substring(0, index);
  }
}

function resolveFromOptions(
  options: Context,
  path: string,
  session?: ResolutionSession,
) {
  // Default to all options
  const bindings = options.find(/.*/);
  // Map array values to an object keyed by binding keys
  const mapValues = (values: BoundValue[]) => {
    const obj: {
      [name: string]: BoundValue;
    } = {};
    let index = 0;
    for (const v of values) {
      obj[bindings[index].key] = v;
      index++;
    }
    return getDeepProperty(obj, path);
  };
  const result = resolveBindings(options, bindings, session);
  if (isPromise(result)) {
    return result.then(mapValues);
  } else {
    return mapValues(result);
  }
}

function resolveAsOptions(
  ctx: Context,
  injection: Injection,
  session?: ResolutionSession,
) {
  if (!(session && session.currentBinding)) {
    // No binding is available
    return undefined;
  }

  const meta = injection.metadata || {};
  const binding = session.currentBinding;
  let options = binding.options;
  const keyAndPath = Binding.parseKeyWithPath(meta.optionPath);
  if (!options) {
    /**
     * No local options found, try to resolve it from the corresponding binding.
     */
    let key = binding.key;
    let path = [keyAndPath.key, keyAndPath.path].join('.');
    return resolveOptionsByNamespaces(ctx, key, path, session);
  }

  if (!keyAndPath.key) {
    return resolveFromOptions(options, keyAndPath.path || '', session);
  }

  return options.getValueOrPromise(meta.optionPath, {session, optional: true});
}

/**
 * Return an array of injection objects for parameters
 * @param target The target class for constructor or static methods,
 * or the prototype for instance methods
 * @param method Method name, undefined for constructor
 */
export function describeInjectedArguments(
  target: Object,
  method?: string | symbol,
): Injection[] {
  method = method || '';
  const meta = MetadataInspector.getAllParameterMetadata<Injection>(
    PARAMETERS_KEY,
    target,
    method,
  );
  return meta || [];
}

function resolveBindings(
  ctx: Context,
  bindings: Binding[],
  session?: ResolutionSession,
) {
  return resolveList(bindings, b => {
    // We need to clone the session so that resolution of multiple bindings
    // can be tracked in parallel
    return b.getValue(ctx, ResolutionSession.fork(session));
  });
}

function resolveByTag(
  ctx: Context,
  injection: Injection,
  session?: ResolutionSession,
) {
  const tag: string | RegExp = injection.metadata!.tag;
  const bindings = ctx.findByTag(tag);
  return resolveBindings(ctx, bindings, session);
}

/**
 * Return a map of injection objects for properties
 * @param target The target class for static properties or
 * prototype for instance properties.
 */
export function describeInjectedProperties(
  target: Object,
): MetadataMap<Injection> {
  const metadata =
    MetadataInspector.getAllPropertyMetadata<Injection>(
      PROPERTIES_KEY,
      target,
    ) || {};
  return metadata;
}
