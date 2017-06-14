// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Class} from '../common-types';
import {Reflector} from '@loopback/context';

export const MODEL_KEY = 'loopback:model';
export const PROPERTY_KEY = 'loopback:property';

// tslint:disable:no-any

/**
 * Decorator for model definitions
 * @param definition
 * @returns {(target:any)}
 */
export function model(definition?: Object) {
  return function(target: any) {
    // Apply model definition to the model class
    Reflector.defineMetadata(MODEL_KEY, definition, target);
  };
}

/**
 * Decorator for model properties
 * @param definition
 * @returns {(target:any, key:string)}
 */
export function property(definition?: Object) {
  return function(target: any, key: string) {
    // Apply model definition to the model class
    Reflector.defineMetadata(PROPERTY_KEY, definition, target, key);
  };
}
