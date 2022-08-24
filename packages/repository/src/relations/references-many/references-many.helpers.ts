// Copyright IBM Corp. and LoopBack contributors 2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import debugFactory from 'debug';
import {camelCase} from 'lodash';
import {InvalidRelationError} from '../../errors';
import {isTypeResolver} from '../../type-resolver';
import {ReferencesManyDefinition, RelationType} from '../relation.types';

const debug = debugFactory(
  'loopback:repository:relations:references-many:helpers',
);

/**
 * Relation definition with optional metadata (e.g. `keyTo`) filled in.
 * @internal
 */
export type ReferencesManyResolvedDefinition = ReferencesManyDefinition & {
  keyFrom: string;
  keyTo: string;
};

/**
 * Resolves given referencesMany metadata if target is specified to be a resolver.
 * Mainly used to infer what the `keyTo` property should be from the target's
 * property id metadata
 * @param relationMeta - referencesMany metadata to resolve
 * @internal
 */
export function resolveReferencesManyMetadata(
  relationMeta: ReferencesManyDefinition,
) {
  if ((relationMeta.type as RelationType) !== RelationType.referencesMany) {
    const reason = 'relation type must be ReferencesMany';
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
    keyFrom = camelCase(targetName + '_ids');
  }

  const targetProperties = targetModel.definition.properties;
  debug('relation metadata from %o: %o', targetName, targetProperties);

  if (relationMeta.keyTo && targetProperties[relationMeta.keyTo]) {
    // The explicit cast is needed because of a limitation of type inference
    return Object.assign(relationMeta, {
      keyFrom,
    }) as ReferencesManyResolvedDefinition;
  }

  const targetPrimaryKey = targetModel.definition.idProperties()[0];
  if (!targetPrimaryKey) {
    const reason = `${targetName} does not have any primary key (id property)`;
    throw new InvalidRelationError(reason, relationMeta);
  }

  return Object.assign(relationMeta, {keyFrom, keyTo: targetPrimaryKey});
}
