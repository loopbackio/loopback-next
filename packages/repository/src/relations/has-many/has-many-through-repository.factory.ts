// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as debugFactory from 'debug';
import {DataObject} from '../../common-types';
import {Entity} from '../../model';
import {EntityCrudRepository} from '../../repositories/repository';
import {Getter, HasManyThroughDefinition} from '../relation.types';
import {
  createTargetConstraint,
  createThroughConstraint,
  resolveHasManyThroughMetadata,
} from './has-many-through.helpers';
import {
  DefaultHasManyThroughRepository,
  HasManyThroughRepository,
} from './has-many-through.repository';

const debug = debugFactory(
  'loopback:repository:has-many-through-repository-factory',
);

export type HasManyThroughRepositoryFactory<
  Target extends Entity,
  Through extends Entity,
  ForeignKeyType
> = (fkValue: ForeignKeyType) => HasManyThroughRepository<Target, Through>;

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
export function createHasManyThroughRepositoryFactory<
  Target extends Entity,
  TargetID,
  Through extends Entity,
  ThroughID,
  ForeignKeyType
>(
  relationMetadata: HasManyThroughDefinition,
  targetRepositoryGetter: Getter<EntityCrudRepository<Target, TargetID>>,
  throughRepositoryGetter: Getter<EntityCrudRepository<Through, ThroughID>>,
): HasManyThroughRepositoryFactory<Target, Through, ForeignKeyType> {
  const meta = resolveHasManyThroughMetadata(relationMetadata);
  debug('Resolved HasManyThrough relation metadata: %o', meta);
  return function(fkValue?: ForeignKeyType) {
    function getTargetContraint(
      throughInstances: Through[],
    ): DataObject<Target> {
      return createTargetConstraint<Target, Through>(meta, throughInstances);
    }
    function getThroughConstraint(
      targetInstance?: Target,
    ): DataObject<Through> {
      const constriant: DataObject<Through> = createThroughConstraint<
        Target,
        Through,
        ForeignKeyType
      >(meta, fkValue, targetInstance);
      return constriant;
    }
    return new DefaultHasManyThroughRepository<
      Target,
      TargetID,
      EntityCrudRepository<Target, TargetID>,
      Through,
      ThroughID,
      EntityCrudRepository<Through, ThroughID>
    >(
      targetRepositoryGetter,
      throughRepositoryGetter,
      getTargetContraint,
      getThroughConstraint,
    );
  };
}
