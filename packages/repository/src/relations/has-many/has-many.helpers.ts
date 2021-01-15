// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import debugFactory from 'debug';
import {camelCase} from 'lodash';
import {InvalidRelationError} from '../../errors';
import {isTypeResolver} from '../../type-resolver';
import {HasManyDefinition, RelationType} from '../relation.types';

const debug = debugFactory('loopback:repository:relations:has-many:helpers');

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
  // some checks and relationMeta.keyFrom are handled in here
  relationMeta = resolveHasManyMetaHelper(relationMeta);

  const targetModel = relationMeta.target();
  const targetModelProperties = targetModel.definition?.properties;

  const sourceModel = relationMeta.source;

  if (relationMeta.keyTo && targetModelProperties[relationMeta.keyTo]) {
    // The explicit cast is needed because of a limitation of type inference
    return relationMeta as HasManyResolvedDefinition;
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

  return Object.assign(relationMeta, {
    keyTo: defaultFkName,
  } as HasManyResolvedDefinition);
}

/**
 * A helper to check relation type and the existence of the source/target models
 * and set up keyFrom
 * for HasMany(Through) relations
 * @param relationMeta
 *
 * @returns relationMeta that has set up keyFrom
 */
export function resolveHasManyMetaHelper(
  relationMeta: HasManyDefinition,
): HasManyDefinition {
  if ((relationMeta.type as RelationType) !== RelationType.hasMany) {
    const reason = 'relation type must be HasMany';
    throw new InvalidRelationError(reason, relationMeta);
  }

  if (!isTypeResolver(relationMeta.target)) {
    const reason = 'target must be a type resolver';
    throw new InvalidRelationError(reason, relationMeta);
  }

  const sourceModel = relationMeta.source;
  if (!sourceModel || !sourceModel.modelName) {
    const reason = 'source model must be defined';
    throw new InvalidRelationError(reason, relationMeta);
  }
  let keyFrom;
  if (
    relationMeta.keyFrom &&
    relationMeta.source.definition.properties[relationMeta.keyFrom]
  ) {
    keyFrom = relationMeta.keyFrom;
  } else {
    keyFrom = sourceModel.getIdProperties()[0];
  }
  return Object.assign(relationMeta, {keyFrom}) as HasManyDefinition;
}
