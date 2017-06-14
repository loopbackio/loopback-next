// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Class} from '../common-types';
import {Entity} from '../model';

import {Reflector} from '@loopback/context';

// tslint:disable:no-any

export enum RelationType {
  belongsTo,
  hasOne,
  hasMany,
  embedsOne,
  embedsMany,
  referencesOne,
  referencesMany,
}

export const RELATION_KEY = 'loopback:relation';

export class RelationMetadata {
  type: RelationType;
  target: string | Class<Entity>;
  as: string;
}

/**
 * Decorator for relations
 * @param definition
 * @returns {(target:any, key:string)}
 */
export function relation(definition?: Object) {
  return function(target: any, key: string) {
    // Apply model definition to the model class
    Reflector.defineMetadata(RELATION_KEY, definition, target, key);
  };
}

/**
 * Decorator for belongsTo
 * @param definition
 * @returns {(target:any, key:string)}
 */
export function belongsTo(definition?: Object) {
  return function(target: any, key: string) {
    // Apply model definition to the model class
    const rel = Object.assign({type: RelationType.belongsTo}, definition);
    Reflector.defineMetadata(RELATION_KEY, rel, target, key);
  };
}

/**
 * Decorator for hasOne
 * @param definition
 * @returns {(target:any, key:string)}
 */
export function hasOne(definition?: Object) {
  return function(target: any, key: string) {
    // Apply model definition to the model class
    const rel = Object.assign({type: RelationType.hasOne}, definition);
    Reflector.defineMetadata(RELATION_KEY, rel, target, key);
  };
}

/**
 * Decorator for hasMany
 * @param definition
 * @returns {(target:any, key:string)}
 */
export function hasMany(definition?: Object) {
  return function(target: any, key: string) {
    // Apply model definition to the model class
    const rel = Object.assign({type: RelationType.hasMany}, definition);
    Reflector.defineMetadata(RELATION_KEY, rel, target, key);
  };
}

/**
 * Decorator for embedsOne
 * @param definition
 * @returns {(target:any, key:string)}
 */
export function embedsOne(definition?: Object) {
  return function(target: any, key: string) {
    // Apply model definition to the model class
    const rel = Object.assign({type: RelationType.embedsOne}, definition);
    Reflector.defineMetadata(RELATION_KEY, rel, target, key);
  };
}

/**
 * Decorator for embedsMany
 * @param definition
 * @returns {(target:any, key:string)}
 */
export function embedsMany(definition?: Object) {
  return function(target: any, key: string) {
    // Apply model definition to the model class
    const rel = Object.assign({type: RelationType.embedsMany}, definition);
    Reflector.defineMetadata(RELATION_KEY, rel, target, key);
  };
}

/**
 * Decorator for referencesOne
 * @param definition
 * @returns {(target:any, key:string)}
 */
export function referencesOne(definition?: Object) {
  return function(target: any, key: string) {
    // Apply model definition to the model class
    const rel = Object.assign({type: RelationType.referencesOne}, definition);
    Reflector.defineMetadata(RELATION_KEY, rel, target, key);
  };
}

/**
 * Decorator for referencesMany
 * @param definition
 * @returns {(target:any, key:string)}
 */
export function referencesMany(definition?: Object) {
  return function(target: any, key: string) {
    // Apply model definition to the model class
    const rel = Object.assign({type: RelationType.referencesMany}, definition);
    Reflector.defineMetadata(RELATION_KEY, rel, target, key);
  };
}
