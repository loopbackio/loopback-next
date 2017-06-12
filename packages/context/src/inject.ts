// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as assert from 'assert';
import { Reflector } from './reflect';
import { BoundValue, ValueOrPromise } from './binding';
import { Context } from './context';

const REFLECTION_CDI_KEY = 'loopback:inject:constructor';
const REFLECTION_PDI_KEY = 'loopback:inject:properties';

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
  metadata?: { [attribute: string]: BoundValue; }; // Related metadata
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
export function inject(bindingKey: string, metadata?: Object, resolve?: ResolverFunction) {
  // tslint:disable-next-line:no-any
  return function markArgumentAsInjected(target: any, propertyKey?: string | symbol,
    propertyDescriptorOrParameterIndex?: TypedPropertyDescriptor<BoundValue> | number) {

    if (typeof propertyDescriptorOrParameterIndex === 'number') {
      // The decorator is applied to a method parameter
      // Please note propertyKey is `undefined` for constructor
      const injectedArgs: Injection[] =
        Reflector.getOwnMetadata(REFLECTION_CDI_KEY, target, propertyKey!) || [];
      injectedArgs[propertyDescriptorOrParameterIndex] = {bindingKey, metadata, resolve};
      Reflector.defineMetadata(REFLECTION_CDI_KEY, injectedArgs, target, propertyKey!);
    } else if (propertyKey) {
      // The decorator is applied to a property
      const injections: { [p: string]: Injection } =
        Reflector.getOwnMetadata(REFLECTION_PDI_KEY, target) || {};
      injections[propertyKey] = {bindingKey, metadata, resolve};
      Reflector.defineMetadata(REFLECTION_PDI_KEY, injections, target);
    } else {
      throw new Error('@inject can be used on properties or method parameters.');
    }
  };
}

/**
 * Return an array of injection objects for constructor parameters
 * @param target The target class
 */
export function describeInjectedArguments(target: Function): Injection[] {
  return Reflector.getOwnMetadata(REFLECTION_CDI_KEY, target) || [];
}

/**
 * Return a map of injection objects for properties
 * @param target The target class. Please note a property decorator function receives
 * the target.prototype
 */
export function describeInjectedProperties(target: Function): { [p: string]: Injection } {
  return Reflector.getOwnMetadata(REFLECTION_PDI_KEY, target.prototype) || {};
}
