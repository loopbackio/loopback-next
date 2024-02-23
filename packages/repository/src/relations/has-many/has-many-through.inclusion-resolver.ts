// Copyright IBM Corp. and LoopBack contributors 2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Filter, FilterBuilder, InclusionFilter} from '@loopback/filter';
import debugFactory from 'debug';
import _ from 'lodash';
import {InvalidPolymorphismError} from '../..';
import {AnyObject, Options} from '../../common-types';
import {Entity} from '../../model';
import {EntityCrudRepository} from '../../repositories';
import {
  StringKeyOf,
  findByForeignKeys,
  flattenTargetsOfOneToManyRelation,
} from '../relation.helpers';
import {Getter, HasManyDefinition, InclusionResolver} from '../relation.types';
import {resolveHasManyThroughMetadata} from './has-many-through.helpers';

const debug = debugFactory(
  'loopback:repository:relations:has-many-through:inclusion-resolver',
);

/**
 * Creates InclusionResolver for HasManyThrough relation.
 * Notice that this function only generates the inclusionResolver.
 * It doesn't register it for the source repository.
 *
 *
 * @param meta - metadata of the hasMany relation (including through)
 * @param getThroughRepo - through repository getter i.e. where through
 * instances are
 * @param getTargetRepo - target repository getter i.e where target instances
 * are
 */
export function createHasManyThroughInclusionResolver<
  Through extends Entity,
  ThroughID,
  ThroughRelations extends object,
  Target extends Entity,
  TargetID,
  TargetRelations extends object,
