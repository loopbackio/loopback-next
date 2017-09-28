// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Reflector} from './reflect';
import {BoundValue, ValueOrPromise} from './binding';
import {Context} from './context';

const PARAMETERS_KEY = 'inject:parameters';
const PROPERTIES_KEY = 'inject:properties';

/**
 * A function to provide resolution of injected values
 */
export interface ResolverFunction {
  (ctx: Context, injection: Injection): ValueOrPromise<BoundValue>;
}

/**
 * Descriptor for an injection point
 */
export interface Injection {
  bindingKey: string; // Binding key
  metadata?: {[attribute: string]: BoundValue}; // Related metadata
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
  metadata?: Object,
  resolve?: ResolverFunction,
) {
  return function markParameterOrPropertyAsInjected(
    // tslint:disable-next-line:no-any
    target: any,
    propertyKey?: string | symbol,
    propertyDescriptorOrParameterIndex?:
      | TypedPropertyDescriptor<BoundValue>
      | number,
  ) {
    if (typeof propertyDescriptorOrParameterIndex === 'number') {
      // The decorator is applied to a method parameter
      // Please note propertyKey is `undefined` for constructor
      const injectedArgs: Injection[] =
        Reflector.getOwnMetadata(PARAMETERS_KEY, target, propertyKey!) || [];
      injectedArgs[propertyDescriptorOrParameterIndex] = {
        bindingKey,
        metadata,
        resolve,
      };
      Reflector.defineMetadata(
        PARAMETERS_KEY,
        injectedArgs,
        target,
        propertyKey!,
      );
    } else if (propertyKey) {
      if (typeof Object.getPrototypeOf(target) === 'function') {
        const prop = target.name + '.' + propertyKey.toString();
        throw new Error(
          '@inject is not supported for a static property: ' + prop,
        );
      }
      // The decorator is applied to a property
      const injections: {[p: string]: Injection} =
        Reflector.getOwnMetadata(PROPERTIES_KEY, target) || {};
      injections[propertyKey] = {bindingKey, metadata, resolve};
      Reflector.defineMetadata(PROPERTIES_KEY, injections, target);
    } else {
      throw new Error(
        '@inject can only be used on properties or method parameters.',
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
    metadata?: Object,
  ) {
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
    metadata?: Object,
  ) {
    return inject(bindingKey, metadata, resolveAsSetter);
  };
}

function resolveAsGetter(ctx: Context, injection: Injection) {
  return function getter() {
    return ctx.get(injection.bindingKey);
  };
}

function resolveAsSetter(ctx: Context, injection: Injection) {
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
  // tslint:disable-next-line:no-any
  target: any,
  method?: string | symbol,
): Injection[] {
  if (method) {
    return Reflector.getMetadata(PARAMETERS_KEY, target, method) || [];
  } else {
    return Reflector.getMetadata(PARAMETERS_KEY, target) || [];
  }
}

/**
 * Return a map of injection objects for properties
 * @param target The target class for static properties or
 * prototype for instance properties.
 */
export function describeInjectedProperties(
  // tslint:disable-next-line:no-any
  target: any,
): {[p: string]: Injection} {
  const metadata: {[name: string]: Injection} = {};
  let obj = target;
  while (true) {
    const m = Reflector.getOwnMetadata(PROPERTIES_KEY, obj);
    if (m) {
      // Adding non-existent properties
      for (const p in m) {
        if (!(p in metadata)) {
          metadata[p] = m[p];
        }
      }
    }
    // Recurse into the prototype chain
    obj = Object.getPrototypeOf(obj);
    if (!obj) break;
  }
  return metadata;
}
