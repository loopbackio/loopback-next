// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {PropertyDecoratorFactory} from '@loopback/context';
import {Entity, EntityResolver, Model, RelationDefinitionMap} from '../model';
import {TypeResolver} from '../type-resolver';
import {property} from './model.decorator';

export enum RelationType {
  belongsTo = 'belongsTo',
  hasOne = 'hasOne',
  hasMany = 'hasMany',
  embedsOne = 'embedsOne',
  embedsMany = 'embedsMany',
  referencesOne = 'referencesOne',
  referencesMany = 'referencesMany',
}

export const RELATIONS_KEY = 'loopback:relations';

export interface RelationDefinitionBase {
  type: RelationType;
  name: string;
  source: typeof Entity;
  target: TypeResolver<Entity, typeof Entity>;
}

export interface HasManyDefinition extends RelationDefinitionBase {
  type: RelationType.hasMany;
  keyTo?: string;
}

// TODO(bajtos) add other relation types, e.g. BelongsToDefinition
export type RelationMetadata = HasManyDefinition | RelationDefinitionBase;

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

/**
 * Decorator for hasMany
 * Calls property.array decorator underneath the hood and infers foreign key
 * name from target model name unless explicitly specified
 * @param targetResolver Target model for hasMany relation
 * @param definition Optional metadata for setting up hasMany relation
 * @returns {(target:any, key:string)}
 */
export function hasMany<T extends Entity>(
  targetResolver: EntityResolver<T>,
  definition?: Partial<HasManyDefinition>,
) {
  // todo(shimks): extract out common logic (such as @property.array) to
  // @relation
  return function(decoratedTarget: Object, key: string) {
    property.array(targetResolver)(decoratedTarget, key);

    const meta: HasManyDefinition = Object.assign(
      {},
      // properties customizable by users
      definition,
      // properties enforced by the decorator
      {
        type: RelationType.hasMany,
        name: key,
        source: decoratedTarget.constructor,
        target: targetResolver,
      },
    );
    relation(meta)(decoratedTarget, key);
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

/**
 * Get metadata of all relations defined on a given model class.
 *
 * @param modelCtor The model class (the constructor function).
 * @return
 */
export function getModelRelations(
  modelCtor: typeof Model,
): RelationDefinitionMap {
  return (modelCtor.definition && modelCtor.definition.relations) || {};
}
