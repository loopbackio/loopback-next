// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Filter, Inclusion, ensureFields} from '@loopback/filter';
import debugFactory from 'debug';
import {AnyObject, Options} from '../../common-types';
import {Entity} from '../../model';
import {EntityCrudRepository} from '../../repositories/repository';
import {
  findByForeignKeys,
  flattenTargetsOfOneToManyRelation,
  StringKeyOf,
} from '../relation.helpers';
import {Getter, HasManyDefinition, InclusionResolver} from '../relation.types';
import {resolveHasManyMetadata} from './has-many.helpers';

const debug = debugFactory('loopback:repository:has-many-inclusion-resolver');

/**
 * Creates InclusionResolver for HasMany relation.
 * Notice that this function only generates the inclusionResolver.
 * It doesn't register it for the source repository.
 *
 * Notice: scope field for inclusion is not supported yet.
 *
 * @param meta - resolved metadata of the hasMany relation
 * @param getTargetRepo - target repository i.e where related instances are
 */
export function createHasManyInclusionResolver<
  Target extends Entity,
  TargetID,
  TargetRelations extends object
>(
  meta: HasManyDefinition,
  getTargetRepo: Getter<
    EntityCrudRepository<Target, TargetID, TargetRelations>
  >,
): InclusionResolver<Entity, Target> {
  const relationMeta = resolveHasManyMetadata(meta);

  return async function fetchHasManyModels(
    resolveEntities: (fieldsToEnsure: string[]) => Promise<Entity[]>,
    inclusion: Inclusion,
    options?: Options,
  ): Promise<((Target & TargetRelations)[] | undefined)[]> {
    const sourceKey = relationMeta.keyFrom;
    const entities = await resolveEntities([sourceKey]);
    if (!entities.length) return [];

    debug('Fetching target models for entities:', entities);
    debug('Relation metadata:', relationMeta);

    const sourceIds = entities.map(e => (e as AnyObject)[sourceKey]);
    const targetKey = relationMeta.keyTo as StringKeyOf<Target>;

    debug('Parameters:', {sourceKey, sourceIds, targetKey});
    debug(
      'sourceId types',
      sourceIds.map(i => typeof i),
    );

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

    debug('Targets found:', targetsFound);

    const result = flattenTargetsOfOneToManyRelation(
      sourceIds,
      targetsFound,
      targetKey,
      fieldsAdded,
    );

    debug('fetchHasManyModels result', result);
    return result;
  };
}
