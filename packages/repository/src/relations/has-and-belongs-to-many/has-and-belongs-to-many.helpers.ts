// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import debugFactory from 'debug';
import {camelCase} from 'lodash';
import {
  DataObject,
  Entity,
  HasAndBelongsToManyDefinition,
  InvalidRelationError,
  isTypeResolver,
} from '../..';

const debug = debugFactory(
  'loopback:repository:relations:has-and-belongs-to-many:helpers',
);

export type HasAndBelongsToManyResolvedDefinition = HasAndBelongsToManyDefinition & {
  keyTo: string;
  keyFrom: string;
  through: {
    sourceKey: string;
    targetKey: string;
  };
};

export function createTargetConstraint<
  Target extends Entity,
  Through extends Entity
>(
  relationMeta: HasAndBelongsToManyResolvedDefinition,
  throughInstances: Through[],
): DataObject<Target> {
  const targetFkName = relationMeta.through.targetKey;
  const targetPrimaryKey = relationMeta.keyTo;
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

export function createThroughConstraint<
  Target extends Entity,
  Through extends Entity,
  ForeignKeyType
>(
  relationMeta: HasAndBelongsToManyResolvedDefinition,
  fkValue?: ForeignKeyType,
  targetInstance?: Target,
): DataObject<Through> {
  const sourceFkName = relationMeta.through.sourceKey;
  const targetFkName = relationMeta.through.targetKey;
  const targetPrimaryKey = relationMeta.keyTo;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const constraint: any = {[sourceFkName]: fkValue};
  if (targetInstance) {
    constraint[targetFkName] = targetInstance[targetPrimaryKey as keyof Target];
  }
  return constraint;
}

export function resolveHasAndBelongsToManyMetadata(
  relationMeta: HasAndBelongsToManyDefinition,
): HasAndBelongsToManyResolvedDefinition {
  if (!relationMeta.source) {
    const reason = 'source model must be defined';
    throw new InvalidRelationError(reason, relationMeta);
  }
  if (!isTypeResolver(relationMeta.target)) {
    const reason = 'target must be a type resolver';
    throw new InvalidRelationError(reason, relationMeta);
  }
  if (!relationMeta.through) {
    const reason = 'through must be specified';
    throw new InvalidRelationError(reason, relationMeta);
  }
  if (!isTypeResolver(relationMeta.through?.model)) {
    const reason = 'through.model must be a type resolver';
    throw new InvalidRelationError(reason, relationMeta);
  }

  const throughModel = relationMeta.through.model();
  const throughModelProperties = throughModel.definition?.properties;

  const targetModel = relationMeta.target();
  const targetModelProperties = targetModel.definition?.properties;

  // Check if metadata is already complete
  if (
    relationMeta.through?.targetKey &&
    throughModelProperties[relationMeta.through.targetKey] &&
    relationMeta.through?.sourceKey &&
    throughModelProperties[relationMeta.through.sourceKey] &&
    relationMeta.keyTo &&
    targetModelProperties[relationMeta.keyTo]
  ) {
    // The explict cast is needed because of a limitation of type inference
    return relationMeta as HasAndBelongsToManyResolvedDefinition;
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
    relationMeta.through?.sourceKey ?? camelCase(sourceModel.modelName + '_id');
  if (!throughModelProperties[sourceFkName]) {
    const reason = `through model ${throughModel.name} is missing definition of source foreign key ${sourceFkName}`;
    throw new InvalidRelationError(reason, relationMeta);
  }

  const targetFkName =
    relationMeta.through?.targetKey ?? camelCase(targetModel.modelName + '_id');
  if (!throughModelProperties[targetFkName]) {
    const reason = `through model ${throughModel.name} is missing definition of target foreign key ${targetFkName}`;
    throw new InvalidRelationError(reason, relationMeta);
  }

  const targetPrimaryKey =
    relationMeta.keyTo ?? targetModel.definition.idProperties()[0];
  if (!targetPrimaryKey || !targetModelProperties[targetPrimaryKey]) {
    const reason = `target model ${targetModel.modelName} does not have any primary key (id property)`;
    throw new InvalidRelationError(reason, relationMeta);
  }

  const sourcePrimaryKey =
    relationMeta.keyFrom ?? sourceModel.definition.idProperties()[0];
  if (!sourcePrimaryKey || !targetModelProperties[sourcePrimaryKey]) {
    const reason = `source model ${sourceModel.modelName} does not have any primary key (id property)`;
    throw new InvalidRelationError(reason, relationMeta);
  }

  return Object.assign(relationMeta, {
    keyTo: targetPrimaryKey,
    keyFrom: sourcePrimaryKey,
    through: {
      ...relationMeta.through,
      targetKey: targetFkName,
      sourceKey: sourceFkName,
    },
  });
}
