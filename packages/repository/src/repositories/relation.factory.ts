// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/example-todo
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {EntityCrudRepository} from './repository';
import {HasManyDefinition} from '../decorators/relation.decorator';
import {Entity} from '../model';
import {
  HasManyRepository,
  DefaultHasManyEntityCrudRepository,
} from './relation.repository';
import {DataObject} from '..';

export type HasManyRepositoryFactory<Target extends Entity, ForeignKeyType> = (
  fkValue: ForeignKeyType,
) => HasManyRepository<Target>;

/**
 * Enforces a constraint on a repository based on a relationship contract
 * between models. For example, if a Customer model is related to an Order model
 * via a HasMany relation, then, the relational repository returned by the
 * factory function would be constrained by a Customer model instance's id(s).
 *
 * @param relationMeta The relation metadata used to describe the
 * relationship and determine how to apply the constraint.
 * @param targetRepo The repository which represents the target model of a
 * relation attached to a datasource.
 * @returns The factory function which accepts a foreign key value to constrain
 * the given target repository
 */
export function createHasManyRepositoryFactory<
  Target extends Entity,
  TargetID,
  ForeignKeyType
>(
  relationMetadata: HasManyDefinition,
  targetRepository: EntityCrudRepository<Target, TargetID>,
): HasManyRepositoryFactory<Target, ForeignKeyType> {
  return function(fkValue: ForeignKeyType) {
    const fkName = relationMetadata.keyTo;
    if (!fkName) {
      throw new Error(
        'The foreign key property name (keyTo) must be specified',
      );
    }
    // tslint:disable-next-line:no-any
    const constraint: any = {[fkName]: fkValue};
    return new DefaultHasManyEntityCrudRepository<
      Target,
      TargetID,
      EntityCrudRepository<Target, TargetID>
    >(targetRepository, constraint as DataObject<Target>);
  };
}
