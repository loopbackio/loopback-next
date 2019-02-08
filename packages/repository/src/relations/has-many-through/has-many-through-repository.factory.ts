// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/example-todo
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as debugFactory from 'debug';
import {camelCase} from 'lodash';
import {DataObject} from '../../common-types';
import {EntityCrudRepository} from '../../repositories/repository';
import {Entity} from '../../model';
import {Getter, HasManyThroughDefinition} from '../relation.types';
import {EntityNotFoundError, InvalidRelationError} from '../../errors';
import {constrainFilter} from '../../repositories/constraint-utils';
import {isTypeResolver} from '../../type-resolver';
import {
  DefaultHasManyThroughRepository,
  HasManyThroughRepository,
} from './has-many-through.repository';

const debug = debugFactory(
  'loopback:repository:has-many-through-repository-factory',
);

export type HasManyThroughRepositoryFactory<
  Target extends Entity,
  ForeignKeyType
> = (fkValue: ForeignKeyType) => Promise<HasManyThroughRepository<Target>>;

/**
 * Enforces a constraint on a repository based on a relationship contract
 * between models. For example, if a Customer model is related to an Order model
 * via a HasManyThrough relation, then, the relational repository returned by the
 * factory function would be constrained by a Customer model instance's id(s).
 *
 * @param relationMetadata The relation metadata used to describe the
 * relationship and determine how to apply the constraint.
 * @param targetRepositoryGetter The repository which represents the target model of a
 * relation attached to a datasource.
 * @returns The factory function which accepts a foreign key value to constrain
 * the given target repository
 */
export function createHasManyThroughRepositoryFactory<
  Through extends Entity,
  ThroughID,
  Target extends Entity,
  TargetID,
  ForeignKeyType
>(
  relationMetadata: HasManyThroughDefinition,
  getThroughRepository: Getter<EntityCrudRepository<Through, ThroughID>>,
  targetRepositoryGetter: Getter<EntityCrudRepository<Target, TargetID>>,
): HasManyThroughRepositoryFactory<Target, ForeignKeyType> {
  const meta = resolveHasManyThroughMetadata(relationMetadata);
  debug('Resolved HasManyThrough relation metadata: %o', meta);
  return async function(fkValue: ForeignKeyType) {
    // tslint:disable-next-line:no-any
    const throughConstraint: any = {[meta.keyTo]: fkValue};
    const throughRepo = await getThroughRepository();
    const throughInstances = await throughRepo.find(
      constrainFilter(undefined, throughConstraint),
    );
    if (!throughInstances.length) {
      const id = 'through constraint ' + JSON.stringify(throughConstraint);
      throw new EntityNotFoundError(throughRepo.entityClass, id);
    }
    const constraint = {
      or: throughInstances.map((throughInstance: Through) => {
        return {id: throughInstance[meta.targetFkName as keyof Through]};
      }),
    };
    return new DefaultHasManyThroughRepository<
      Target,
      TargetID,
      EntityCrudRepository<Target, TargetID>
    >(targetRepositoryGetter, constraint as DataObject<Target>);
  };
}

type HasManyThroughResolvedDefinition = HasManyThroughDefinition & {
  keyTo: string;
};

/**
 * Resolves given hasManyThrough metadata if target is specified to be a resolver.
 * Mainly used to infer what the `keyTo` property should be from the target's
 * belongsTo metadata
 * @param relationMeta hasManyThrough metadata to resolve
 */
function resolveHasManyThroughMetadata(
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

  if (relationMeta.keyTo) {
    // The explict cast is needed because of a limitation of type inference
    return relationMeta as HasManyThroughResolvedDefinition;
  }

  if (relationMeta.targetFkName) {
    // The explict cast is needed because of a limitation of type inference
    return relationMeta as HasManyThroughResolvedDefinition;
  }

  const sourceModel = relationMeta.source;
  if (!sourceModel || !sourceModel.modelName) {
    const reason = 'source model must be defined';
    throw new InvalidRelationError(reason, relationMeta);
  }

  const throughModel = relationMeta.through();
  debug(
    'Resolved through model %s from given metadata: %o',
    throughModel.modelName,
    throughModel,
  );
  const targetModel = relationMeta.target();
  debug(
    'Resolved model %s from given metadata: %o',
    targetModel.modelName,
    targetModel,
  );

  const defaultFkName = camelCase(sourceModel.modelName + '_id');
  const hasDefaultFkProperty =
    throughModel.definition &&
    throughModel.definition.properties &&
    throughModel.definition.properties[defaultFkName];

  if (!hasDefaultFkProperty) {
    const reason = `through model ${
      throughModel.name
    } is missing definition of foreign key ${defaultFkName}`;
    throw new InvalidRelationError(reason, relationMeta);
  }

  const targetFkName = camelCase(targetModel.modelName + '_id');
  const hasTargetFkProperty =
    throughModel.definition &&
    throughModel.definition.properties &&
    throughModel.definition.properties[targetFkName];
  if (!hasTargetFkProperty) {
    const reason = `through model ${
      throughModel.name
    } is missing definition of target foreign key ${targetFkName}`;
    throw new InvalidRelationError(reason, relationMeta);
  }

  return Object.assign(relationMeta, {keyTo: defaultFkName, targetFkName});
}
