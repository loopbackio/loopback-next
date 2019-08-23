// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as debugFactory from 'debug';
import {camelCase} from 'lodash';
import {InvalidRelationError} from '../../errors';
import {isTypeResolver} from '../../type-resolver';
import {HasManyDefinition, RelationType} from '../relation.types';

const debug = debugFactory('loopback:repository:has-many-helpers');

/**
 * Relation definition with optional metadata (e.g. `keyTo`) filled in.
 * @internal
 */
export type HasManyResolvedDefinition = HasManyDefinition & {
  keyFrom: string;
  keyTo: string;
};

/**
 * Resolves given hasMany metadata if target is specified to be a resolver.
 * Mainly used to infer what the `keyTo` property should be from the target's
 * belongsTo metadata
 * @param relationMeta - hasMany metadata to resolve
 * @internal
 */
export function resolveHasManyMetadata(
  relationMeta: HasManyDefinition,
): HasManyResolvedDefinition {
  if ((relationMeta.type as RelationType) !== RelationType.hasMany) {
    const reason = 'relation type must be HasMany';
    throw new InvalidRelationError(reason, relationMeta);
  }

  if (!isTypeResolver(relationMeta.target)) {
    const reason = 'target must be a type resolver';
    throw new InvalidRelationError(reason, relationMeta);
  }

  const targetModel = relationMeta.target();
  const targetModelProperties =
    targetModel.definition && targetModel.definition.properties;

  const sourceModel = relationMeta.source;
  if (!sourceModel || !sourceModel.modelName) {
    const reason = 'source model must be defined';
    throw new InvalidRelationError(reason, relationMeta);
  }

  const keyFrom = sourceModel.getIdProperties()[0];

  // Make sure that if it already keys to the foreign key property,
  // the key exists in the target model
  if (relationMeta.keyTo && targetModelProperties[relationMeta.keyTo]) {
    // The explicit cast is needed because of a limitation of type inference
    return Object.assign(relationMeta, {keyFrom}) as HasManyResolvedDefinition;
  }

  debug(
    'Resolved model %s from given metadata: %o',
    targetModel.modelName,
    targetModel,
  );
  const defaultFkName = camelCase(sourceModel.modelName + '_id');
  const hasDefaultFkProperty = targetModelProperties[defaultFkName];

  if (!hasDefaultFkProperty) {
    const reason = `target model ${targetModel.name} is missing definition of foreign key ${defaultFkName}`;
    throw new InvalidRelationError(reason, relationMeta);
  }

  return Object.assign(relationMeta, {keyFrom, keyTo: defaultFkName});
}
