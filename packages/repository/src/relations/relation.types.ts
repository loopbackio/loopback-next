// Copyright IBM Corp. 2018. All Rights Reserved.
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

  // TODO(semver-major): We should make targetsMany as mandatory
  // in next major release
  /**
   * True for relations targeting multiple instances (e.g. HasMany),
   * false for relations with a single target (e.g. BelongsTo, HasOne).
   * This property is needed by OpenAPI/JSON Schema generator.
   */
  targetsMany?: boolean;

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
   * The foreign key used by the target model.
   *
   * E.g. when a Customer has one Address instance, then keyTo is "customerId".
   * Note that "customerId" is the default FK assumed by the framework, users
   * can provide a custom FK name by setting "keyTo".
   */
  keyTo?: string;
}

/**
 * A union type describing all possible Relation metadata objects.
 */
export type RelationMetadata =
  | HasManyDefinition
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
