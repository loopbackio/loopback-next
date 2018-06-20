// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/example-todo
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {EntityCrudRepository} from './repository';
import {RelationType, RELATIONS_KEY} from '../decorators/relation.decorator';
import {Entity} from '../model';
import {
  HasManyEntityCrudRepository,
  DefaultHasManyEntityCrudRepository,
} from './relation.repository';
import {DefaultCrudRepository} from './legacy-juggler-bridge';
import {MetadataInspector} from '@loopback/context';

export interface RelationDefinitionBase {
  type: RelationType;
}

export interface HasManyDefinition extends RelationDefinitionBase {
  type: RelationType.hasMany;
  keyTo: string;
  keyFrom: string;
}

export type constrainRepositoryFunction<T extends Entity> = (
  key: Partial<T>,
) => HasManyEntityCrudRepository<T>;

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

export function getConstrainedRepositoryFunction<
  S extends Entity,
  SrcModel extends typeof Entity,
  T extends Entity
>(
  sourceModel: SrcModel,
  targetRepo: DefaultCrudRepository<T, typeof Entity.prototype.id>,
) {
  const allMeta = MetadataInspector.getAllPropertyMetadata<
    RelationDefinitionBase
  >(RELATIONS_KEY, sourceModel.prototype)!;
  let hasManyMeta: HasManyDefinition;
  Object.values(allMeta).forEach(value => {
    if (value.type === RelationType.hasMany) {
      hasManyMeta = value as HasManyDefinition;
    }
  });
  return function(constraint: Partial<S>) {
    return hasManyRepositoryFactory(
      constraint[hasManyMeta.keyFrom],
      hasManyMeta,
      targetRepo,
    );
  };
}

export function hasManyRepositoryFactory<SourceID, T extends Entity, ID>(
  sourceModelId: SourceID,
  relationMetadata: HasManyDefinition,
  targetRepository: EntityCrudRepository<T, ID>,
): HasManyEntityCrudRepository<T> {
  switch (relationMetadata.type) {
    case RelationType.hasMany:
      const fkConstraint = {[relationMetadata.keyTo]: sourceModelId};

      return new DefaultHasManyEntityCrudRepository<
        T,
        EntityCrudRepository<T, ID>
      >(targetRepository, fkConstraint);
  }
}
