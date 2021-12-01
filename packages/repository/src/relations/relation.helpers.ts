// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import assert from 'assert';
import debugFactory from 'debug';
import _, {cloneDeep} from 'lodash';
import {
  AnyObject,
  Entity,
  EntityCrudRepository,
  Filter,
  FilterBuilder,
  InclusionFilter,
  Options,
  Where,
} from '..';
const debug = debugFactory('loopback:repository:relation-helpers');

/**
 * Finds model instances that contain any of the provided foreign key values.
 *
 * @param targetRepository - The target repository where the related model instances are found
 * @param fkName - Name of the foreign key
 * @param fkValues - One value or array of values of the foreign key to be included
 * @param scope - Additional scope constraints
 * @param options - Options for the operations
 */
export async function findByForeignKeys<
  Target extends Entity,
  TargetRelations extends object,
  ForeignKey extends StringKeyOf<Target>,
>(
  targetRepository: EntityCrudRepository<Target, unknown, TargetRelations>,
  fkName: ForeignKey,
  fkValues: Target[ForeignKey][] | Target[ForeignKey],
  scope?: Filter<Target> & {totalLimit?: number},
  options?: Options,
): Promise<(Target & TargetRelations)[]> {
  let value;
  scope = cloneDeep(scope);
  if (Array.isArray(fkValues)) {
    if (fkValues.length === 0) return [];
    value = fkValues.length === 1 ? fkValues[0] : {inq: fkValues};
  } else {
    value = fkValues;
  }
  let useScopeFilterGlobally = false;

  // If its an include from a through model, fkValues will be an array.
  // However, in this case we DO want to use the scope in the entire query, not
  // on a per-fk basis
  if (options) {
    useScopeFilterGlobally = options.isThroughModelInclude;
  }

  // If `scope.limit` is not defined, there is no reason to apply the scope to
  // each fk. This is to prevent unecessarily high database query counts.
  // See: https://github.com/loopbackio/loopback-next/issues/8074
  if (!scope?.limit) {
    useScopeFilterGlobally = true;
  }

  // This code is to keep backward compatability.
  // See https://github.com/loopbackio/loopback-next/issues/6832 for more info.
  if (scope?.totalLimit) {
    scope.limit = scope.totalLimit;
    useScopeFilterGlobally = true;
    delete scope.totalLimit;
  }

  const isScopeSet = scope && !_.isEmpty(scope);
  if (isScopeSet && Array.isArray(fkValues) && !useScopeFilterGlobally) {
    // Since there is a scope, there could be a where filter, a limit, an order
    // and we should run the scope in multiple queries so we can respect the
    // scope filter params
    const findPromises = fkValues.map(fk => {
      const where = {[fkName]: fk} as unknown as Where<Target>;
      let localScope = cloneDeep(scope);
      // combine where clause to scope filter
      localScope = new FilterBuilder(localScope).impose({where}).filter;
      return targetRepository.find(localScope, options);
    });
    return Promise.all(findPromises).then(findResults => {
      //findResults is an array of arrays for each scope result, so we need to flatten it before returning it
      return _.flatten(findResults);
    });
  } else {
    const where = {[fkName]: value} as unknown as Where<Target>;

    if (isScopeSet) {
      // combine where clause to scope filter
      scope = new FilterBuilder(scope).impose({where}).filter;
    } else {
      scope = {where} as Filter<Target>;
    }

    return targetRepository.find(scope, options);
  }
}

export type StringKeyOf<T> = Extract<keyof T, string>;

/**
 * Returns model instances that include related models that have a registered
 * resolver.
 *
 * @param targetRepository - The target repository where the model instances are found
 * @param entities - An array of entity instances or data
 * @param include -Inclusion filter
 * @param options - Options for the operations
 */

export async function includeRelatedModels<
  T extends Entity,
  Relations extends object = {},
>(
  targetRepository: EntityCrudRepository<T, unknown, Relations>,
  entities: T[],
  include?: InclusionFilter[],
  options?: Options,
): Promise<(T & Relations)[]> {
  entities = cloneDeep(entities);
  include = cloneDeep(include);
  const result = entities as (T & Relations)[];
  if (!include) return result;

  const invalidInclusions = include.filter(
    inclusionFilter => !isInclusionAllowed(targetRepository, inclusionFilter),
  );
  if (invalidInclusions.length) {
    const msg =
      'Invalid "filter.include" entries: ' +
      invalidInclusions
        .map(inclusionFilter => JSON.stringify(inclusionFilter))
        .join('; ');
    const err = new Error(msg);
    Object.assign(err, {
      code: 'INVALID_INCLUSION_FILTER',
      statusCode: 400,
    });
    throw err;
  }

  const resolveTasks = include.map(async inclusionFilter => {
    const relationName =
      typeof inclusionFilter === 'string'
        ? inclusionFilter
        : inclusionFilter.relation;
    const resolver = targetRepository.inclusionResolvers.get(relationName)!;
    const targets = await resolver(entities, inclusionFilter, options);

    result.forEach((entity, ix) => {
      const src = entity as AnyObject;
      src[relationName] = targets[ix];
    });
  });

  await Promise.all(resolveTasks);

  return result;
}
/**
 * Checks if the resolver of the inclusion relation is registered
 * in the inclusionResolver of the target repository
 *
 * @param targetRepository - The target repository where the relations are registered
 * @param include - Inclusion filter
 */
function isInclusionAllowed<T extends Entity, Relations extends object = {}>(
  targetRepository: EntityCrudRepository<T, unknown, Relations>,
  include: InclusionFilter,
): boolean {
  const relationName = typeof include === 'string' ? include : include.relation;
  if (!relationName) {
    debug('isInclusionAllowed for %j? No: missing relation name', include);
    return false;
  }
  const allowed = targetRepository.inclusionResolvers.has(relationName);
  debug('isInclusionAllowed for %j (relation %s)? %s', include, allowed);
  return allowed;
}

