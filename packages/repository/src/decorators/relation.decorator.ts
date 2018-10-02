// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {MetadataInspector, PropertyDecoratorFactory} from '@loopback/context';
import {
  Entity,
  EntityResolver,
  Model,
  PropertyDefinition,
  RelationDefinitionMap,
} from '../model';
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
  /**
   * The type of the relation, must be one of RelationType values.
   */
  type: RelationType;

  /**
   * The relation name, typically matching the name of the accessor property
   * defined on the source model. For example "orders" or "customer".
   */
  name: string;

  /**
   * The source model of this relation.
   *
   * E.g. when a Customer has many Order instances, then Customer is the source.
   */
  source: typeof Entity;

  /**
   * The target model of this relation.
   *
   * E.g. when a Customer has many Order instances, then Order is the target.
   */
  target: TypeResolver<Entity, typeof Entity>;
}

export interface HasManyDefinition extends RelationDefinitionBase {
  type: RelationType.hasMany;

  /**
   * The foreign key used by the target model.
   *
   * E.g. when a Customer has many Order instances, then keyTo is "customerId".
   * Note that "customerId" is the default FK assumed by the framework, users
   * can provide a custom FK name by setting "keyTo".
   */
  keyTo?: string;
}

export interface BelongsToDefinition extends RelationDefinitionBase {
  type: RelationType.belongsTo;

  /*
   * The foreign key in the source model, e.g. Order#customerId.
   */
  keyFrom: string;

  /*
   * The primary key of the target model, e.g Customer#id.
   */
  keyTo?: string;
}

export type RelationMetadata =
  | HasManyDefinition
  | BelongsToDefinition
  // TODO(bajtos) add other relation types and remove RelationDefinitionBase once
  // all relation types are covered.
  | RelationDefinitionBase;

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
 * @returns {(target: Object, key:string)}
 */
export function belongsTo<T extends Entity>(
  targetResolver: EntityResolver<T>,
  definition?: Partial<BelongsToDefinition>,
) {
  return function(decoratedTarget: Entity, decoratedKey: string) {
    const propMeta: PropertyDefinition = {
      type: MetadataInspector.getDesignTypeForProperty(
        decoratedTarget,
        decoratedKey,
      ),
      // TODO(bajtos) Make the foreign key required once our REST API layer
      // allows controller methods to exclude required properties
      // required: true,
    };
    property(propMeta)(decoratedTarget, decoratedKey);

    // @belongsTo() is typically decorating the foreign key property,
    // e.g. customerId. We need to strip the trailing "Id" suffix from the name.
    const relationName = decoratedKey.replace(/Id$/, '');

    const meta: BelongsToDefinition = Object.assign(
      // default values, can be customized by the caller
      {
        keyFrom: decoratedKey,
      },
      // properties provided by the caller
      definition,
      // properties enforced by the decorator
      {
        type: RelationType.belongsTo,
        name: relationName,
        source: decoratedTarget.constructor,
        target: targetResolver,
      },
    );
    relation(meta)(decoratedTarget, decoratedKey);
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
 * @param targetResolver Target model for hasMany relation
 * @param definition Optional metadata for setting up hasMany relation
 * @returns {(target:any, key:string)}
 */
export function hasMany<T extends Entity>(
  targetResolver: EntityResolver<T>,
  definition?: Partial<HasManyDefinition>,
) {
  return function(decoratedTarget: Object, key: string) {
    property.array(targetResolver)(decoratedTarget, key);

    const meta: HasManyDefinition = Object.assign(
      // default values, can be customized by the caller
      {},
      // properties provided by the caller
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
