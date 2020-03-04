import debugFactory from 'debug';
import {camelCase} from 'lodash';
import {
  DataObject,
  Entity,
  HasManyThroughDefinition,
  InvalidRelationError,
  isTypeResolver,
} from '../..';

const debug = debugFactory('loopback:repository:has-many-through-helpers');

export type HasManyThroughResolvedDefinition = HasManyThroughDefinition & {
  keyTo: string;
  keyFrom: string;
  through: {
    keyTo: string;
    keyFrom: string;
  };
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
  const targetPrimaryKey = relationMeta.keyTo;
  const targetFkName = relationMeta.through.keyTo;
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
  const targetPrimaryKey = relationMeta.keyTo;
  const targetFkName = relationMeta.through.keyTo;
  const sourceFkName = relationMeta.through.keyFrom;
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

  // check if metadata is already complete
  if (
    relationMeta.through?.keyTo &&
    throughModelProperties[relationMeta.through.keyTo] &&
    relationMeta.through?.keyFrom &&
    throughModelProperties[relationMeta.through.keyFrom] &&
    relationMeta.keyTo &&
    targetModelProperties[relationMeta.keyTo]
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
    relationMeta.through?.keyFrom ?? camelCase(sourceModel.modelName + '_id');
  if (!throughModelProperties[sourceFkName]) {
    const reason = `through model ${throughModel.name} is missing definition of source foreign key ${sourceFkName}`;
    throw new InvalidRelationError(reason, relationMeta);
  }

  const targetFkName =
    relationMeta.through?.keyTo ?? camelCase(targetModel.modelName + '_id');
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
      keyTo: targetFkName,
      keyFrom: sourceFkName,
    },
  });
}
