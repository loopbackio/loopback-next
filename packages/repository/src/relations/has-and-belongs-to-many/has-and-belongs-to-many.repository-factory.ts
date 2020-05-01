// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import debugFactory from 'debug';
import {
  DataObject,
  Entity,
  EntityCrudRepository,
  Getter,
  HasAndBelongsToManyDefinition,
} from '../..';
import {
  createTargetConstraint,
  createThroughConstraint,
  resolveHasAndBelongsToManyMetadata,
} from './has-and-belongs-to-many.helpers';
import {
  DefaultHasAndBelongsToManyRepository,
  HasAndBelongsToManyRepository,
} from './has-and-belongs-to-many.repository';

const debug = debugFactory(
  'loopback:repository:relations:has-and-belongs-to-many:repository-factory',
);

export type HasAndBelongsToManyRepositoryFactory<
  TargetEntity extends Entity,
  TargetID,
  ForeignKeyType
> = (
  fkValue: ForeignKeyType,
) => HasAndBelongsToManyRepository<TargetEntity, TargetID>;

export function createHasAndBelongsToManyRepositoryFactory<
  TargetEntity extends Entity,
  ThroughEntity extends Entity,
  TargetID,
  ThroughID,
  ForeignKeyType
>(
  relationMetadata: HasAndBelongsToManyDefinition,
  targetRepositoryGetter: Getter<EntityCrudRepository<TargetEntity, TargetID>>,
  throughRepositoryGetter: Getter<
    EntityCrudRepository<ThroughEntity, ThroughID>
  >,
): HasAndBelongsToManyRepositoryFactory<
  TargetEntity,
  TargetID,
  ForeignKeyType
> {
  const meta = resolveHasAndBelongsToManyMetadata(relationMetadata);
  debug('Resolved HasAndBelongsToMany relation metadata: %o', meta);
  return (fkValue: ForeignKeyType) => {
    const getTargetConstraint = (
      throughInstances: ThroughEntity[],
    ): DataObject<TargetEntity> => {
      return createTargetConstraint<TargetEntity, ThroughEntity>(
        meta,
        throughInstances,
      );
    };

    const getThroughConstraint = (
      targetInstance?: TargetEntity,
    ): DataObject<ThroughEntity> => {
      return createThroughConstraint<
        TargetEntity,
        ThroughEntity,
        ForeignKeyType
      >(meta, fkValue, targetInstance);
    };

    return new DefaultHasAndBelongsToManyRepository<
      EntityCrudRepository<TargetEntity, TargetID>,
      EntityCrudRepository<ThroughEntity, ThroughID>,
      TargetEntity,
      ThroughEntity,
      TargetID,
      ThroughID
    >(
      targetRepositoryGetter,
      throughRepositoryGetter,
      getTargetConstraint,
      getThroughConstraint,
    );
  };
}
