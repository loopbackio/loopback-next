// Copyright IBM Corp. and LoopBack contributors 2018,2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import debugFactory from 'debug';
import {DataObject} from '../../common-types';
import {Entity} from '../../model';
import {EntityCrudRepository} from '../../repositories/repository';
import {
  Getter,
  InclusionResolver,
  ReferencesManyDefinition,
} from '../relation.types';
import {resolveReferencesManyMetadata} from './references-many.helpers';
import {createReferencesManyInclusionResolver} from './references-many.inclusion-resolver';
import {DefaultReferencesManyRepository} from './references-many.repository';

const debug = debugFactory(
  'loopback:repository:relations:references-many:accessor',
);

export interface ReferencesManyAccessor<Target extends Entity, SourceId> {
  /**
   * Invoke the function to obtain HasManyRepository.
   */
  (sourceId: SourceId): Promise<Target>;

  /**
   * Use `resolver` property to obtain an InclusionResolver for this relation.
   */
  inclusionResolver: InclusionResolver<Entity, Target>;
}

/**
 * Enforces a ReferencesMany constraint on a repository
 */
export function createReferencesManyAccessor<
  Target extends Entity,
  TargetIds,
  Source extends Entity,
  SourceId,
>(
  referencesManyMetadata: ReferencesManyDefinition,
  targetRepoGetter: Getter<EntityCrudRepository<Target, TargetIds>>,
  sourceRepository: EntityCrudRepository<Source, SourceId>,
): ReferencesManyAccessor<Target, SourceId> {
  const meta = resolveReferencesManyMetadata(referencesManyMetadata);
  debug('Resolved ReferencesMany relation metadata: %o', meta);
  const result: ReferencesManyAccessor<Target, SourceId> =
    async function getTargetInstancesOfReferencesMany(sourceId: SourceId) {
      const foreignKey = meta.keyFrom;
      const primaryKey = meta.keyTo;
      const sourceModel = await sourceRepository.findById(sourceId);
      const foreignKeyValue = sourceModel[foreignKey as keyof Source];
      // workaround to check referential integrity.
      // should be removed once the memory connector ref integrity is done
      // GH issue: https://github.com/loopbackio/loopback-next/issues/2333
      if (!foreignKeyValue) {
        return undefined as unknown as Target;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const constraint: any = {[primaryKey]: foreignKeyValue};
      const constrainedRepo = new DefaultReferencesManyRepository(
        targetRepoGetter,
        constraint as DataObject<Target>,
      );
      return constrainedRepo.get();
    };

  result.inclusionResolver = createReferencesManyInclusionResolver(
    meta,
    targetRepoGetter,
  );
  return result;
}
