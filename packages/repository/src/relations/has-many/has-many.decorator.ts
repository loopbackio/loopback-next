// Copyright IBM Corp. and LoopBack contributors 2018,2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Entity, EntityResolver} from '../../model';
import {relation} from '../relation.decorator';
import {HasManyDefinition, RelationType} from '../relation.types';

/**
 * Decorator for hasMany
 * Calls property.array decorator underneath the hood and infers foreign key
 * name from target model name unless explicitly specified
 * @param targetResolver - Target model for hasMany relation
 * @param definition - Optional metadata for setting up hasMany relation
 * @returns A property decorator
 */
export function hasMany<T extends Entity>(
  targetResolver: EntityResolver<T>,
  definition?: Partial<HasManyDefinition>,
) {
  return function (decoratedTarget: object, key: string) {
    const meta: HasManyDefinition = Object.assign(
      // default values, can be customized by the caller
      {name: key},
      // properties provided by the caller
      definition,
      // properties enforced by the decorator
      {
        type: RelationType.hasMany,
        targetsMany: true,
        source: decoratedTarget.constructor,
        target: targetResolver,
      },
    );
    relation(meta)(decoratedTarget, key);
  };
}
