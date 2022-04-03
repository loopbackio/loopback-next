// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Filter, InclusionFilter} from '@loopback/filter';
import {includeFieldIfNot, InvalidPolymorphismError} from '../../';
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
 * @param getTargetRepoDict - dictionary of target model type - target repository
 * i.e where related instances for different types are
 */
export function createBelongsToInclusionResolver<
  Target extends Entity,
  TargetID,
  TargetRelations extends object,
>(
  meta: BelongsToDefinition,
  getTargetRepoDict: {
    [repoType: string]: Getter<
      EntityCrudRepository<Target, TargetID, TargetRelations>
    >;
  },
): InclusionResolver<Entity, Target> {
  const relationMeta = resolveBelongsToMetadata(meta);

  return async function fetchBelongsToModel(
    entities: Entity[],
    inclusion: InclusionFilter,
    options?: Options,
  ): Promise<((Target & object) | undefined)[]> {
    if (!entities.length) return [];

    // Source ids are grouped by their target polymorphic types
    // Each type search for target instances and then merge together in a merge-sort-like manner

    const sourceKey = relationMeta.keyFrom;
    const targetKey = relationMeta.keyTo as StringKeyOf<Target>;
    const targetDiscriminator: keyof Entity | undefined =
      relationMeta.polymorphic
        ? (relationMeta.polymorphic.discriminator as keyof Entity)
        : undefined;

    const scope =
      typeof inclusion === 'string' ? {} : (inclusion.scope as Filter<Target>);

    // sourceIds in {targetType -> sourceId}
    const sourceIdsCategorized: {
      [concreteItemType: string]: Target[StringKeyOf<Target>][];
    } = {};
    if (targetDiscriminator) {
      entities.forEach((value, index, allEntites) => {
        const concreteType = String(value[targetDiscriminator]);
        if (!getTargetRepoDict[concreteType]) {
          throw new InvalidPolymorphismError(concreteType, targetDiscriminator);
        }
        if (!sourceIdsCategorized[concreteType]) {
          sourceIdsCategorized[concreteType] = [];
        }
        sourceIdsCategorized[concreteType].push(
          (value as AnyObject)[sourceKey],
        );
      });
    } else {
      const concreteType = relationMeta.target().name;
      if (!getTargetRepoDict[concreteType]) {
        throw new InvalidPolymorphismError(concreteType);
      }
      entities.forEach((value, index, allEntites) => {
        if (!sourceIdsCategorized[concreteType]) {
          sourceIdsCategorized[concreteType] = [];
        }
        sourceIdsCategorized[concreteType].push(
          (value as AnyObject)[sourceKey],
        );
      });
    }

    // Ensure targetKey is included otherwise flatten function cannot work
    const changedTargetKeyField = includeFieldIfNot(scope?.fields, targetKey);
    let needToRemoveTargetKeyFieldLater = false;
    if (changedTargetKeyField !== false) {
      scope.fields = changedTargetKeyField;
      needToRemoveTargetKeyFieldLater = true;
    }
    // Each sourceIds array with same target type extract target instances
    const targetCategorized: {
      [concreteItemType: string]: ((Target & TargetRelations) | undefined)[];
    } = {};
    for (const k of Object.keys(sourceIdsCategorized)) {
      const targetRepo = await getTargetRepoDict[k]();
      const targetsFound = await findByForeignKeys(
        targetRepo,
        targetKey,
        deduplicate(sourceIdsCategorized[k]).filter(e => e),
        scope,
        options,
      );
      targetCategorized[k] = flattenTargetsOfOneToOneRelation(
        sourceIdsCategorized[k],
        targetsFound,
        targetKey,
      );

      // Remove targetKey if should be excluded but included above
      if (needToRemoveTargetKeyFieldLater) {
        targetCategorized[k] = targetCategorized[k].map(e => {
          if (e) {
            delete e[targetKey];
          }
          return e;
        });
      }
    }

    // Merge
    // Why the order is correct:
    // e.g. target model 1 = a, target model 2 = b
    // all entities: [S(a-1), S(a-2), S(b-3), S(a-4), S(b-5)]
    // a-result: [a-1, a-2, a-4]
    // b-result: [b-3, b-4]
    // merged:
    // entities[1]->a => targets: [a-1 from a-result.shift()]
    // entities[2]->a => targets: [a-1, a-2 from a-result.shift()]
    // entities[3]->b => targets: [a-1, a-2, b-3 from b-result.shift()]
    // entities[4]->a => targets: [a-1, a-2, b-3, a-4 from a-result.shift()]
    // entities[5]->b => targets: [a-1, a-2, b-3, a-4, b-5 from b-result.shift()]
    if (targetDiscriminator) {
      const allTargets: ((Target & TargetRelations) | undefined)[] = [];
      entities.forEach((value, index, allEntites) => {
        allTargets.push(
          targetCategorized[String(value[targetDiscriminator])].shift(),
        );
      });
      return allTargets;
    } else {
      return targetCategorized[relationMeta.target().name];
    }
  };
}
