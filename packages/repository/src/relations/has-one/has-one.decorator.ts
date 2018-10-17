// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Entity, EntityResolver} from '../../model';
import {relation} from '../relation.decorator';
import {HasOneDefinition, RelationType} from '../relation.types';

/*
 * Decorator for hasOne
 * infers foreign key name from target model name unless explicitly specified
 * @param targetResolver Target model for hasOne relation
 * @param definition Optional metadata for setting up hasOne relation
 * @returns {(target:any, key:string)}
 */
export function hasOne<T extends Entity>(
  targetResolver: EntityResolver<T>,
  definition?: Partial<HasOneDefinition>,
) {
  return function(decoratedTarget: Object, key: string) {
    // property.array(targetResolver)(decoratedTarget, key);

    const meta: HasOneDefinition = Object.assign(
      // default values, can be customized by the caller
      {},
      // properties provided by the caller
      definition,
      // properties enforced by the decorator
      {
        type: RelationType.hasOne,
        name: key,
        source: decoratedTarget.constructor,
        target: targetResolver,
      },
    );
    relation(meta)(decoratedTarget, key);
  };
}
