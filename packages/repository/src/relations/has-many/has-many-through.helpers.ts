// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import debugFactory from 'debug';
import {camelCase} from 'lodash';
import {
  DataObject,
  deduplicate,
  Entity,
  HasManyDefinition,
  InvalidRelationError,
  isTypeResolver,
} from '../..';
import {resolveHasManyMetaHelper} from './has-many.helpers';

const debug = debugFactory(
  'loopback:repository:relations:has-many-through:helpers',
);

export type HasManyThroughResolvedDefinition = HasManyDefinition & {
  keyTo: string;
  keyFrom: string;
  through: {
    keyTo: string;
    keyFrom: string;
    polymorphic: false | {discriminator: string};
  };
};

/**
 * Creates target constraint based on through models
 * @param relationMeta - resolved hasManyThrough metadata
 * @param throughInstances - an array of through instances
 *
 * @example
 * ```ts
 * const resolvedMetadata = {
 *  // .. other props
 *  keyFrom: 'id',
 *  keyTo: 'id',
 *  through: {
 *    model: () => CategoryProductLink,
 *    keyFrom: 'categoryId',
 *    keyTo: 'productId',
 *  },
 * };
 * createTargetConstraintFromThrough(resolvedMetadata,[{
        id: 2,
        categoryId: 2,
        productId: 8,
      }]);
 * >>> {id: 8}
 * createTargetConstraintFromThrough(resolvedMetadata, [
      {
        id: 2,
        categoryId: 2,
        productId: 8,
      }, {
        id: 1,
        categoryId: 2,
        productId: 9,
      }
  ]);

  >>> {id: {inq: [9, 8]}}
 * ```
 */
export function createTargetConstraintFromThrough<
  Target extends Entity,
  Through extends Entity,
