// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Filter, InclusionFilter} from '@loopback/filter';
import debugFactory from 'debug';
import {AnyObject, Options} from '../../common-types';
import {Entity} from '../../model';
import {EntityCrudRepository} from '../../repositories';
import {
  findByForeignKeys,
  flattenTargetsOfOneToOneRelation,
  StringKeyOf,
} from '../relation.helpers';
import {Getter, HasOneDefinition, InclusionResolver} from '../relation.types';
import {resolveHasOneMetadata} from './has-one.helpers';

const debug = debugFactory(
  'loopback:repository:relations:has-one:inclusion-resolver',
);

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

    debug('Parameters:', {sourceKey, sourceIds, targetKey});
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
      sourceIds,
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
