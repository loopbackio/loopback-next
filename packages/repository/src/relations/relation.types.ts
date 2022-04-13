// Copyright IBM Corp. and LoopBack contributors 2018,2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {InclusionFilter} from '@loopback/filter';
import {Options} from '../common-types';
import {Entity} from '../model';
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

/**
 * HasManyDefinition defines one-to-many relations and also possible defines
 * many-to-many relations with through models.
 */
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

  /**
   * With current architecture design, polymorphic type cannot be supported without through
   * Consider using Source-hasMany->Through->hasOne->Target(polymorphic) for one-to-many relations
   */
  // polymorphic?: boolean | {discriminator: string};

  /**
   * Description of the through model of the hasManyThrough relation.
   *
   * A `hasManyThrough` relation defines a many-to-many connection with another model.
   * This relation indicates that the declaring model can be matched with zero or more
   * instances of another model by proceeding through a third model.
   *
   * E.g a Category has many Products, and a Product can have many Categories.
   * CategoryProductLink can be the through model.
   * Such a through model has information of foreign keys of the source model(Category) and the target model(Product).
   *
   * Warning: The hasManyThrough interface is experimental and is subject to change.
   * If backwards-incompatible changes are made, a new major version may not be
   * released.
   */
  through?: {
    /**
     * The through model of this relation.
     *
     * E.g. when a Category has many CategoryProductLink instances and a Product has many CategoryProductLink instances,
     * then CategoryProductLink is through.
     */
    model: TypeResolver<Entity, typeof Entity>;

    /**
     * The foreign key of the source model defined in the through model, e.g. CategoryProductLink#categoryId
     */
    keyFrom?: string;

    /**
     * The foreign key of the target model defined in the through model, e.g. CategoryProductLink#productId
     */
    keyTo?: string;

    /**
     * The polymorphism of the target model. The discriminator is a key of *through* model.
     * If the target model is not polymorphic, then the value should be left undefined or false;
     * If the key on through model indicating the concrete class of the through instance is default
     * i.e. camelCase(classNameOf(targetModelInstance)) + "Id"
     * then the discriminator field can be undefined
     *
     * With current architecture design, polymorphic type cannot be supported without through
     * Consider using Source hasMany Through hasOne Target(polymorphic)
     * or Source hasMany Through belongsTo Target(polymorphic) for one-to-many relations
     */
    polymorphic?: boolean | {discriminator: string};
  };
}

export interface BelongsToDefinition extends RelationDefinitionBase {
  type: RelationType.belongsTo;
  targetsMany: false;

  /*
   * The foreign key in the source model, e.g. Order#customerId.
   */
  keyFrom?: string;

  /*
   * The primary key of the target model, e.g Customer#id.
   */
  keyTo?: string;
  /**
   * The polymorphism of the target model. The discriminator is a key of source model.
   * If the target model is not polymorphic, then the value should be left undefined or false;
   * If the key on source model indicating the concrete class of the target instance is default
   * i.e. camelCase(classNameOf(throughModelInstance)) + "Id"
   * Then the discriminator field can be undefined
   */
  polymorphic?: boolean | {discriminator: string};
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
  /**
   * The polymorphism of the target model. The discriminator is a key of source model.
   * If the target model is not polymorphic, then the value should be left undefined or false;
   * If the key on source model indicating the concrete class of the target instance is default
   * i.e. camelCase(classNameOf(throughModelInstance)) + "Id"
   * Then the discriminator field can be undefined
   */
  polymorphic?: boolean | {discriminator: string};
}

export interface ReferencesManyDefinition extends RelationDefinitionBase {
  type: RelationType.referencesMany;
  targetsMany: true;

  /**
   * keyTo: The foreign key used by the target model for this relation.
   * keyFrom: The source key used by the source model for this relation.
   *
   * TODO(bajtos) Add relation description.
   *
   */
  keyTo?: string;
  keyFrom?: string;
}

/**
 * A union type describing all possible Relation metadata objects.
 */
export type RelationMetadata =
  | HasManyDefinition
  | BelongsToDefinition
  | HasOneDefinition
  | ReferencesManyDefinition
  // TODO(bajtos) add other relation types and remove RelationDefinitionBase once
  // all relation types are covered.
  | RelationDefinitionBase;

// Re-export Getter so that users don't have to import from @loopback/context
export {Getter} from '@loopback/core';

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
  inclusion: InclusionFilter,
  /**
   * Generic options object, e.g. carrying the Transaction object.
   */
  options?: Options,
) => Promise<(T | undefined)[] | (T[] | undefined)[]>;
