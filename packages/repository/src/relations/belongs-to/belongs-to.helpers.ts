// Copyright IBM Corp. and LoopBack contributors 2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import debugFactory from 'debug';
import {camelCase} from 'lodash';
import {InvalidRelationError} from '../../errors';
import {isTypeResolver} from '../../type-resolver';
import {BelongsToDefinition, RelationType} from '../relation.types';

const debug = debugFactory('loopback:repository:relations:belongs-to:helpers');

/**
 * Relation definition with optional metadata (e.g. `keyTo`) filled in.
 * @internal
 */
export type BelongsToResolvedDefinition = BelongsToDefinition & {
  keyFrom: string;
  keyTo: string;
  polymorphic: false | {discriminator: string};
};

/**
 * Resolves given belongsTo metadata if target is specified to be a resolver.
 * Mainly used to infer what the `keyTo` property should be from the target's
 * property id metadata
 * @param relationMeta - belongsTo metadata to resolve
 * @internal
 */
export function resolveBelongsToMetadata(
  relationMeta: BelongsToDefinition,
): BelongsToResolvedDefinition {
  if ((relationMeta.type as RelationType) !== RelationType.belongsTo) {
    const reason = 'relation type must be BelongsTo';
    throw new InvalidRelationError(reason, relationMeta);
  }

  if (!isTypeResolver(relationMeta.target)) {
    const reason = 'target must be a type resolver';
    throw new InvalidRelationError(reason, relationMeta);
  }

  const sourceModel = relationMeta.source;
  if (!sourceModel?.modelName) {
    const reason = 'source model must be defined';
    throw new InvalidRelationError(reason, relationMeta);
  }

  const targetModel = relationMeta.target();
  const targetName = targetModel.modelName;
  debug('Resolved model %s from given metadata: %o', targetName, targetModel);

  let keyFrom;
  if (
    relationMeta.keyFrom &&
    relationMeta.source.definition.properties[relationMeta.keyFrom]
  ) {
    keyFrom = relationMeta.keyFrom;
  } else {
    keyFrom = camelCase(targetName + '_id');
  }

  const targetProperties = targetModel.definition.properties;
  debug('relation metadata from %o: %o', targetName, targetProperties);

  let keyTo;
  if (relationMeta.keyTo && targetProperties[relationMeta.keyTo]) {
    // The explicit cast is needed because of a limitation of type inference
    keyTo = relationMeta.keyTo;
  } else {
    keyTo = targetModel.definition.idProperties()[0];
    if (!keyTo) {
      const reason = `${targetName} does not have any primary key (id property)`;
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
    keyFrom,
    keyTo: keyTo,
    polymorphic: polymorphic,
  });
}
