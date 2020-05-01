// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Entity, EntityResolver} from '../../model';
import {relation} from '../relation.decorator';
import {HasAndBelongsToManyDefinition, RelationType} from '../relation.types';

/**
 * Decorator for hasAndBelongsToMany
 * Calls property.array decorator underneath the hood and infers foreign key
 * name from target model name unless explicitly specified
 * @param targetResolver - Target model for hasAndBelongsToMany relation
 * @param throughResolver - Through model for hasAndBelongsToMany relation
 * @param definition - Optional metadata for setting up hasAndBelongsToMany relation
 * @returns A property decorator
 */
export function hasAndBelongsToMany<T extends Entity, U extends Entity>(
  targetResolver: EntityResolver<T>,
  throughResolver: EntityResolver<U>,
  definition?: Partial<HasAndBelongsToManyDefinition>,
) {
  return function (decoratedTarget: object, key: string) {
    const meta: HasAndBelongsToManyDefinition = Object.assign(
      // Default values, can be customized by the caller
      {name: key},
      // Properties provided by the caller
      definition,
      // Properties enforced by the decorator
      {
        type: RelationType.hasAndBelongsToMany,
        targetsMany: true,
        source: decoratedTarget.constructor,
        target: targetResolver,
        through: {
          model: throughResolver,
        },
      },
    );
    relation(meta)(decoratedTarget, key);
  };
}
