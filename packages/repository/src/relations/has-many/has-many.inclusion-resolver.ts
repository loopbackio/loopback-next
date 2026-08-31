// Copyright IBM Corp. and LoopBack contributors 2019,2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Filter, InclusionFilter} from '@loopback/filter';
import debugFactory from 'debug';
import {AnyObject, Options} from '../../common-types';
import {Entity} from '../../model';
import {EntityCrudRepository} from '../../repositories';
import {
  deduplicate,
  findByForeignKeys,
  flattenTargetsOfOneToManyRelation,
  StringKeyOf,
} from '../relation.helpers';
import {Getter, HasManyDefinition, InclusionResolver} from '../relation.types';
import {resolveHasManyMetadata} from './has-many.helpers';

const debug = debugFactory(
  'loopback:repository:relations:has-many:inclusion-resolver',
);

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
  TargetRelations extends object,
>(
  meta: HasManyDefinition,
  getTargetRepo: Getter<
    EntityCrudRepository<Target, TargetID, TargetRelations>
  >,
): InclusionResolver<Entity, Target> {
  const relationMeta = resolveHasManyMetadata(meta);

  return async function fetchHasManyModels(
    entities: Entity[],
    inclusion: InclusionFilter,
    options?: Options,
  ): Promise<((Target & TargetRelations)[] | undefined)[]> {
    if (!entities.length) return [];

    debug('Fetching target models for entities:', entities);
    debug('Relation metadata:', relationMeta);

    const sourceKey = relationMeta.keyFrom;
    const sourceIds = entities.map(e => (e as AnyObject)[sourceKey]);
    const targetKey = relationMeta.keyTo as StringKeyOf<Target>;

    debug('Parameters:', {sourceKey, sourceIds, targetKey});
    debug(
      'sourceId types',
      sourceIds.map(i => typeof i),
    );

    const scope =
      typeof inclusion === 'string' ? {} : (inclusion.scope as Filter<Target>);

    const targetRepo = await getTargetRepo();
    const targetsFound = await findByForeignKeys(
      targetRepo,
      targetKey,
      // Source ids can contain duplicates (e.g. the same source entity
      // fetched more than once) and undefined/null values (e.g. when the
      // source key field was excluded via a fields filter). Passing the raw
      // array straight through is unsafe: `findByForeignKeys` wraps it in an
      // `{inq: [...]}` where clause and hands that array to the connector
      // by reference, without cloning it first. A connector/query layer
      // that sanitizes an `inq` array in place (e.g. stripping falsy
      // values before running the query) then mutates *this exact array*
      // out from under us - shrinking the very `sourceIds` array we still
      // need below, unmodified, to correctly zip results back onto each
      // original entity. That silently misaligns or truncates the returned
      // array relative to the input entities. Passing a fresh
      // (deduplicated, filtered) array here - never the original
      // `sourceIds` reference - avoids that aliasing entirely, on top of
      // avoiding the redundant/undefined values in the query itself.
      // belongsTo/referencesMany inclusion resolvers already do this;
      // hasMany didn't.
      deduplicate(sourceIds).filter(e => e),
      scope,
      options,
    );

    debug('Targets found:', targetsFound);

    const result = flattenTargetsOfOneToManyRelation(
      sourceIds,
      targetsFound,
      targetKey,
    );

    debug('fetchHasManyModels result', result);
    return result;
  };
}
