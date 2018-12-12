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
import {Getter, HasOneDefinition} from '../relation.types';
import {DefaultHasOneRepository, HasOneRepository} from './has-one.repository';

const debug = debugFactory('loopback:repository:has-one-repository-factory');

export type HasOneRepositoryFactory<Target extends Entity, ForeignKeyType> = (
  fkValue: ForeignKeyType,
) => HasOneRepository<Target>;

/**
 * Enforces a constraint on a repository based on a relationship contract
 * between models. For example, if a Customer model is related to an Address model
 * via a HasOne relation, then, the relational repository returned by the
 * factory function would be constrained by a Customer model instance's id(s).
 *
 * @param relationMetadata The relation metadata used to describe the
 * relationship and determine how to apply the constraint.
 * @param targetRepositoryGetter The repository which represents the target model of a
 * relation attached to a datasource.
 * @returns The factory function which accepts a foreign key value to constrain
 * the given target repository
 */
export function createHasOneRepositoryFactory<
  Target extends Entity,
  TargetID,
  ForeignKeyType
>(
  relationMetadata: HasOneDefinition,
  targetRepositoryGetter: Getter<EntityCrudRepository<Target, TargetID>>,
): HasOneRepositoryFactory<Target, ForeignKeyType> {
  const meta = resolveHasOneMetadata(relationMetadata);
  debug('Resolved HasOne relation metadata: %o', meta);
  return function(fkValue: ForeignKeyType) {
    // tslint:disable-next-line:no-any
    const constraint: any = {[meta.keyTo]: fkValue};
    return new DefaultHasOneRepository<
      Target,
      TargetID,
      EntityCrudRepository<Target, TargetID>
    >(targetRepositoryGetter, constraint as DataObject<Target>);
  };
}

type HasOneResolvedDefinition = HasOneDefinition & {keyTo: string};

/**
 * Resolves given hasOne metadata if target is specified to be a resolver.
 * Mainly used to infer what the `keyTo` property should be from the target's
 * hasOne metadata
 * @param relationMeta hasOne metadata to resolve
 */
function resolveHasOneMetadata(
  relationMeta: HasOneDefinition,
): HasOneResolvedDefinition {
  if (!isTypeResolver(relationMeta.target)) {
    const reason = 'target must be a type resolver';
    throw new InvalidRelationError(reason, relationMeta);
  }

  if (relationMeta.keyTo) {
    // The explict cast is needed because of a limitation of type inference
    return relationMeta as HasOneResolvedDefinition;
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
