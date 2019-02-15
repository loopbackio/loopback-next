// Copyright IBM Corp. 2017. All Rights Reserved.
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
 * @param targetResolver Target model for hasMany relation
 * @param definition Optional metadata for setting up hasMany relation
 * @returns {(target:any, key:string)}
 */
export function hasMany<T extends Entity>(
  targetResolver: EntityResolver<T>,
  definition?: Partial<HasManyDefinition>,
) {
  return function(decoratedTarget: Object, key: string) {
    const meta: HasManyDefinition = Object.assign(
      // default values, can be customized by the caller
      {name: key},
      // properties provided by the caller
      definition,
      // properties enforced by the decorator
      {
        type: RelationType.hasMany,
        source: decoratedTarget.constructor,
        target: targetResolver,
      },
    );
    relation(meta)(decoratedTarget, key);
  };
}
