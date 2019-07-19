// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {AnyObject, Options} from '../../common-types';
import {Entity} from '../../model';
import {Filter, Inclusion} from '../../query';
import {EntityCrudRepository} from '../../repositories/repository';
import {
  findByForeignKeys,
  flattenTargetsOfOneToOneRelation,
  StringKeyOf,
  uniq,
} from '../relation.helpers';
import {
  BelongsToDefinition,
  Getter,
  InclusionResolver,
} from '../relation.types';
import {resolveBelongsToMetadata} from './belongs-to.helpers';

export function createBelongsToInclusionResolver<
  Target extends Entity,
  TargetID,
  TargetRelations extends object
>(
  meta: BelongsToDefinition,
  getTargetRepo: Getter<
    EntityCrudRepository<Target, TargetID, TargetRelations>
  >,
): InclusionResolver {
  const relationMeta = resolveBelongsToMetadata(meta);

  return async function fetchIncludedModels(
    entities: Entity[],
    inclusion: Inclusion,
    options?: Options,
  ): Promise<((Target & TargetRelations) | undefined)[]> {
    if (!entities.length) return [];

    const sourceKey = relationMeta.keyFrom;
    const sourceIds = entities.map(e => (e as AnyObject)[sourceKey]);
    const targetKey = relationMeta.keyTo as StringKeyOf<Target>;

    const targetRepo = await getTargetRepo();
    const targetsFound = await findByForeignKeys(
      targetRepo,
      targetKey,
      uniq(sourceIds),
      inclusion.scope as Filter<Target>,
      options,
    );

    return flattenTargetsOfOneToOneRelation(sourceIds, targetsFound, targetKey);
  };
}