/**
 * Returns an array of instances. The order of arrays is based on
 * the order of sourceIds
 *
 * @param sourceIds - One value or array of values of the target key
 * @param targetEntities - target entities that satisfy targetKey's value (ids).
 * @param targetKey - name of the target key
 *
 */
export function flattenTargetsOfOneToOneRelation<Target extends Entity>(
  sourceIds: unknown[],
  targetEntities: Target[],
  targetKey: StringKeyOf<Target>,
): (Target | undefined)[] {
  const lookup = buildLookupMap<unknown, Target, Target>(
    targetEntities,
    targetKey,
    reduceAsSingleItem,
  );

  return flattenMapByKeys(sourceIds, lookup);
}

/**
 * Returns an array of instances. The order of arrays is based on
 * as a result of one to many relation. The order of arrays is based on
 * the order of sourceIds
 *
 * @param sourceIds - One value or array of values of the target key
 * @param targetEntities - target entities that satisfy targetKey's value (ids).
 * @param targetKey - name of the target key
 *
 */
export function flattenTargetsOfOneToManyRelation<Target extends Entity>(
  sourceIds: unknown[],
  targetEntities: Target[],
  targetKey: StringKeyOf<Target>,
): (Target[] | undefined)[] {
  debug('flattenTargetsOfOneToManyRelation');
  debug('sourceIds', sourceIds);
  debug(
    'sourceId types',
    sourceIds.map(i => typeof i),
  );
  debug('targetEntities', targetEntities);
  debug('targetKey', targetKey);

  const lookup = buildLookupMap<unknown, Target, Target[]>(
    targetEntities,
    targetKey,
    reduceAsArray,
  );

  debug('lookup map', lookup);

  return flattenMapByKeys(sourceIds, lookup);
}

/**
 * Returns an array of instances from the target map. The order of arrays is based on
 * the order of sourceIds
 *
 * @param sourceIds - One value or array of values (of the target key)
 * @param targetMap - a map that matches sourceIds with instances
 */
export function flattenMapByKeys<T>(
  sourceIds: unknown[],
  targetMap: Map<unknown, T>,
): (T | undefined)[] {
  const result: (T | undefined)[] = new Array(sourceIds.length);
  // mongodb: use string as key of targetMap, and convert sourceId to strings
  // to make sure it gets the related instances.
  sourceIds.forEach((id, index) => {
    const key = normalizeKey(id);
    const target = targetMap.get(key);
    result[index] = target;
  });

  return result;
}

/**
 * Returns a map which maps key values(ids) to instances. The instances can be
 * grouped by different strategies.
 *
 * @param list - an array of instances
 * @param keyName - key name of the source
 * @param reducer - a strategy to reduce inputs to single item or array
 */
export function buildLookupMap<Key, InType, OutType = InType>(
  list: InType[],
  keyName: StringKeyOf<InType>,
  reducer: (accumulator: OutType | undefined, current: InType) => OutType,
): Map<Key, OutType> {
  const lookup = new Map<Key, OutType>();
  for (const entity of list) {
    // get a correct key value
    const key = getKeyValue(entity, keyName) as Key;
    // these 3 steps are to set up the map, the map differs according to the reducer.
    const original = lookup.get(key);
    const reduced = reducer(original, entity);
    lookup.set(key, reduced);
  }
  return lookup;
}

/**
 * Returns value of a keyName. Aims to resolve ObjectId problem of Mongo.
 *
 * @param model - target model
 * @param keyName - target key that gets the value from
 */
export function getKeyValue(model: AnyObject, keyName: string) {
  return normalizeKey(model[keyName]);
}

/**
 * Workaround for MongoDB, where the connector returns ObjectID
 * values even for properties configured with "type: string".
 *
 * @param rawKey
 */
export function normalizeKey(rawKey: unknown) {
  if (isBsonType(rawKey)) {
    return rawKey.toString();
  }
  return rawKey;
}

/**
 * Returns an array of instances. For HasMany relation usage.
 *
 * @param acc
 * @param it
 */
export function reduceAsArray<T>(acc: T[] | undefined, it: T) {
  if (acc) acc.push(it);
  else acc = [it];
  return acc;
}
/**
 * Returns a single of an instance. For HasOne and BelongsTo relation usage.
 *
 * @param _acc
 * @param it
 */
export function reduceAsSingleItem<T>(_acc: T | undefined, it: T) {
  return it;
}

/**
 * Dedupe an array
 * @param input - an array of sourceIds
 * @returns an array with unique items
 */
export function deduplicate<T>(input: T[]): T[] {
  const uniqArray: T[] = [];
  if (!input) {
    return uniqArray;
  }
  assert(Array.isArray(input), 'array argument is required');

  const comparableArray = input.map(item => normalizeKey(item));
  for (let i = 0, n = comparableArray.length; i < n; i++) {
    if (comparableArray.indexOf(comparableArray[i]) === i) {
      uniqArray.push(input[i]);
    }
  }
  return uniqArray;
}

/**
 * Checks if the value is BsonType (mongodb)
 * It uses a general way to check the type ,so that it can detect
 * different versions of bson that might be used in the code base.
 * Might need to update in the future.
 *
 * @param value
 */
export function isBsonType(value: unknown): value is object {
  if (typeof value !== 'object' || !value) return false;

  // bson@1.x stores _bsontype on ObjectID instance, bson@4.x on prototype
  return check(value) || check(value.constructor.prototype);

  function check(target: unknown) {
    return Object.prototype.hasOwnProperty.call(target, '_bsontype');
  }
}
