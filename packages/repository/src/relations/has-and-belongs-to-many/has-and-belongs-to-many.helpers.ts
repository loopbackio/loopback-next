import debugFactory from 'debug';
import {camelCase} from 'lodash';
import {
  DataObject,
  deduplicate,
  DeepRequired,
  Entity,
  HasAndBelongsToManyDefinition,
  InvalidRelationError,
  isTypeResolver,
  RelationType,
} from '../..';

const debug = debugFactory(
  'loopback:repository:relations:has-and-belongs-to-many:helpers',
);

export type HasAndBelongsToManyResolvedDefinition = DeepRequired<HasAndBelongsToManyDefinition>;

export function resolveHasAndBelongsToManyMetadata(
  relationMeta: HasAndBelongsToManyDefinition,
): HasAndBelongsToManyResolvedDefinition {
  if (
    (relationMeta.type as RelationType) !== RelationType.hasAndBelongsToMany
  ) {
    const reason = 'relation type must be HasAndBelongsToMany';
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

  if (!relationMeta.through) {
    const reason = 'through must be specified';
    throw new InvalidRelationError(reason, relationMeta);
  }

  if (!isTypeResolver(relationMeta.through.model)) {
    const reason = 'through model must be a type resolver';
    throw new InvalidRelationError(reason, relationMeta);
  }

  const throughModel = relationMeta.through.model();
  const throughModelProperties = throughModel.definition?.properties;

  const targetModel = relationMeta.target();
  const targetModelProperties = targetModel.definition?.properties;

  if (
    relationMeta.through.sourceKey &&
    throughModelProperties[relationMeta.through.sourceKey] &&
    relationMeta.through.targetKey &&
    throughModelProperties[relationMeta.through.targetKey] &&
    relationMeta.keyTo &&
    targetModelProperties[relationMeta.keyTo]
  ) {
    // The explicit cast is needed because of a limitation of type inference
    return relationMeta as HasAndBelongsToManyResolvedDefinition;
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
    relationMeta.through.sourceKey ?? camelCase(sourceModel.modelName + '_id');
  if (!throughModelProperties[sourceFkName]) {
    const reason = `through model ${throughModel.name} is missing definition of source foreign key`;
    throw new InvalidRelationError(reason, relationMeta);
  }

  const targetFkName =
    relationMeta.through.targetKey ?? camelCase(targetModel.modelName + '_id');
  if (!throughModelProperties[targetFkName]) {
    const reason = `through model ${throughModel.name} is missing definition of target foreign key`;
    throw new InvalidRelationError(reason, relationMeta);
  }

  const targetPrimaryKey =
    relationMeta.keyTo ?? targetModel.definition.idProperties()[0];
  if (!targetPrimaryKey || !targetModelProperties[targetPrimaryKey]) {
    const reason = `target model ${targetModel.modelName} does not have any primary key (id property)`;
    throw new InvalidRelationError(reason, relationMeta);
  }

  return Object.assign(relationMeta, {
    keyTo: targetPrimaryKey,
    keyFrom: keyFrom,
    through: {
      ...relationMeta.through,
      sourceKey: sourceFkName,
      targetKey: targetFkName,
    },
  });
}

export function createThroughConstraintFromSource<
  Through extends Entity,
  SourceID
>(
  relationMeta: HasAndBelongsToManyResolvedDefinition,
  fkValue: SourceID,
): DataObject<Through> {
  const sourceFkName = relationMeta.through.sourceKey;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const constraint: any = {[sourceFkName]: fkValue};
  return constraint;
}

export function createThroughConstraintFromTarget<
  Through extends Entity,
  TargetID
>(
  relationMeta: HasAndBelongsToManyResolvedDefinition,
  fkValues: TargetID[],
): DataObject<Through> {
  if (fkValues === undefined || fkValues.length === 0) {
    throw new Error('"fkValue" must be provided');
  }
  const targetFkName = relationMeta.through.targetKey;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const constraint: any =
    fkValues.length === 1
      ? {[targetFkName]: fkValues[0]}
      : {[targetFkName]: {inq: fkValues}};
  return constraint as DataObject<Through>;
}

export function createTargetConstraintFromThrough<
  Target extends Entity,
  Through extends Entity
>(
  relationMeta: HasAndBelongsToManyResolvedDefinition,
  throughInstances: Through[],
): DataObject<Target> {
  const fkValues = getTargetKeysFromThroughModels(
    relationMeta,
    throughInstances,
  );
  const targetPrimaryKey = relationMeta.keyTo;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const constraint: any = {
    [targetPrimaryKey]: fkValues.length === 1 ? fkValues[0] : {inq: fkValues},
  };
  return constraint;
}

export function getTargetKeysFromThroughModels<
  Through extends Entity,
  TargetID
>(
  relationMeta: HasAndBelongsToManyResolvedDefinition,
  throughInstances: Through[],
): TargetID[] {
  const targetFkName = relationMeta.through.targetKey;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let fkValues: any = throughInstances.map(
    (throughInstance: Through) =>
      throughInstance[targetFkName as keyof Through],
  );
  fkValues = deduplicate(fkValues);
  return fkValues as TargetID[];
}

export function getTargetIdsFromTargetModels<Target extends Entity, TargetID>(
  relationMeta: HasAndBelongsToManyResolvedDefinition,
  targetInstances: Target[],
): TargetID[] {
  const targetId = relationMeta.keyTo;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let ids = [] as any;
  ids = targetInstances.map(
    (targetInstance: Target) => targetInstance[targetId as keyof Target],
  );
  ids = deduplicate(ids);
  return ids as TargetID[];
}
