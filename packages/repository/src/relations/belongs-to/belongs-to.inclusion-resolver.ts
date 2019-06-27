// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as assert from 'assert';
import {AnyObject} from '../../common-types';
import {Entity} from '../../model';
import {Inclusion} from '../../query';
import {EntityCrudRepository} from '../../repositories/repository';
import {
  BelongsToDefinition,
  Getter,
  InclusionResolver,
} from '../relation.types';
import {
  BelongsToResolvedDefinition,
  resolveBelongsToMetadata,
} from './belongs-to.helpers';

export class BelongsToInclusionResolver<
  Target extends Entity,
  TargetID,
  TargetRelations extends object
> implements InclusionResolver {
  private relationMeta: BelongsToResolvedDefinition;

  constructor(
    relationMeta: BelongsToDefinition,
    protected getTargetRepo: Getter<
      EntityCrudRepository<Target, TargetID, TargetRelations>
    >,
  ) {
    this.relationMeta = resolveBelongsToMetadata(relationMeta);
  }

  async fetchIncludedModels<SourceWithRelations extends Entity>(
    entities: SourceWithRelations[],
    inclusion: Inclusion,
  ): Promise<void> {
    // TODO(bajtos) reject unsupported inclusion options, e.g. "scope"

    const sourceKey = this.relationMeta.keyFrom as keyof SourceWithRelations;
    const targetKey = this.relationMeta.keyTo;
    const sourceIds = entities.map(e => e[sourceKey]);

    // TODO(bajtos) take into account filter fields like pagination
    const targetFilter = {
      [targetKey]: {
        inq: uniq(sourceIds),
      },
    };

    // TODO(bajtos) split the query into multiple smaller ones
    // when inq size is large. We should implement a new helper
    // shared by all inclusion resolvers.
    const targetRepo = await this.getTargetRepo();
    const found = await targetRepo.find(targetFilter);

    // TODO(bajtos) Extract this code into a shared helper
    // Build a lookup map sourceId -> target entity
    const lookup = new Map<TargetID, (Target & TargetRelations)[]>();
    for (const target of found) {
      const fk: TargetID = (target as AnyObject)[targetKey];
      const val = lookup.get(fk) || [];
      val.push(target);
      lookup.set(fk, val);
    }

    for (const source of entities) {
      const targets = lookup.get(source.getId());
      if (!targets || !targets.length) continue;
      const sourceProp = this.relationMeta.name as keyof SourceWithRelations;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      source[sourceProp] = targets[0] as any;
    }
  }
}

// TODO(bajtos) move this to repository-level "helpers" or "utils" file
// and add test coverage!!

/**
 * Dedupe an array
 * @param {Array} input an array
 * @returns {Array} an array with unique items
 */
function uniq<T>(input: T[]): T[] {
  const uniqArray: T[] = [];
  if (!input) {
    return uniqArray;
  }
  assert(Array.isArray(input), 'array argument is required');

  const comparableA = input.map(item =>
    isBsonType(item) ? item.toString() : item,
  );
  for (let i = 0, n = comparableA.length; i < n; i++) {
    if (comparableA.indexOf(comparableA[i]) === i) {
      uniqArray.push(input[i]);
    }
  }
  return uniqArray;
}

// TODO(bajtos) move this to repository-level "helpers" or "utils" file
// and add test coverage!!
function isBsonType(value: unknown): value is object {
  if (typeof value !== 'object' || !value) return false;

  // bson@1.x stores _bsontype on ObjectID instance, bson@4.x on prototype
  return check(value) || check(value.constructor.prototype);

  function check(target: unknown) {
    return Object.prototype.hasOwnProperty.call(target, '_bsontype');
  }
}