>(
  relationMeta: HasManyThroughResolvedDefinition,
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

/**
 * Returns an array of target fks of the given throughInstances.
 *
 * @param relationMeta - resolved hasManyThrough metadata
 * @param throughInstances - an array of through instances
 *
 * @example
 * ```ts
 * const resolvedMetadata = {
 *  // .. other props
 *  keyFrom: 'id',
 *  keyTo: 'id',
 *  through: {
 *    model: () => CategoryProductLink,
 *    keyFrom: 'categoryId',
 *    keyTo: 'productId',
 *  },
 * };
 * getTargetKeysFromThroughModels(resolvedMetadata,[{
        id: 2,
        categoryId: 2,
        productId: 8,
      }]);
 * >>> [8]
 * getTargetKeysFromThroughModels(resolvedMetadata, [
      {
        id: 2,
        categoryId: 2,
        productId: 8,
      }, {
        id: 1,
        categoryId: 2,
        productId: 9,
      }
  ]);
  >>> [8, 9]
 */
export function getTargetKeysFromThroughModels<
  Through extends Entity,
  TargetID,
>(
  relationMeta: HasManyThroughResolvedDefinition,
  throughInstances: Through[],
): TargetID[] {
  const targetFkName = relationMeta.through.keyTo;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let fkValues: any = throughInstances.map(
    (throughInstance: Through) =>
      throughInstance[targetFkName as keyof Through],
  );
  fkValues = deduplicate(fkValues);
  return fkValues as TargetID[];
}

/**
 * Creates through constraint based on the source key
 *
 * @param relationMeta - resolved hasManyThrough metadata
 * @param fkValue - foreign key of the source instance
 * @internal
 *
 * @example
 * ```ts
 * const resolvedMetadata = {
 *  // .. other props
 *  keyFrom: 'id',
 *  keyTo: 'id',
 *  through: {
 *    model: () => CategoryProductLink,
 *    keyFrom: 'categoryId',
 *    keyTo: 'productId',
 *  },
 * };
 * createThroughConstraintFromSource(resolvedMetadata, 1);
 *
 * >>> {categoryId: 1}
 * ```
 */
export function createThroughConstraintFromSource<
  Through extends Entity,
  SourceID,
>(
  relationMeta: HasManyThroughResolvedDefinition,
  fkValue: SourceID,
): DataObject<Through> {
  const sourceFkName = relationMeta.through.keyFrom;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const constraint: any = {[sourceFkName]: fkValue};
  return constraint;
}

/**
 * Returns an array of target ids of the given target instances.
 *
 * @param relationMeta - resolved hasManyThrough metadata
 * @param targetInstances - an array of target instances
 *
 * @example
 * ```ts
 * const resolvedMetadata = {
 *  // .. other props
 *  keyFrom: 'id',
 *  keyTo: 'id',
 *  through: {
 *    model: () => CategoryProductLink,
 *    keyFrom: 'categoryId',
 *    keyTo: 'productId',
 *  },
 * };
 * getTargetKeysFromTargetModels(resolvedMetadata,[{
        id: 2,
        des: 'a target',
      }]);
 * >>> [2]
 * getTargetKeysFromTargetModels(resolvedMetadata, [
      {
        id: 2,
        des: 'a target',
      }, {
        id: 1,
        des: 'a target',
      }
  ]);
  >>> [2, 1]
 */
export function getTargetIdsFromTargetModels<Target extends Entity, TargetID>(
  relationMeta: HasManyThroughResolvedDefinition,
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

/**
 * Creates through constraint based on the target foreign key
 *
 * @param relationMeta - resolved hasManyThrough metadata
 * @param fkValue an array of the target instance foreign keys
 * @internal
 *
 * @example
 * ```ts
 * const resolvedMetadata = {
 *  // .. other props
 *  keyFrom: 'id',
 *  keyTo: 'id',
 *  through: {
 *    model: () => CategoryProductLink,
 *    keyFrom: 'categoryId',
 *    keyTo: 'productId',
 *  },
 * };
 * createThroughConstraintFromTarget(resolvedMetadata, [3]);
 *
 * >>> {productId: 3}
 *
 * createThroughConstraintFromTarget(resolvedMetadata, [3,4]);
 *
 * >>> {productId: {inq:[3,4]}}
 */
export function createThroughConstraintFromTarget<
  Through extends Entity,
  TargetID,
>(
  relationMeta: HasManyThroughResolvedDefinition,
  fkValues: TargetID[],
): DataObject<Through> {
  if (fkValues === undefined || fkValues.length === 0) {
    throw new Error('"fkValue" must be provided');
  }
  const targetFkName = relationMeta.through.keyTo;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const constraint: any =
    fkValues.length === 1
      ? {[targetFkName]: fkValues[0]}
      : {[targetFkName]: {inq: fkValues}};

  return constraint as DataObject<Through>;
}

/**
 * Resolves given hasMany metadata if target is specified to be a resolver.
 * Mainly used to infer what the `keyTo` property should be from the target's
 * belongsTo metadata
 * @param relationMeta - hasManyThrough metadata to resolve
 * @internal
 */
export function resolveHasManyThroughMetadata(
  relationMeta: HasManyDefinition,
): HasManyThroughResolvedDefinition {
  // some checks and relationMeta.keyFrom are handled in here
  relationMeta = resolveHasManyMetaHelper(relationMeta);

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
    relationMeta.through.keyTo &&
    throughModelProperties[relationMeta.through.keyTo] &&
    relationMeta.through.keyFrom &&
    throughModelProperties[relationMeta.through.keyFrom] &&
    relationMeta.keyTo &&
    targetModelProperties[relationMeta.keyTo] &&
    (relationMeta.through.polymorphic === false ||
      (typeof relationMeta.through.polymorphic === 'object' &&
        relationMeta.through.polymorphic.discriminator.length > 0))
  ) {
    // The explicit cast is needed because of a limitation of type inference
    return relationMeta as HasManyThroughResolvedDefinition;
  }

  const sourceModel = relationMeta.source;

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
    relationMeta.through.keyFrom ?? camelCase(sourceModel.modelName + '_id');
  if (!throughModelProperties[sourceFkName]) {
    const reason = `through model ${throughModel.name} is missing definition of source foreign key`;
    throw new InvalidRelationError(reason, relationMeta);
  }

  const targetFkName =
    relationMeta.through.keyTo ?? camelCase(targetModel.modelName + '_id');
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

  let throughPolymorphic: false | {discriminator: string};
  if (
    relationMeta.through.polymorphic === undefined ||
    relationMeta.through.polymorphic === false ||
    !relationMeta.through.polymorphic
  ) {
    const polymorphicFalse = false as const;
    throughPolymorphic = polymorphicFalse;
  } else {
    if (relationMeta.through.polymorphic === true) {
      const polymorphicObject: {discriminator: string} = {
        discriminator: camelCase(relationMeta.target().name + '_type'),
      };
      throughPolymorphic = polymorphicObject;
    } else {
      const polymorphicObject: {discriminator: string} = relationMeta.through
        .polymorphic as {discriminator: string};
      throughPolymorphic = polymorphicObject;
    }
  }

  return Object.assign(relationMeta, {
    keyTo: targetPrimaryKey,
    keyFrom: relationMeta.keyFrom!,
    through: {
      ...relationMeta.through,
      keyTo: targetFkName,
      keyFrom: sourceFkName,
      polymorphic: throughPolymorphic,
    },
  });
}
