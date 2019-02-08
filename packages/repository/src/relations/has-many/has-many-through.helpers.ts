// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as debugFactory from 'debug';
import {DataObject} from '../../common-types';
import {camelCase} from 'lodash';
import {Entity} from '../../model';
import {InvalidRelationError} from '../../errors';
import {isTypeResolver} from '../../type-resolver';
import {HasManyThroughDefinition} from '../relation.types';

const debug = debugFactory('loopback:repository:has-many-through-helpers');

/**
 * Relation definition with optional metadata (e.g. `keyTo`) filled in.
 * @internal
 */
export type HasManyThroughResolvedDefinition = HasManyThroughDefinition & {
  keyTo: string;
  keyThrough: string;
  targetPrimaryKey: string;
};

/**
 * Creates constraint used to query target
 * @param relationMeta - hasManyThrough metadata to resolve
 * @param throughInstances - Instances of through entities used to constrain the target
 * @internal
 */
export function createTargetConstraint<
  Target extends Entity,
  Through extends Entity
>(
  relationMeta: HasManyThroughResolvedDefinition,
  throughInstances: Through[],
): DataObject<Target> {
  const {targetPrimaryKey} = relationMeta;
  const targetFkName = relationMeta.keyThrough;
  const fkValues = throughInstances.map(
    (throughInstance: Through) =>
      throughInstance[targetFkName as keyof Through],
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const constraint: any = {
    [targetPrimaryKey]: fkValues.length === 1 ? fkValues[0] : {inq: fkValues},
  };
  return constraint;
}

/**
 * Creates constraint used to query through
 * @param relationMeta - hasManyThrough metadata to resolve
 * @param fkValue - Value of the foreign key used to constrain through
 * @param targetInstance - Instance of target entity used to constrain through
 * @internal
 */
export function createThroughConstraint<
  Target extends Entity,
  Through extends Entity,
  ForeignKeyType
>(
  relationMeta: HasManyThroughResolvedDefinition,
  fkValue?: ForeignKeyType,
  targetInstance?: Target,
): DataObject<Through> {
  const {targetPrimaryKey} = relationMeta;
  const targetFkName = relationMeta.keyThrough;
  const sourceFkName = relationMeta.keyTo;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const constraint: any = {[sourceFkName]: fkValue};
  if (targetInstance) {
    constraint[targetFkName] = targetInstance[targetPrimaryKey as keyof Target];
  }
  return constraint;
}

/**
 * Resolves given hasMany metadata if target is specified to be a resolver.
 * Mainly used to infer what the `keyTo` property should be from the target's
 * belongsTo metadata
 * @param relationMeta - hasManyThrough metadata to resolve
 * @internal
 */
export function resolveHasManyThroughMetadata(
  relationMeta: HasManyThroughDefinition,
): HasManyThroughResolvedDefinition {
  if (!isTypeResolver(relationMeta.target)) {
    const reason = 'target must be a type resolver';
    throw new InvalidRelationError(reason, relationMeta);
  }
  if (!isTypeResolver(relationMeta.through)) {
    const reason = 'through must be a type resolver';
    throw new InvalidRelationError(reason, relationMeta);
  }

  const throughModel = relationMeta.through();
  const throughModelProperties =
    throughModel.definition && throughModel.definition.properties;
  const targetModel = relationMeta.target();
  const targetModelProperties =
    targetModel.definition && targetModel.definition.properties;

  // Make sure that if it already keys to the foreign key property,
  // the key exists in the target model
  if (
    relationMeta.keyTo &&
    throughModelProperties[relationMeta.keyTo] &&
    relationMeta.keyThrough &&
    throughModelProperties[relationMeta.keyThrough] &&
    relationMeta.targetPrimaryKey &&
    targetModelProperties[relationMeta.targetPrimaryKey]
  ) {
    // The explict cast is needed because of a limitation of type inference
    return relationMeta as HasManyThroughResolvedDefinition;
  }

  const sourceModel = relationMeta.source;
  if (!sourceModel || !sourceModel.modelName) {
    const reason = 'source model must be defined';
    throw new InvalidRelationError(reason, relationMeta);
  }

  debug(
    'Resolved model %s from given metadata: %o',
    targetModel.modelName,
    targetModel,
  );

  debug(
    'Resolved model %s from given metadata: %o',
    throughModel.modelName,
    throughModel,
  );

  const sourceFkName =
    relationMeta.keyTo || camelCase(sourceModel.modelName + '_id');
  const hasSourceFkProperty = throughModelProperties[sourceFkName];
  if (!hasSourceFkProperty) {
    const reason = `through model ${targetModel.name} is missing definition of default foreign key ${sourceFkName}`;
    throw new InvalidRelationError(reason, relationMeta);
  }

  const targetFkName =
    relationMeta.keyThrough || camelCase(targetModel.modelName + '_id');
  const hasTargetFkName = throughModelProperties[targetFkName];
  if (!hasTargetFkName) {
    const reason = `through model ${throughModel.name} is missing definition of target foreign key ${targetFkName}`;
    throw new InvalidRelationError(reason, relationMeta);
  }

  const targetPrimaryKey = targetModel.definition.idProperties()[0];
  if (!targetPrimaryKey) {
    const reason = `target model ${targetModel.modelName} does not have any primary key (id property)`;
    throw new InvalidRelationError(reason, relationMeta);
  }

  return Object.assign(relationMeta, {
    keyTo: sourceFkName,
    keyThrough: targetFkName,
    targetPrimaryKey,
  });
}
