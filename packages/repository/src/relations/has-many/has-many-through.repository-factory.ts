// Copyright IBM Corp. and LoopBack contributors 2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  DataObject,
  Entity,
  EntityCrudRepository,
  Getter,
  HasManyDefinition,
  InclusionResolver,
} from '../..';
import {
  createTargetConstraintFromThrough,
  createThroughConstraintFromSource,
  createThroughConstraintFromTarget,
  getTargetIdsFromTargetModels,
  getTargetKeysFromThroughModels,
  resolveHasManyThroughMetadata,
} from './has-many-through.helpers';
import {createHasManyThroughInclusionResolver} from './has-many-through.inclusion-resolver';
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
  SourceID,
> = {
  (
    fkValue: SourceID,
  ): HasManyThroughRepository<TargetEntity, TargetID, ThroughEntity>;

  /**
   * Use `resolver` property to obtain an InclusionResolver for this relation.
   */
  inclusionResolver: InclusionResolver<Entity, TargetEntity>;
};

export function createHasManyThroughRepositoryFactory<
  Target extends Entity,
  TargetID,
  Through extends Entity,
  ThroughID,
  SourceID,
>(
  relationMetadata: HasManyDefinition,
  targetRepositoryGetter:
    | Getter<EntityCrudRepository<Target, TargetID>>
    | {
        [repoType: string]: Getter<EntityCrudRepository<Target, TargetID>>;
      },
  throughRepositoryGetter: Getter<EntityCrudRepository<Through, ThroughID>>,
): HasManyThroughRepositoryFactory<Target, TargetID, Through, SourceID> {
  const meta = resolveHasManyThroughMetadata(relationMetadata);
  // resolve the repositoryGetter into a dictionary
  if (typeof targetRepositoryGetter === 'function') {
    targetRepositoryGetter = {
      [meta.target().name]: targetRepositoryGetter as Getter<
        EntityCrudRepository<Target, TargetID>
      >,
    };
  }
  const result = function (fkValue: SourceID) {
    function getTargetConstraintFromThroughModels(
      throughInstances: Through[],
    ): DataObject<Target> {
      return createTargetConstraintFromThrough<Target, Through>(
        meta,
        throughInstances,
      );
    }
    function getTargetKeys(throughInstances: Through[]): TargetID[] {
      return getTargetKeysFromThroughModels(meta, throughInstances);
    }
    function getThroughConstraintFromSource(): DataObject<Through> {
      const constraint: DataObject<Through> = createThroughConstraintFromSource<
        Through,
        SourceID
      >(meta, fkValue);
      return constraint;
    }
    function getTargetIds(targetInstances: Target[]): TargetID[] {
      return getTargetIdsFromTargetModels(meta, targetInstances);
    }
    function getThroughConstraintFromTarget(
      fkValues: TargetID[],
    ): DataObject<Through> {
      const constraint: DataObject<Through> = createThroughConstraintFromTarget<
        Through,
        TargetID
      >(meta, fkValues);
      return constraint;
    }

    return new DefaultHasManyThroughRepository<
      Target,
      TargetID,
      EntityCrudRepository<Target, TargetID>,
      Through,
      ThroughID,
      EntityCrudRepository<Through, ThroughID>
    >(
      targetRepositoryGetter as {
        [repoType: string]: Getter<EntityCrudRepository<Target, TargetID>>;
      },
      throughRepositoryGetter,
      getTargetConstraintFromThroughModels,
      getTargetKeys,
      getThroughConstraintFromSource,
      getTargetIds,
      getThroughConstraintFromTarget,
      relationMetadata.target,
      relationMetadata.through!.model,
    );
  };
  result.inclusionResolver = createHasManyThroughInclusionResolver(
    meta,
    throughRepositoryGetter,
    targetRepositoryGetter as {
      [repoType: string]: Getter<EntityCrudRepository<Target, TargetID>>;
    },
  );
  return result;
}
