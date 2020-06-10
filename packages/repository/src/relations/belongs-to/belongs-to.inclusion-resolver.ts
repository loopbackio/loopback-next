// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {AnyObject, Options} from '../../common-types';
import {Entity} from '../../model';
import {Filter, Inclusion, ensureFields} from '@loopback/filter';
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
    resolveEntities: (fieldsToEnsure: string[]) => Promise<Entity[]>,
    inclusion: Inclusion,
    options?: Options,
  ): Promise<((Target & TargetRelations) | undefined)[]> {
    const sourceKey = relationMeta.keyFrom;
    const entities = await resolveEntities([sourceKey]);
    if (!entities.length) return [];

    const sourceIds = entities.map(e => (e as AnyObject)[sourceKey]);
    const targetKey = relationMeta.keyTo as StringKeyOf<Target>;
    const dedupedSourceIds = deduplicate(sourceIds);

    const {filter: scope, fieldsAdded} = ensureFields(
      [targetKey],
      inclusion.scope as Filter<Target & TargetRelations>,
    );
    const targetRepo = await getTargetRepo();
    const targetsFound = await findByForeignKeys(
      targetRepo,
      targetKey,
      dedupedSourceIds.filter(e => e),
      scope,
      options,
    );

    return flattenTargetsOfOneToOneRelation(
      sourceIds,
      targetsFound,
      targetKey,
      fieldsAdded,
    );
  };
}
