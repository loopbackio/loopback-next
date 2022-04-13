// Copyright IBM Corp. and LoopBack contributors 2019,2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Filter, InclusionFilter} from '@loopback/filter';
import {AnyObject, Options} from '../../common-types';
import {Entity} from '../../model';
import {EntityCrudRepository} from '../../repositories';
import {
  deduplicate,
  findByForeignKeys,
  flattenTargetsOfOneToOneRelation,
  StringKeyOf,
} from '../relation.helpers';
import {
  Getter,
  InclusionResolver,
  ReferencesManyDefinition,
} from '../relation.types';
import {resolveReferencesManyMetadata} from './references-many.helpers';

/**
 * Creates InclusionResolver for ReferencesMany relation.
 * Notice that this function only generates the inclusionResolver.
 * It doesn't register it for the source repository.
 *
 * Notice: scope field for inclusion is not supported yet
 *
 * @param meta - resolved ReferencesManyMetadata
 * @param getTargetRepo - target repository i.e where related instances are
 */
export function createReferencesManyInclusionResolver<
  Target extends Entity,
  TargetIds,
  TargetRelations extends object,
>(
  meta: ReferencesManyDefinition,
  getTargetRepo: Getter<
    EntityCrudRepository<Target, TargetIds, TargetRelations>
  >,
): InclusionResolver<Entity, Target> {
  const relationMeta = resolveReferencesManyMetadata(meta);

  return async function fetchIncludedModels(
    entities: Entity[],
    inclusion: InclusionFilter,
    options?: Options,
  ): Promise<(Target & TargetRelations)[][]> {
    if (!entities.length) return [];

    const sourceKey = relationMeta.keyFrom;
    const sourceMap = entities.map(e => (e as AnyObject)[sourceKey]);
    const sourceIds = sourceMap.flat();
    const targetKey = relationMeta.keyTo as StringKeyOf<Target>;
    const dedupedSourceIds = deduplicate(sourceIds);

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

    return sourceMap.map(chainIds => {
      if (!chainIds) return [];
      const targets = flattenTargetsOfOneToOneRelation(
        chainIds,
        targetsFound,
        targetKey,
      );
      return targets.filter((v): v is Target & TargetRelations => v != null);
    });
  };
}
