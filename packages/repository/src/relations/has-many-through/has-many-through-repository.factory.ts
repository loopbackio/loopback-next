// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/example-todo
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as debugFactory from 'debug';
import {camelCase} from 'lodash';
import {DataObject} from '../../common-types';
import {InvalidRelationError} from '../../errors';
import {Entity} from '../../model';
import {EntityCrudRepository} from '../../repositories/repository';
import {isTypeResolver} from '../../type-resolver';
import {Getter, HasManyThroughDefinition} from '../relation.types';
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
> = (fkValue: ForeignKeyType) => HasManyThroughRepository<Target>;

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
  Target extends Entity,
  TargetID,
  ForeignKeyType
>(
  relationMetadata: HasManyThroughDefinition,
  targetRepositoryGetter: Getter<EntityCrudRepository<Target, TargetID>>,
): HasManyThroughRepositoryFactory<Target, ForeignKeyType> {
  const meta = resolveHasManyThroughMetadata(relationMetadata);
  debug('Resolved HasManyThrough relation metadata: %o', meta);
  return function(fkValue: ForeignKeyType) {
    // tslint:disable-next-line:no-any
    const constraint: any = {[meta.keyTo]: fkValue};
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

  if (relationMeta.keyTo) {
    // The explict cast is needed because of a limitation of type inference
    return relationMeta as HasManyThroughResolvedDefinition;
  }

  const sourceModel = relationMeta.source;
  if (!sourceModel || !sourceModel.modelName) {
    const reason = 'source model must be defined';
    throw new InvalidRelationError(reason, relationMeta);
  }

  const targetModel = relationMeta.target();
  debug(
    'Resolved model %s from given metadata: %o',
    targetModel.modelName,
    targetModel,
  );
  const defaultFkName = camelCase(sourceModel.modelName + '_id');
  const hasDefaultFkProperty =
    targetModel.definition &&
    targetModel.definition.properties &&
    targetModel.definition.properties[defaultFkName];

  if (!hasDefaultFkProperty) {
    const reason = `target model ${
      targetModel.name
    } is missing definition of foreign key ${defaultFkName}`;
    throw new InvalidRelationError(reason, relationMeta);
  }

  return Object.assign(relationMeta, {keyTo: defaultFkName});
}
