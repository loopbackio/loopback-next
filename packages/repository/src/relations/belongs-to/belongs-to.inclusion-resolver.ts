// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Filter, InclusionFilter} from '@loopback/filter';
import debugFactory from 'debug';
import {AnyObject, Options} from '../../common-types';
import {Entity} from '../../model';
import {EntityCrudRepository} from '../../repositories/repository';
import {
  deduplicate,
  findByForeignKeys,
  flattenTargetsOfOneToOneRelation,
  StringKeyOf,
} from '../relation.helpers';
import {
  BelongsToDefinition,
  Getter,
  InclusionResolver,
} from '../relation.types';
import {resolveBelongsToMetadata} from './belongs-to.helpers';

const debug = debugFactory(
  'loopback:repository:relations:belongs-to:inclusion-resolver',
);

/**
 * Creates InclusionResolver for BelongsTo relation.
 * Notice that this function only generates the inclusionResolver.
 * It doesn't register it for the source repository.
 *
 * Notice: scope field for inclusion is not supported yet
 *
 * @param meta - resolved BelongsToMetadata
 * @param getTargetRepo - target repository i.e where related instances are
 */
export function createBelongsToInclusionResolver<
  Target extends Entity,
  TargetID,
  TargetRelations extends object
>(
  meta: BelongsToDefinition,
  getTargetRepo: Getter<
    EntityCrudRepository<Target, TargetID, TargetRelations>
  >,
): InclusionResolver<Entity, Target> {
  const relationMeta = resolveBelongsToMetadata(meta);

  return async function fetchIncludedModels(
    entities: Entity[],
    inclusion: InclusionFilter,
    options?: Options,
  ): Promise<((Target & TargetRelations) | undefined)[]> {
    if (!entities.length) return [];

    debug('Fetching target models for entities:', entities);
    debug('Relation metadata:', relationMeta);

    const sourceKey = relationMeta.keyFrom;
    const sourceIds = entities.map(e => (e as AnyObject)[sourceKey]);
    const targetKey = relationMeta.keyTo as StringKeyOf<Target>;
    const dedupedSourceIds = deduplicate(sourceIds);

    debug('Parameters:', {sourceKey, sourceIds, targetKey, dedupedSourceIds});
    debug(
      'SourceId types',
      sourceIds.map(i => typeof i),
    );

    const scope =
      typeof inclusion === 'string' ? {} : (inclusion.scope as Filter<Target>);

    const targetRepo = await getTargetRepo();
    const targetsFound = await findByForeignKeys(
      targetRepo,
      targetKey,
      dedupedSourceIds.filter(e => e),
      scope,
      options,
    );

    debug('Targets found:', targetsFound);

    const result = flattenTargetsOfOneToOneRelation(
      sourceIds,
      targetsFound,
      targetKey,
    );

    debug('InclusionResolver result', result);
    return result;
  };
}
