// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as assert from 'assert';
import {Options} from '../common-types';
import {Entity} from '../model';
import {Filter, Where} from '../query';
import {EntityCrudRepository} from '../repositories';

// TODO(bajtos) add test coverage

/**
 * Dedupe an array
 * @param {Array} input an array
 * @returns {Array} an array with unique items
 */
export function uniq<T>(input: T[]): T[] {
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

// TODO(bajtos) add test coverage
export function isBsonType(value: unknown): value is object {
  if (typeof value !== 'object' || !value) return false;

  // bson@1.x stores _bsontype on ObjectID instance, bson@4.x on prototype
  return check(value) || check(value.constructor.prototype);

  function check(target: unknown) {
    return Object.prototype.hasOwnProperty.call(target, '_bsontype');
  }
}

// TODO(bajtos) add test coverage
export function findByForeignKeys<
  Target extends Entity,
  TargetID,
  Relations extends object,
  ForeignKey
>(
  targetRepository: EntityCrudRepository<Target, TargetID, Relations>,
  fkName: keyof Target,
  fkValues: ForeignKey[],
  scope?: Filter<Target>,
  options?: Options,
): Promise<(Target & Relations)[]> {
  const where = ({
    [fkName]: {inq: fkValues},
  } as unknown) as Where<Target>;

  // TODO(bajtos) take into account scope fields like pagination, fields, etc
  const targetFilter = {where};

  // TODO(bajtos) split the query into multiple smaller ones when inq is large.
  return targetRepository.find(targetFilter);
}
