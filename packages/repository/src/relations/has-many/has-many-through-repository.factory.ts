// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  DataObject,
  Entity,
  EntityCrudRepository,
  Getter,
  HasManyDefinition,
} from '../..';
import {
  createTargetConstraint,
  createThroughConstraint,
  createThroughFkConstraint,
  resolveHasManyThroughMetadata,
} from './has-many-through.helpers';
import {
  DefaultHasManyThroughRepository,
  HasManyThroughRepository,
} from './has-many-through.repository';

/**
 * a factory to generate hasManyThrough repository class.
 *
 * Warning: The hasManyThrough interface is experimental and is subject to change.
 * If backwards-incompatible changes are made, a new major version may not be
 * released.
 */

export type HasManyThroughRepositoryFactory<
  TargetEntity extends Entity,
  TargetID,
  ThroughEntity extends Entity,
  ForeignKeyType
> = (
  fkValue: ForeignKeyType,
) => HasManyThroughRepository<TargetEntity, TargetID, ThroughEntity>;

export function createHasManyThroughRepositoryFactory<
  Target extends Entity,
  TargetID,
  Through extends Entity,
  ThroughID,
  ForeignKeyType
>(
  relationMetadata: HasManyDefinition,
  targetRepositoryGetter: Getter<EntityCrudRepository<Target, TargetID>>,
  throughRepositoryGetter: Getter<EntityCrudRepository<Through, ThroughID>>,
): HasManyThroughRepositoryFactory<Target, TargetID, Through, ForeignKeyType> {
  const meta = resolveHasManyThroughMetadata(relationMetadata);
  const result = function (fkValue: ForeignKeyType) {
    function getTargetContraint(
      throughInstances: Through | Through[],
    ): DataObject<Target> {
      return createTargetConstraint<Target, Through>(meta, throughInstances);
    }
    function getThroughConstraint(): DataObject<Through> {
      const constriant: DataObject<Through> = createThroughConstraint<
        Through,
        ForeignKeyType
      >(meta, fkValue);
      return constriant;
    }

    function getThroughFkConstraint(
      targetInstance: Target,
    ): DataObject<Through> {
      const constriant: DataObject<Through> = createThroughFkConstraint<
        Target,
        Through
      >(meta, targetInstance);
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
      getThroughFkConstraint,
    );
  };
  return result;
}
