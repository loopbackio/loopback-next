// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as debugFactory from 'debug';
import {DataObject} from '../../common-types';
import {Entity} from '../../model';
import {EntityCrudRepository} from '../../repositories/repository';
import {
  BelongsToDefinition,
  Getter,
  InclusionResolver,
} from '../relation.types';
import {resolveBelongsToMetadata} from './belongs-to.helpers';
import {DefaultBelongsToRepository} from './belongs-to.repository';
import {createBelongsToInclusionResolver} from './belongs-to.inclusion-resolver';

const debug = debugFactory('loopback:repository:belongs-to-accessor');

export interface BelongsToAccessor<Target extends Entity, SourceId> {
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
 * Enforces a BelongsTo constraint on a repository
 */
export function createBelongsToAccessor<
  Target extends Entity,
  TargetId,
  Source extends Entity,
  SourceId
>(
  belongsToMetadata: BelongsToDefinition,
  targetRepoGetter: Getter<EntityCrudRepository<Target, TargetId>>,
  sourceRepository: EntityCrudRepository<Source, SourceId>,
): BelongsToAccessor<Target, SourceId> {
  const meta = resolveBelongsToMetadata(belongsToMetadata);
  debug('Resolved BelongsTo relation metadata: %o', meta);
  const result: BelongsToAccessor<
    Target,
    SourceId
  > = async function getTargetInstanceOfBelongsTo(sourceId: SourceId) {
    const foreignKey = meta.keyFrom;
    const primaryKey = meta.keyTo;
    const sourceModel = await sourceRepository.findById(sourceId);
    const foreignKeyValue = sourceModel[foreignKey as keyof Source];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const constraint: any = {[primaryKey]: foreignKeyValue};
    const constrainedRepo = new DefaultBelongsToRepository(
      targetRepoGetter,
      constraint as DataObject<Target>,
    );
    return constrainedRepo.get();
  };

  result.inclusionResolver = createBelongsToInclusionResolver(
    meta,
    targetRepoGetter,
  );
  return result;
}
