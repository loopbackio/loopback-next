// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {DecoratorFactory, MetadataInspector} from '@loopback/core';
import {property} from '../../decorators';
import {relation} from '../relation.decorator';
import {Entity, EntityResolver, PropertyDefinition} from '../../model';
import {BelongsToDefinition, RelationType} from '../relation.types';

/**
 * Decorator for belongsTo
 * @param targetResolver - A resolver function that returns the target model for
 * a belongsTo relation
 * @param definition - Optional metadata for setting up a belongsTo relation
 * @param propertyDefinition - Optional metadata for setting up the property
 * @returns A property decorator
 */
export function belongsTo<T extends Entity>(
  targetResolver: EntityResolver<T>,
  definition?: Partial<BelongsToDefinition>,
  propertyDefinition?: Partial<PropertyDefinition>,
) {
  return function (decoratedTarget: Entity, decoratedKey: string) {
    const propType =
      MetadataInspector.getDesignTypeForProperty(
        decoratedTarget,
        decoratedKey,
      ) ?? propertyDefinition?.type;

    if (!propType) {
      const fullPropName = DecoratorFactory.getTargetName(
        decoratedTarget,
        decoratedKey,
      );
      throw new Error(
        `Cannot infer type of model property ${fullPropName} because ` +
          'TypeScript compiler option `emitDecoratorMetadata` is not set. ' +
          'Please enable `emitDecoratorMetadata` or use the third argument of ' +
          '`@belongsTo` decorator to specify the property type explicitly.',
      );
    }

    const propMeta: PropertyDefinition = Object.assign(
      {},
      // properties provided by the caller
      propertyDefinition,
      // properties enforced by the decorator
      {
        type: propType,
        // TODO(bajtos) Make the foreign key required once our REST API layer
        // allows controller methods to exclude required properties
        // required: true,
      },
    );
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
        targetsMany: false,
        source: decoratedTarget.constructor,
        target: targetResolver,
      },
    );
    relation(meta)(decoratedTarget, decoratedKey);
  };
}
