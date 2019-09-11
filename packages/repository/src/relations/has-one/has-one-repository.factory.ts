// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as debugFactory from 'debug';
import {DataObject} from '../../common-types';
import {Entity} from '../../model';
import {EntityCrudRepository} from '../../repositories/repository';
import {Getter, HasOneDefinition, InclusionResolver} from '../relation.types';
import {resolveHasOneMetadata} from './has-one.helpers';
import {createHasOneInclusionResolver} from './has-one.inclusion-resolver';
import {DefaultHasOneRepository, HasOneRepository} from './has-one.repository';

const debug = debugFactory('loopback:repository:has-one-repository-factory');

export interface HasOneRepositoryFactory<
  Target extends Entity,
  ForeignKeyType
> {
  /**
   * Invoke the function to obtain HasOneRepository.
   */
  (fkValue: ForeignKeyType): HasOneRepository<Target>;

  /**
   * Use `resolver` property to obtain an InclusionResolver for this relation.
   */
  inclusionResolver: InclusionResolver<Entity, Target>;
}
/**
 * Enforces a constraint on a repository based on a relationship contract
 * between models. For example, if a Customer model is related to an Address model
 * via a HasOne relation, then, the relational repository returned by the
 * factory function would be constrained by a Customer model instance's id(s).
 *
 * @param relationMetadata - The relation metadata used to describe the
 * relationship and determine how to apply the constraint.
 * @param targetRepositoryGetter - The repository which represents the target model of a
 * relation attached to a datasource.
 * @returns The factory function which accepts a foreign key value to constrain
 * the given target repository
 */
export function createHasOneRepositoryFactory<
  Target extends Entity,
  TargetID,
  ForeignKeyType
>(
  relationMetadata: HasOneDefinition,
  targetRepositoryGetter: Getter<EntityCrudRepository<Target, TargetID>>,
): HasOneRepositoryFactory<Target, ForeignKeyType> {
  const meta = resolveHasOneMetadata(relationMetadata);
  debug('Resolved HasOne relation metadata: %o', meta);
  const result: HasOneRepositoryFactory<Target, ForeignKeyType> = function(
    fkValue: ForeignKeyType,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const constraint: any = {[meta.keyTo]: fkValue};
    return new DefaultHasOneRepository<
      Target,
      TargetID,
      EntityCrudRepository<Target, TargetID>
    >(targetRepositoryGetter, constraint as DataObject<Target>);
  };
  result.inclusionResolver = createHasOneInclusionResolver(
    meta,
    targetRepositoryGetter,
  );
  return result;
}
