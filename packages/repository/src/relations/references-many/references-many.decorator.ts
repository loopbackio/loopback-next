// Copyright IBM Corp. and LoopBack contributors 2018,2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {DecoratorFactory, MetadataInspector} from '@loopback/core';
import {property} from '../../decorators';
import {Entity, EntityResolver, PropertyDefinition} from '../../model';
import {relation} from '../relation.decorator';
import {ReferencesManyDefinition, RelationType} from '../relation.types';

/**
 * Decorator for referencesMany
 * @param targetResolver - A resolver function that returns the target model for
 * a referencesMany relation
 * @param definition - Optional metadata for setting up a referencesMany relation
 * @param propertyDefinition - Optional metadata for setting up the property
 * @returns A property decorator
 */
export function referencesMany<T extends Entity>(
  targetResolver: EntityResolver<T>,
  definition?: Partial<ReferencesManyDefinition>,
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
          '`@referencesMany` decorator to specify the property type explicitly.',
      );
    }

    const sourceKeyType = MetadataInspector.getDesignTypeForProperty(
      targetResolver().prototype,
      definition?.keyTo ?? 'id',
    );

    if (!sourceKeyType) {
      const fullPropName = DecoratorFactory.getTargetName(
        targetResolver().prototype,
        definition?.keyTo ?? 'id',
      );
      throw new Error(
        `Cannot infer type of model property ${fullPropName} because ` +
          'TypeScript compiler option `emitDecoratorMetadata` is not set. ' +
          'Please enable `emitDecoratorMetadata` or use the second argument of ' +
          '`@referencesMany` decorator to specify the property type explicitly.',
      );
    }

    const propMeta: PropertyDefinition = Object.assign(
      {},
      // properties provided by the caller
      propertyDefinition,
      // properties enforced by the decorator
      {
        type: propType,
        itemType: sourceKeyType,
        // TODO(bajtos) Make the foreign key required once our REST API layer
        // allows controller methods to exclude required properties
        // required: true,
      },
    );
    property(propMeta)(decoratedTarget, decoratedKey);

    // @referencesMany() is typically decorating the foreign key property,
    // e.g. customerIds. We need to strip the trailing "Ids" suffix from the name.
    const relationName = decoratedKey.replace(/Ids$/, 's');

    const meta: ReferencesManyDefinition = Object.assign(
      // default values, can be customized by the caller
      {
        keyFrom: decoratedKey,
        name: relationName,
      },
      // properties provided by the caller
      definition,
      // properties enforced by the decorator
      {
        type: RelationType.referencesMany,
        targetsMany: true,
        source: decoratedTarget.constructor,
        target: targetResolver,
      },
    );
    relation(meta)(decoratedTarget, decoratedKey);
  };
}
