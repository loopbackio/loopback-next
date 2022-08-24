// Copyright IBM Corp. and LoopBack contributors 2019,2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import debugFactory from 'debug';
import {camelCase} from 'lodash';
import {InvalidRelationError} from '../../errors';
import {isTypeResolver} from '../../type-resolver';
import {HasOneDefinition, RelationType} from '../relation.types';

const debug = debugFactory('loopback:repository:relations:has-one:helpers');

/**
 * Relation definition with optional metadata (e.g. `keyTo`) filled in.
 * @internal
 */
export type HasOneResolvedDefinition = HasOneDefinition & {
  keyFrom: string;
  keyTo: string;
  polymorphic: false | {discriminator: string};
};

/**
 * Resolves given hasOne metadata if target is specified to be a resolver.
 * Mainly used to infer what the `keyTo` property should be from the target's
 * hasOne metadata
 * @param relationMeta - hasOne metadata to resolve
 * @internal
 */
export function resolveHasOneMetadata(
  relationMeta: HasOneDefinition,
): HasOneResolvedDefinition {
  if ((relationMeta.type as RelationType) !== RelationType.hasOne) {
    const reason = 'relation type must be HasOne';
    throw new InvalidRelationError(reason, relationMeta);
  }

  if (!isTypeResolver(relationMeta.target)) {
    const reason = 'target must be a type resolver';
    throw new InvalidRelationError(reason, relationMeta);
  }

  const targetModel = relationMeta.target();
  const targetModelProperties = targetModel.definition?.properties;

  const sourceModel = relationMeta.source;
  if (!sourceModel?.modelName) {
    const reason = 'source model must be defined';
    throw new InvalidRelationError(reason, relationMeta);
  }

  // keyFrom defaults to id property
  let keyFrom;
  if (
    relationMeta.keyFrom &&
    relationMeta.source.definition.properties[relationMeta.keyFrom]
  ) {
    keyFrom = relationMeta.keyFrom;
  } else {
    keyFrom = sourceModel.getIdProperties()[0];
  }

  let keyTo;
  // Make sure that if it already keys to the foreign key property,
  // the key exists in the target model
  if (relationMeta.keyTo && targetModelProperties[relationMeta.keyTo]) {
    // The explicit cast is needed because of a limitation of type inference
    keyTo = relationMeta.keyTo;
  } else {
    debug(
      'Resolved model %s from given metadata: %o',
      targetModel.modelName,
      targetModel,
    );
    keyTo = camelCase(sourceModel.modelName + '_id');
    const hasDefaultFkProperty = targetModelProperties[keyTo];

    if (!hasDefaultFkProperty) {
      const reason = `target model ${targetModel.name} is missing definition of foreign key ${keyTo}`;
      throw new InvalidRelationError(reason, relationMeta);
    }
  }

  let polymorphic: false | {discriminator: string};
  if (
    relationMeta.polymorphic === undefined ||
    relationMeta.polymorphic === false ||
    !relationMeta.polymorphic
  ) {
    const polymorphicFalse = false as const;
    polymorphic = polymorphicFalse;
  } else {
    if (relationMeta.polymorphic === true) {
      const polymorphicObject: {discriminator: string} = {
        discriminator: camelCase(relationMeta.target().name + '_type'),
      };
      polymorphic = polymorphicObject;
    } else {
      const polymorphicObject: {discriminator: string} =
        relationMeta.polymorphic as {discriminator: string};
      polymorphic = polymorphicObject;
    }
  }

  return Object.assign(relationMeta, {
    keyFrom: keyFrom,
    keyTo: keyTo,
    polymorphic: polymorphic,
  });
}
