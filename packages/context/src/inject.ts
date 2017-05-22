// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as assert from 'assert';
import 'reflect-metadata';
import {BoundValue} from './binding';

const REFLECTION_CDI_KEY = 'loopback:inject:constructor';
const REFLECTION_PDI_KEY = 'loopback:inject:properties';

export interface Injection {
  bindingKey: string;
  metadata?: { [attribute: string]: BoundValue; };
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
 *
 */
export function inject(bindingKey: string, metadata?: Object) {
  // tslint:disable-next-line:no-any
  return function markArgumentAsInjected(target: any, propertyKey?: string | symbol,
    propertyDescriptorOrParameterIndex?: TypedPropertyDescriptor<BoundValue> | number) {

    if (typeof propertyDescriptorOrParameterIndex === 'number') {
      // The decorator is applied to a method parameter
      // Please note propertyKey is `undefined` for constructor
      const injectedArgs: Injection[] =
        Reflect.getOwnMetadata(REFLECTION_CDI_KEY, target, propertyKey!) || [];
      injectedArgs[propertyDescriptorOrParameterIndex] = {bindingKey, metadata};
      Reflect.defineMetadata(REFLECTION_CDI_KEY, injectedArgs, target, propertyKey!);
    } else if (propertyKey) {
      // The decorator is applied to a property
      const injections: { [p: string]: Injection } =
        Reflect.getOwnMetadata(REFLECTION_PDI_KEY, target) || {};
      injections[propertyKey] = {bindingKey, metadata};
      Reflect.defineMetadata(REFLECTION_PDI_KEY, injections, target);
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
  return Reflect.getOwnMetadata(REFLECTION_CDI_KEY, target) || [];
}

/**
 * Return a map of injection objects for properties
 * @param target The target class. Please note a property decorator function receives
 * the target.prototype
 */
export function describeInjectedProperties(target: Function): { [p: string]: Injection } {
  return Reflect.getOwnMetadata(REFLECTION_PDI_KEY, target.prototype) || {};
}
