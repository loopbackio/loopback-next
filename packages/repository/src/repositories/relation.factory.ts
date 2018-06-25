// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/example-todo
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {EntityCrudRepository} from './repository';
import {
  RelationType,
  HasManyDefinition,
  RelationDefinitionBase,
} from '../decorators/relation.decorator';
import {Entity} from '../model';
import {
  HasManyRepository,
  DefaultHasManyEntityCrudRepository,
} from './relation.repository';
import {Class} from '../common-types';
import {RelationMap} from '../decorators/model.decorator';

export type HasManyRepositoryFactory<S extends Entity, T extends Entity> = (
  key: Partial<S>,
) => HasManyRepository<T>;

/**
 * Enforces a constraint on a repository based on a relationship contract
 * between models. Returns a relational repository that exposes applicable CRUD
 * method APIs for the related target repository. For example, if a Customer model is
 * related to an Order model via a HasMany relation, then, the relational
 * repository returned by this method would be constrained by a Customer model
 * instance's id(s).
 *
 * @param constraint The constraint to apply to the target repository. For
 * example, {id: '5'}.
 * @param relationMetadata The relation metadata used to used to describe the
 * relationship and determine how to apply the constraint.
 * @param targetRepository The repository which represents the target model of a
 * relation attached to a datasource.
 *
 */
export function createHasManyRepositoryFactory<
  S extends Entity,
  T extends Entity
>(
  relationMeta: HasManyDefinition,
  targetRepo: EntityCrudRepository<T, typeof Entity.prototype.id>,
) {
  return function(constraint: Partial<S>) {
    const fkName = relationMeta.keyTo;
    const fkValue = constraint[relationMeta.keyFrom];
    return new DefaultHasManyEntityCrudRepository<
      T,
      EntityCrudRepository<T, typeof Entity.prototype.id>
    >(targetRepo, {[fkName]: fkValue});
  };
}
