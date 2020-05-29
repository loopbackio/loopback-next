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
  StringKeyOf,
} from '../..';
import {resolveHasManyMetaHelper} from './has-many.helpers';

const debug = debugFactory('loopback:repository:has-many-through-helpers');

export type HasManyThroughResolvedDefinition = HasManyDefinition & {
  keyTo: string;
  keyFrom: string;
  through: {
    keyTo: string;
    keyFrom: string;
  };
};

/**
 * Creates constraint used to query target
 * @param relationMeta - resolved hasManyThrough metadata
 * @param throughInstances - Instances of through entities used to constrain the target
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

 * createTargetConstraint(resolvedMetadata, [
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
export function createTargetConstraint<
  Target extends Entity,
  Through extends Entity
>(
  relationMeta: HasManyThroughResolvedDefinition,
  throughInstances: Through | Through[],
): DataObject<Target> {
  const targetPrimaryKey = relationMeta.keyTo;
  const targetFkName = relationMeta.through.keyTo;
  if (!Array.isArray(throughInstances)) {
    throughInstances = [throughInstances];
  }
  let fkValues = throughInstances.map(
    (throughInstance: Through) =>
      throughInstance[targetFkName as keyof Through],
  );
  fkValues = deduplicate(fkValues);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const constraint: any = {
    [targetPrimaryKey]: fkValues.length === 1 ? fkValues[0] : {inq: fkValues},
  };
  return constraint;
}

/**
 * Creates constraint used to query through model
 *
 * @param relationMeta - resolved hasManyThrough metadata
 * @param fkValue - Value of the foreign key of the source model used to constrain through
 * @param targetInstance - Instance of target entity used to constrain through
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
 * createThroughConstraint(resolvedMetadata, 1);
 *
 * >>> {categoryId: 1}
 * ```
 */
export function createThroughConstraint<Through extends Entity, ForeignKeyType>(
  relationMeta: HasManyThroughResolvedDefinition,
  fkValue: ForeignKeyType,
): DataObject<Through> {
  const sourceFkName = relationMeta.through.keyFrom;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const constraint: any = {[sourceFkName]: fkValue};
  return constraint;
}
/**
 * Creates constraint used to create the through model
 *
 * @param relationMeta - resolved hasManyThrough metadata
 * @param targetInstance instance of target entity used to constrain through
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
 * createThroughConstraint(resolvedMetadata, {id: 3, name: 'a product'});
 *
 * >>> {productId: 1}
 *
 * createThroughConstraint(resolvedMetadata, {id: {inq:[3,4]}});
 *
 * >>> {productId: {inq:[3,4]}}
 */
export function createThroughFkConstraint<Target, Through extends Entity>(
  relationMeta: HasManyThroughResolvedDefinition,
  targetInstance: Target,
): DataObject<Through> {
  const targetKey = relationMeta.keyTo as StringKeyOf<Target>;
  const targetFkName = relationMeta.through.keyTo;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const constraint: any = {
    [targetFkName]: targetInstance[targetKey],
  };
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
    targetModelProperties[relationMeta.keyTo]
  ) {
    // The explict cast is needed because of a limitation of type inference
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

  return Object.assign(relationMeta, {
    keyTo: targetPrimaryKey,
    keyFrom: relationMeta.keyFrom!,
    through: {
      ...relationMeta.through,
      keyTo: targetFkName,
      keyFrom: sourceFkName,
    },
  });
}