>(
  meta: HasManyDefinition,
  getThroughRepo: Getter<
    EntityCrudRepository<Through, ThroughID, ThroughRelations>
  >,
  getTargetRepoDict: {
    [repoType: string]: Getter<
      EntityCrudRepository<Target, TargetID, TargetRelations>
    >;
  },
): InclusionResolver<Entity, Target> {
  const relationMeta = resolveHasManyThroughMetadata(meta);

  return async function fetchHasManyThroughModels(
    entities: Entity[],
    inclusion: InclusionFilter,
    options?: Options,
  ): Promise<((Target & TargetRelations)[] | undefined)[]> {
    if (!relationMeta.through) {
      throw new Error(
        `relationMeta.through must be defined on ${relationMeta}`,
      );
    }

    if (!entities.length) return [];

    debug('Fetching target models for entities:', entities);
    debug('Relation metadata:', relationMeta);

    const sourceKey = relationMeta.keyFrom;
    const sourceIds = entities.map(e => (e as AnyObject)[sourceKey]);
    const targetKey = relationMeta.keyTo as StringKeyOf<Target>;
    if (!relationMeta.through) {
      throw new Error(
        `relationMeta.through must be defined on ${relationMeta}`,
      );
    }
    const throughKeyTo = relationMeta.through.keyTo as StringKeyOf<Through>;
    const throughKeyFrom = relationMeta.through.keyFrom as StringKeyOf<Through>;

    debug('Parameters:', {
      sourceKey,
      sourceIds,
      targetKey,
      throughKeyTo,
      throughKeyFrom,
    });

    debug(
      'sourceId types',
      sourceIds.map(i => typeof i),
    );

    const throughRepo = await getThroughRepo();

    // find through models
    const throughFound = await findByForeignKeys(
      throughRepo,
      throughKeyFrom,
      sourceIds,
      {}, // scope will be applied at the target level
      options,
    );

    const throughResult = flattenTargetsOfOneToManyRelation(
      sourceIds,
      throughFound,
      throughKeyFrom,
    );

    const scope =
      typeof inclusion === 'string'
        ? {}
        : (inclusion.scope as Filter<Target> | undefined);

    // whether the polymorphism is configured
    const targetDiscriminator: keyof (Through & ThroughRelations) | undefined =
      relationMeta.through!.polymorphic
        ? (relationMeta.through!.polymorphic.discriminator as keyof (Through &
            ThroughRelations))
        : undefined;
    if (targetDiscriminator) {
      // put through results into arrays based on the target polymorphic types
      const throughArrayByTargetType: {
        [targetType: string]: (Through & ThroughRelations)[];
      } = {};
      for (const throughArray of throughResult) {
        if (throughArray) {
          for (const throughItem of throughArray) {
            const targetType = String(throughItem[targetDiscriminator]);
            if (!getTargetRepoDict[targetType]) {
              throw new InvalidPolymorphismError(
                targetType,
                String(targetDiscriminator),
              );
            }
            if (!throughArrayByTargetType[targetType]) {
              throughArrayByTargetType[targetType] = [];
            }
            throughArrayByTargetType[targetType].push(throughItem);
          }
        }
      }
      // get targets based on their polymorphic types
      const targetOfTypes: {
        [targetType: string]: (Target & TargetRelations)[];
      } = {};
      for (const targetType of Object.keys(throughArrayByTargetType)) {
        const targetIds = throughArrayByTargetType[targetType].map(
          throughItem => throughItem[throughKeyTo],
        );
        const targetRepo = await getTargetRepoDict[targetType]();
        const targetEntityList = await findByForeignKeys<
          Target,
          TargetRelations,
          StringKeyOf<Target>
        >(targetRepo, targetKey, targetIds as unknown as [], scope, options);
        targetOfTypes[targetType] = targetEntityList;
      }
      // put targets into arrays reflecting their throughs
      // Why the order is correct:
      // e.g. through model = T(target instance), target model 1 = a, target model 2 = b
      // all entities: [S1, S2, S2]
      // through-result: [[T(b-11), T(a-12), T(b-13), T(b-14)], [T(a-21), T(a-22), T(b-23)], [T(b-31), T(b-32), T(a-33)]]
      // through-array-by-target-type: {a:[T(a-12), T(a-21), T(a-22), T(a-33)] b: [T(b-11), T(b-13), T(b-14), T(b-23), T(b-31), T(b-32)]}
      // target-array-by-target-type: {a:[a-12, a-21, a-22, a-33] b: [b-11, b-13, b-14, b-23, b-31, b-32]}
      // merged:
      // through-result[0][0]->b => targets: [[b-11 from b.shift()]]
      // through-result[0][1]->a => targets: [[b-11, a-12 from a.shift()]]
      // through-result[0][2]->b => targets: [[b-11, a-12, b-13 from b.shift()]]
      // through-result[0][3]->b => targets: [[b-11, a-12, b-13, b-14 from b.shift()]]
      // through-result[1][0]->a => targets: [[b-11, a-12, b-13, b-14], [a-21, from a.shift()]]
      // through-result[1][1]->a => targets: [[b-11, a-12, b-13, b-14], [a-21, a-22 from a.shift()]]
      // through-result[1][2]->b => targets: [[b-11, a-12, b-13, b-14], [a-21, a-22, b-23 from b.shift()]]
      // through-result[2][0]->b => targets: [[b-11, a-12, b-13, b-14], [a-21, a-22, b-23], [b-31, from b.shift()]]
      // through-result[2][1]->b => targets: [[b-11, a-12, b-13, b-14], [a-21, a-22, b-23], [b-31, b-32 from b.shift()]]
      // through-result[2][1]->b => targets: [[b-11, a-12, b-13, b-14], [a-21, a-22, b-23], [b-31, b-32, a-33 from a.shift()]]
      const allTargetsOfThrough: ((Target & TargetRelations)[] | undefined)[] =
        [];
      for (const throughArray of throughResult) {
        if (throughArray && throughArray.length > 0) {
          const currentTargetThroughArray: (Target & TargetRelations)[] = [];
          for (const throughItem of throughArray) {
            const itemToAdd =
              targetOfTypes[String(throughItem[targetDiscriminator])].shift();
            if (itemToAdd) {
              currentTargetThroughArray.push(itemToAdd);
            }
          }
          allTargetsOfThrough.push(currentTargetThroughArray);
        } else {
          allTargetsOfThrough.push(undefined);
        }
      }
      return allTargetsOfThrough;
    } else {
      const targetRepo = await getTargetRepoDict[relationMeta.target().name]();
      const result = [];

      // Normalize field filter to an object like {[field]: boolean}
      const filterBuilder = new FilterBuilder<Target>();
      const fieldFilter = filterBuilder.fields(scope?.fields ?? {}).filter
        .fields as {[P in keyof Target]?: boolean};

      // We need targetKey to create a map, as such it always needs to be included.
      // Keep track of whether targetKey should be removed from the final result,
      // whether by explicit omission (targetKey: false) or by implicit omission
      // (anyOtherKey: true but no targetKey: true).
      const omitTargetKeyFromFields =
        (Object.values(fieldFilter).includes(true) &&
          fieldFilter[targetKey] !== true) ||
        fieldFilter[targetKey] === false;

      if (omitTargetKeyFromFields) {
        if (fieldFilter[targetKey] === false) {
          // Undo explicit omission
          delete fieldFilter[targetKey];
        } else {
          // Undo implicit omission
          fieldFilter[targetKey] = true;
        }
      }

      // get target ids from the through entities by foreign key
      const allIds = _.uniq(
        throughResult
          .filter(throughEntitySet => throughEntitySet !== undefined)
          .map(throughEntitySet =>
            throughEntitySet?.map(entity => entity[throughKeyTo]),
          )
          .flat(),
      );

      // Omit limit from scope as those need to be applied per fK
      const targetEntityList = await findByForeignKeys<
        Target,
        TargetRelations,
        StringKeyOf<Target>
      >(
        targetRepo,
        targetKey,
        allIds as unknown as [],
        {..._.omit(scope ?? {}, ['limit', 'fields']), fields: fieldFilter},
        {
          ...options,
          isThroughModelInclude: true,
        },
      );

      const targetEntityIds = targetEntityList.map(
        targetEntity => targetEntity[targetKey],
      );

      const targetEntityMap = Object.fromEntries(
        targetEntityList.map(x => [
          x[targetKey],
          omitTargetKeyFromFields ? _.omit(x, [targetKey]) : x,
        ]),
      );

      // convert from through entities to the target entities
      for (const entityList of throughResult) {
        if (entityList) {
          const relatedIds = entityList.map(x => x[throughKeyTo]);

          // Use the order of the original result set & apply limit
          const sortedIds = _.intersection(
            targetEntityIds as unknown as string[],
            relatedIds as unknown as string[],
          ).slice(0, scope?.limit ?? entityList.length);

          // Make each result its own instance to avoid shenanigans by reference
          result.push(_.cloneDeep(sortedIds.map(x => targetEntityMap[x])));
        } else {
          // no entities found, add undefined to results
          result.push(entityList);
        }
      }

      debug('fetchHasManyThroughModels result', result);
      return result;
    }
  };
}
