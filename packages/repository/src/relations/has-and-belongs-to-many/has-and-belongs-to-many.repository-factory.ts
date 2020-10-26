import debugFactory from 'debug';
import {
  DataObject,
  DefaultHasAndBelongsToManyRepository,
  Entity,
  EntityCrudRepository,
  Getter,
  HasAndBelongsToManyDefinition,
} from '../..';
import {
  createTargetConstraintFromThrough,
  createThroughConstraintFromSource,
  createThroughConstraintFromTarget,
  getTargetIdsFromTargetModels,
  getTargetKeysFromThroughModels,
  resolveHasAndBelongsToManyMetadata,
} from './has-and-belongs-to-many.helpers';
import {HasAndBelongsToManyRepository} from './has-and-belongs-to-many.repository';

const debug = debugFactory(
  'loopback:repository:relations:has-and-belongs-to-many:repository-factory',
);

export type HasAndBelongsToManyRepositoryFactory<
  TargetEntity extends Entity,
  TargetID,
  SourceID
> = (
  fkValue: SourceID,
) => HasAndBelongsToManyRepository<TargetEntity, TargetID>;

export function createHasAndBelongsToManyRepositoryFactory<
  Through extends Entity,
  Target extends Entity,
  SourceID,
  ThroughID,
  TargetID
>(
  relationMetadata: HasAndBelongsToManyDefinition,
  throughRepositoryGetter: Getter<EntityCrudRepository<Through, ThroughID>>,
  targetRepositoryGetter: Getter<EntityCrudRepository<Target, TargetID>>,
): HasAndBelongsToManyRepositoryFactory<Target, TargetID, SourceID> {
  const meta = resolveHasAndBelongsToManyMetadata(relationMetadata);
  debug('Resolved HasAndBelongsToMany relation metadata: %o', meta);

  return function (fkValue: SourceID) {
    function getThroughConstraintFromSource(): DataObject<Through> {
      return createThroughConstraintFromSource<Through, SourceID>(
        meta,
        fkValue,
      );
    }

    function getThroughConstraintFromTarget(
      fkValues: TargetID[],
    ): DataObject<Through> {
      return createThroughConstraintFromTarget<Through, TargetID>(
        meta,
        fkValues,
      );
    }

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

    function getTargetIds(targetInstances: Target[]): TargetID[] {
      return getTargetIdsFromTargetModels(meta, targetInstances);
    }

    return new DefaultHasAndBelongsToManyRepository<
      EntityCrudRepository<Through, ThroughID>,
      Through,
      ThroughID,
      EntityCrudRepository<Target, TargetID>,
      Target,
      TargetID
    >(
      throughRepositoryGetter,
      targetRepositoryGetter,
      getThroughConstraintFromSource,
      getThroughConstraintFromTarget,
      getTargetConstraintFromThroughModels,
      getTargetKeys,
      getTargetIds,
    );
  };
}
