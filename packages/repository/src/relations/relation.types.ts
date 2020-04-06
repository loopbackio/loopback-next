// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Options} from '../common-types';
import {Entity} from '../model';
import {Inclusion} from '../query';
import {TypeResolver} from '../type-resolver';

export enum RelationType {
  belongsTo = 'belongsTo',
  hasOne = 'hasOne',
  hasMany = 'hasMany',
  embedsOne = 'embedsOne',
  embedsMany = 'embedsMany',
  referencesOne = 'referencesOne',
  referencesMany = 'referencesMany',
}

export interface RelationDefinitionBase {
  /**
   * The type of the relation, must be one of RelationType values.
   */
  type: RelationType;

  /**
   * True for relations targeting multiple instances (e.g. HasMany),
   * false for relations with a single target (e.g. BelongsTo, HasOne).
   * This property is needed by OpenAPI/JSON Schema generator.
   */
  targetsMany: boolean;

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
  targetsMany: true;

  /**
   * keyTo: The foreign key used by the target model for this relation.
   * keyFrom: The source key used by the source model for this relation.
   *
   * E.g. when a Customer has many Order instances, then keyTo is "customerId".
   * Note that "customerId" is the default FK assumed by the framework, users
   * can provide a custom FK name by setting "keyTo".
   * And Customer.id is keyFrom. keyFrom defaults to the id property of a model.
   * Users can provide a custom source key name by setting "keyTo".
   *
   */
  keyTo?: string;
  keyFrom?: string;
}

/**
 * A `hasManyThrough` relation defines a many-to-many connection with another model.
 * This relation indicates that the declaring model can be matched with zero or more
 * instances of another model by proceeding through a third model.
 *
 * Warning: The hasManyThrough interface is experimental and is subject to change.
 * If backwards-incompatible changes are made, a new major version may not be
 * released.
 */
export interface HasManyThroughDefinition extends RelationDefinitionBase {
  type: RelationType.hasMany;
  targetsMany: true;

  /**
   * The foreign key in the source model, e.g. Customer#id.
   */
  keyFrom: string;

  /**
   * The primary key of the target model, e.g Seller#id.
   */
  keyTo: string;

  through: {
    /**
     * The through model of this relation.
     *
     * E.g. when a Customer has many Order instances and a Seller has many Order instances,
     * then Order is through.
     */
    model: TypeResolver<Entity, typeof Entity>;

    /**
     * The foreign key of the source model defined in the through model, e.g. Order#customerId
     */
    keyFrom: string;

    /**
     * The foreign key of the target model defined in the through model, e.g. Order#sellerId
     */
    keyTo: string;
  };
}

export interface BelongsToDefinition extends RelationDefinitionBase {
  type: RelationType.belongsTo;
  targetsMany: false;

  /*
   * The foreign key in the source model, e.g. Order#customerId.
   */
  keyFrom: string;

  /*
   * The primary key of the target model, e.g Customer#id.
   */
  keyTo?: string;
}

export interface HasOneDefinition extends RelationDefinitionBase {
  type: RelationType.hasOne;
  targetsMany: false;

  /**
   * keyTo: The foreign key used by the target model for this relation.
   * keyFrom: The source key used by the source model for this relation.
   *
   * E.g. when a Customer has one Address instance, then keyTo is "customerId".
   * Note that "customerId" is the default FK assumed by the framework, users
   * can provide a custom FK name by setting "keyTo".
   * And Customer.id is keyFrom. keyFrom defaults to the id property of a model.
   * Users can provide a custom source key name by setting "keyTo".
   */
  keyTo?: string;
  keyFrom?: string;
}

/**
 * A union type describing all possible Relation metadata objects.
 */
export type RelationMetadata =
  | HasManyDefinition
  | HasManyThroughDefinition
  | BelongsToDefinition
  | HasOneDefinition
  // TODO(bajtos) add other relation types and remove RelationDefinitionBase once
  // all relation types are covered.
  | RelationDefinitionBase;

// Re-export Getter so that users don't have to import from @loopback/context
export {Getter} from '@loopback/context';

/**
 * @returns An array of resolved values, the items must be ordered in the same
 * way as `sourceEntities`. The resolved value can be one of:
 * - `undefined` when no target model(s) were found
 * - `Entity` for relations targeting a single model
 * - `Entity[]` for relations targeting multiple models
 */
export type InclusionResolver<S extends Entity, T extends Entity> = (
  /**
   * List of source models as returned by the first database query.
   */
  sourceEntities: S[],
  /**
   * Inclusion requested by the user (e.g. scope constraints to apply).
   */
  inclusion: Inclusion,
  /**
   * Generic options object, e.g. carrying the Transaction object.
   */
  options?: Options,
) => Promise<(T | undefined)[] | (T[] | undefined)[]>;
