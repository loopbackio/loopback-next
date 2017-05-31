// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/juggler
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import { Class, AnyType } from '../common';
import 'reflect-metadata';

export const MODEL_KEY = 'loopback:model';
export const PROPERTY_KEY = 'loopback:property';

/**
 * Decorator for model definitions
 * @param definition
 * @returns {(target:AnyType)}
 */
export function model(definition?: Object) {
  return function(target: AnyType) {
    // Apply model definition to the model class
    Reflect.defineMetadata(PROPERTY_KEY, definition, target);
  };
}

/**
 * Decorator for model properties
 * @param definition
 * @returns {(target:AnyType, key:string)}
 */
export function property(definition?: Object) {
  return function(target: AnyType, key: string) {
    // Apply model definition to the model class
    Reflect.defineMetadata(PROPERTY_KEY, definition, target, key);
  };
}
