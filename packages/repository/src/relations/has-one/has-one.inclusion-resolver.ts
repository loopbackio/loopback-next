// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Filter, Inclusion, ensureFields} from '@loopback/filter';
import {AnyObject, Options} from '../../common-types';
import {Entity} from '../../model';
import {EntityCrudRepository} from '../../repositories/repository';
import {
  findByForeignKeys,
  flattenTargetsOfOneToOneRelation,
  StringKeyOf,
} from '../relation.helpers';
import {Getter, HasOneDefinition, InclusionResolver} from '../relation.types';
import {resolveHasOneMetadata} from './has-one.helpers';

/**
 * Creates InclusionResolver for HasOne relation.
 * Notice that this function only generates the inclusionResolver.
 * It doesn't register it for the source repository.
 *
 * Notice: scope field for inclusion is not supported yet.
 *
 * @param meta
 * @param getTargetRepo
 */
export function createHasOneInclusionResolver<
  Target extends Entity,
  TargetID,
  TargetRelations extends object
>(
  meta: HasOneDefinition,
  getTargetRepo: Getter<
    EntityCrudRepository<Target, TargetID, TargetRelations>
  >,
): InclusionResolver<Entity, Target> {
  const relationMeta = resolveHasOneMetadata(meta);

  return async function fetchHasOneModel(
    resolveEntities: (fieldsToEnsure: string[]) => Promise<Entity[]>,
    inclusion: Inclusion,
    options?: Options,
  ): Promise<((Target & TargetRelations) | undefined)[]> {
    const sourceKey = relationMeta.keyFrom;
    const entities = await resolveEntities([sourceKey]);
    if (!entities.length) return [];

    const sourceIds = entities.map(e => (e as AnyObject)[sourceKey]);
    const targetKey = relationMeta.keyTo as StringKeyOf<Target>;

    const {filter: scope, fieldsAdded} = ensureFields(
      [targetKey],
      inclusion.scope as Filter<Target & TargetRelations>,
    );
    const targetRepo = await getTargetRepo();
    const targetsFound = await findByForeignKeys(
      targetRepo,
      targetKey,
      sourceIds,
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
