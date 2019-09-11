// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as debugFactory from 'debug';
import {InvalidRelationError} from '../../errors';
import {isTypeResolver} from '../../type-resolver';
import {BelongsToDefinition, RelationType} from '../relation.types';

const debug = debugFactory('loopback:repository:belongs-to-helpers');

/**
 * Relation definition with optional metadata (e.g. `keyTo`) filled in.
 * @internal
 */
export type BelongsToResolvedDefinition = BelongsToDefinition & {keyTo: string};

/**
 * Resolves given belongsTo metadata if target is specified to be a resolver.
 * Mainly used to infer what the `keyTo` property should be from the target's
 * property id metadata
 * @param relationMeta - belongsTo metadata to resolve
 * @internal
 */
export function resolveBelongsToMetadata(relationMeta: BelongsToDefinition) {
  if ((relationMeta.type as RelationType) !== RelationType.belongsTo) {
    const reason = 'relation type must be BelongsTo';
    throw new InvalidRelationError(reason, relationMeta);
  }

  if (!isTypeResolver(relationMeta.target)) {
    const reason = 'target must be a type resolver';
    throw new InvalidRelationError(reason, relationMeta);
  }

  if (!relationMeta.keyFrom) {
    const reason = 'keyFrom is required';
    throw new InvalidRelationError(reason, relationMeta);
  }

  const sourceModel = relationMeta.source;
  if (!sourceModel || !sourceModel.modelName) {
    const reason = 'source model must be defined';
    throw new InvalidRelationError(reason, relationMeta);
  }

  const targetModel = relationMeta.target();
  const targetName = targetModel.modelName;
  debug('Resolved model %s from given metadata: %o', targetName, targetModel);

  const targetProperties = targetModel.definition.properties;
  debug('relation metadata from %o: %o', targetName, targetProperties);

  if (relationMeta.keyTo && targetProperties[relationMeta.keyTo]) {
    // The explicit cast is needed because of a limitation of type inference
    return relationMeta as BelongsToResolvedDefinition;
  }

  const targetPrimaryKey = targetModel.definition.idProperties()[0];
  if (!targetPrimaryKey) {
    const reason = `${targetName} does not have any primary key (id property)`;
    throw new InvalidRelationError(reason, relationMeta);
  }

  return Object.assign(relationMeta, {keyTo: targetPrimaryKey});
}
