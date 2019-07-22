// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as debugFactory from 'debug';
import {DataObject} from '../../common-types';
import {Entity} from '../../model';
import {EntityCrudRepository} from '../../repositories/repository';
import {Getter, HasManyDefinition} from '../relation.types';
import {resolveHasManyMetadata} from './has-many.helpers';
import {
  DefaultHasManyRepository,
  HasManyRepository,
} from './has-many.repository';

const debug = debugFactory('loopback:repository:has-many-repository-factory');

export type HasManyRepositoryFactory<Target extends Entity, ForeignKeyType> = (
  fkValue: ForeignKeyType,
) => HasManyRepository<Target>;

/**
 * Enforces a constraint on a repository based on a relationship contract
 * between models. For example, if a Customer model is related to an Order model
 * via a HasMany relation, then, the relational repository returned by the
 * factory function would be constrained by a Customer model instance's id(s).
 *
 * @param relationMetadata - The relation metadata used to describe the
 * relationship and determine how to apply the constraint.
 * @param targetRepositoryGetter - The repository which represents the target model of a
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
  targetRepositoryGetter: Getter<EntityCrudRepository<Target, TargetID>>,
): HasManyRepositoryFactory<Target, ForeignKeyType> {
  const meta = resolveHasManyMetadata(relationMetadata);
  debug('Resolved HasMany relation metadata: %o', meta);
  return function(fkValue: ForeignKeyType) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const constraint: any = {[meta.keyTo]: fkValue};
    return new DefaultHasManyRepository<
      Target,
      TargetID,
      EntityCrudRepository<Target, TargetID>
    >(targetRepositoryGetter, constraint as DataObject<Target>);
  };
}
