// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as assert from 'assert';
import 'reflect-metadata';

const REFLECTION_KEY = 'loopback.inject';

/**
 * A decorator to annotate method arguments for automatic injection
 * by LoopBack IoC container.
 *
 * Usage - Typescript:
 *
 * ```ts
 * class InfoController {
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
 * @param bindingKey What binding to use in order to resolve the value
 * of the annotated argument.
 */
export function inject(bindingKey: string) {
  return function markArgumentAsInjected(target: Object, propertyKey: string | symbol, parameterIndex: number) {
    assert(parameterIndex != undefined, '@inject decorator can be used on function arguments only!');

    const injectedArgs: string[] = Reflect.getOwnMetadata(REFLECTION_KEY, target, propertyKey) || [];
    injectedArgs[parameterIndex] = bindingKey;
    Reflect.defineMetadata(REFLECTION_KEY, injectedArgs, target, propertyKey);
  };
}

export function describeInjectedArguments(target: Function) {
  return Reflect.getOwnMetadata(REFLECTION_KEY, target);
}
