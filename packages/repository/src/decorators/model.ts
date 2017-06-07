// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import { Class, Any } from '../common-types';
import { Reflector } from '@loopback/context';

export const MODEL_KEY = 'loopback:model';
export const PROPERTY_KEY = 'loopback:property';

/**
 * Decorator for model definitions
 * @param definition
 * @returns {(target:AnyType)}
 */
export function model(definition?: Object) {
  return function(target: Any) {
    // Apply model definition to the model class
    Reflector.defineMetadata(MODEL_KEY, definition, target);
  };
}

/**
 * Decorator for model properties
 * @param definition
 * @returns {(target:AnyType, key:string)}
 */
export function property(definition?: Object) {
  return function(target: Any, key: string) {
    // Apply model definition to the model class
    Reflector.defineMetadata(PROPERTY_KEY, definition, target, key);
  };
}
