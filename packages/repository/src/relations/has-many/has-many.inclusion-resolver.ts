// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {AnyObject, Options} from '../../common-types';
import {Entity} from '../../model';
import {Filter, Inclusion} from '../../query';
import {EntityCrudRepository} from '../../repositories/repository';
import {
  assignTargetsOfOneToManyRelation,
  findByForeignKeys,
  StringKeyOf,
} from '../relation.helpers';
import {Getter, HasManyDefinition, InclusionResolver} from '../relation.types';
import {resolveHasManyMetadata} from './has-many.helpers';

export function createHasManyInclusionResolver<
  Target extends Entity,
  TargetID,
  TargetRelations extends object
>(
  meta: HasManyDefinition,
  getTargetRepo: Getter<
    EntityCrudRepository<Target, TargetID, TargetRelations>
  >,
): InclusionResolver {
  const relationMeta = resolveHasManyMetadata(meta);

  return async function fetchHasManyModels(
    entities: Entity[],
    inclusion: Inclusion<Entity>,
    options?: Options,
  ): Promise<void> {
    if (!entities.length) return;

    const sourceKey = relationMeta.keyFrom;
    const sourceIds = entities.map(e => (e as AnyObject)[sourceKey]);
    const targetKey = relationMeta.keyTo as StringKeyOf<Target>;

    const targetRepo = await getTargetRepo();
    const targetsFound = await findByForeignKeys(
      targetRepo,
      targetKey,
      sourceIds,
      inclusion.scope as Filter<Target>,
      options,
    );

    const linkName = relationMeta.name;

    assignTargetsOfOneToManyRelation(
      entities,
      sourceKey,
      linkName,
      targetsFound,
      targetKey,
    );
  };
}
