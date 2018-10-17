// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {MetadataInspector} from '@loopback/context';
import {property} from '../../decorators/model.decorator';
import {Entity, EntityResolver, PropertyDefinition} from '../../model';
import {relation} from '../relation.decorator';
import {BelongsToDefinition, RelationType} from '../relation.types';

/**
 * Decorator for belongsTo
 * @param targetResolver
 * @param definition
 * @returns {(target: Object, key:string)}
 */
export function belongsTo<T extends Entity>(
  targetResolver: EntityResolver<T>,
  definition?: Partial<BelongsToDefinition>,
  propertyMeta?: Partial<PropertyDefinition>,
) {
  return function(decoratedTarget: Entity, decoratedKey: string) {
    const propMeta: PropertyDefinition = {
      type: MetadataInspector.getDesignTypeForProperty(
        decoratedTarget,
        decoratedKey,
      ),
      // TODO(bajtos) Make the foreign key required once our REST API layer
      // allows controller methods to exclude required properties
      // required: true,
    };
    Object.assign(propMeta, propertyMeta);
    property(propMeta)(decoratedTarget, decoratedKey);

    // @belongsTo() is typically decorating the foreign key property,
    // e.g. customerId. We need to strip the trailing "Id" suffix from the name.
    const relationName = decoratedKey.replace(/Id$/, '');

    const meta: BelongsToDefinition = Object.assign(
      // default values, can be customized by the caller
      {
        keyFrom: decoratedKey,
        name: relationName,
      },
      // properties provided by the caller
      definition,
      // properties enforced by the decorator
      {
        type: RelationType.belongsTo,
        source: decoratedTarget.constructor,
        target: targetResolver,
      },
    );
    relation(meta)(decoratedTarget, decoratedKey);
  };
}
