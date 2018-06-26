// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Class} from '../common-types';
import {Entity} from '../model';
import {PropertyDecoratorFactory} from '@loopback/context';
import {property} from './model.decorator';

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

export const RELATIONS_KEY = 'loopback:relations';

export class RelationMetadata {
  type: RelationType;
  target: string | Class<Entity>;
  as: string;
}

export interface RelationDefinitionBase {
  type: RelationType;
}

export interface HasManyDefinition extends RelationDefinitionBase {
  type: RelationType.hasMany;
  keyTo: string;
  keyFrom: string;
}

/**
 * Decorator for relations
 * @param definition
 * @returns {(target:any, key:string)}
 */
export function relation(definition?: Object) {
  // Apply relation definition to the model class
  return PropertyDecoratorFactory.createDecorator(RELATIONS_KEY, definition);
}

/**
 * Decorator for belongsTo
 * @param definition
 * @returns {(target:any, key:string)}
 */
export function belongsTo(definition?: Object) {
  // Apply model definition to the model class
  const rel = Object.assign({type: RelationType.belongsTo}, definition);
  return PropertyDecoratorFactory.createDecorator(RELATIONS_KEY, rel);
}

/**
 * Decorator for hasOne
 * @param definition
 * @returns {(target:any, key:string)}
 */
export function hasOne(definition?: Object) {
  const rel = Object.assign({type: RelationType.hasOne}, definition);
  return PropertyDecoratorFactory.createDecorator(RELATIONS_KEY, rel);
}

export function hasMany<T extends typeof Entity>(
  definition?: Partial<HasManyDefinition>,
  itemType?: T,
): PropertyDecorator;

export function hasMany<T extends typeof Entity>(
  itemType: T,
): PropertyDecorator;

export function hasMany<T extends typeof Entity>(
  definition?: Partial<HasManyDefinition> | T,
  itemType?: T,
) {
  // todo(shimks): extract out common logic (such as @property.array) to
  // @relation
  return function(target: Object, key: string) {
    if (
      definition &&
      typeof definition !== 'object' &&
      definition.prototype instanceof Entity &&
      !itemType
    ) {
      itemType = definition as T;
    }
    if (itemType) {
      property.array(itemType)(target, key);
    }

    let meta = {type: RelationType.hasMany};
    Object.assign(meta, definition);

    PropertyDecoratorFactory.createDecorator(
      RELATIONS_KEY,
      meta as HasManyDefinition,
    )(target, key);
  };
}

/**
 * Decorator for embedsOne
 * @param definition
 * @returns {(target:any, key:string)}
 */
export function embedsOne(definition?: Object) {
  const rel = Object.assign({type: RelationType.embedsOne}, definition);
  return PropertyDecoratorFactory.createDecorator(RELATIONS_KEY, rel);
}

/**
 * Decorator for embedsMany
 * @param definition
 * @returns {(target:any, key:string)}
 */
export function embedsMany(definition?: Object) {
  const rel = Object.assign({type: RelationType.embedsMany}, definition);
  return PropertyDecoratorFactory.createDecorator(RELATIONS_KEY, rel);
}

/**
 * Decorator for referencesOne
 * @param definition
 * @returns {(target:any, key:string)}
 */
export function referencesOne(definition?: Object) {
  const rel = Object.assign({type: RelationType.referencesOne}, definition);
  return PropertyDecoratorFactory.createDecorator(RELATIONS_KEY, rel);
}

/**
 * Decorator for referencesMany
 * @param definition
 * @returns {(target:any, key:string)}
 */
export function referencesMany(definition?: Object) {
  const rel = Object.assign({type: RelationType.referencesMany}, definition);
  return PropertyDecoratorFactory.createDecorator(RELATIONS_KEY, rel);
}
