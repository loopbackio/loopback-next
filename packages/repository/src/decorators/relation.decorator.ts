// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Class} from '../common-types';
import {
  Entity,
  TypeResolver,
  isTypeResolver,
  ERR_TARGET_UNDEFINED,
} from '../model';
import {PropertyDecoratorFactory, MetadataInspector} from '@loopback/context';
import {property} from './model.decorator';
import {camelCase} from 'lodash';

// tslint:disable:no-any

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

export class RelationMetadata {
  type: RelationType;
  target: string | Class<Entity>;
  as: string;
}

export interface RelationDefinitionBase {
  type: RelationType;
  target: TypeResolver<typeof Entity>;
}

export interface HasManyDefinition extends RelationDefinitionBase {
  type: RelationType.hasMany;
  keyTo?: string;
}

export interface BelongsToDefinition extends RelationDefinitionBase {
  type: RelationType.belongsTo;
  keyTo?: string;
  keyFrom?: string;
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
export function belongsTo<T extends typeof Entity>(
  targetModel: TypeResolver<T>,
  definition?: Partial<BelongsToDefinition>,
) {
  const defIsCyclic =
    definition &&
    (definition as Object).hasOwnProperty('target') &&
    !definition.target;
  if (!targetModel || defIsCyclic) {
    throw new Error(ERR_TARGET_UNDEFINED);
  }
  return function(target: Object, key: string) {
    const propMeta = {
      type: MetadataInspector.getDesignTypeForProperty(target, key),
    };
    property(propMeta)(target, key);

    const rel: BelongsToDefinition = {
      type: RelationType.belongsTo,
      target: targetModel,
      keyFrom: key,
    };

    // Apply model definition to the model class
    Object.assign(rel, definition);
    relation(rel)(target, key);
  };
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
 * @param targetModel Target model for hasMany relation
 * @param definition Optional metadata for setting up hasMany relation
 * @returns {(target:any, key:string)}
 */
export function hasMany<T extends typeof Entity>(
  targetModel: TypeResolver<T>,
  definition?: Partial<HasManyDefinition>,
) {
  // todo(shimks): extract out common logic (such as @property.array) to
  // @relation
  return function(target: Object, key: string) {
    property.array(targetModel)(target, key);

    const meta: Partial<HasManyDefinition> = {target: targetModel};

    Object.assign(meta, definition, {type: RelationType.hasMany});

    relation(meta)(target, key);
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
