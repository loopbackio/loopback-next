// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/example-todo
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Getter} from '@loopback/context';
import * as debugFactory from 'debug';
import {camelCase} from 'lodash';
import {DataObject, isTypeResolver} from '..';
import {HasManyDefinition} from '../decorators/relation.decorator';
import {Entity} from '../model';
import {
  DefaultHasManyEntityCrudRepository,
  HasManyRepository,
} from './relation.repository';
import {EntityCrudRepository} from './repository';

const debug = debugFactory('loopback:repository:relation-factory');

export type HasManyRepositoryFactory<Target extends Entity, ForeignKeyType> = (
  fkValue: ForeignKeyType,
) => HasManyRepository<Target>;

/**
 * Enforces a constraint on a repository based on a relationship contract
 * between models. For example, if a Customer model is related to an Order model
 * via a HasMany relation, then, the relational repository returned by the
 * factory function would be constrained by a Customer model instance's id(s).
 *
 * @param relationMeta The relation metadata used to describe the
 * relationship and determine how to apply the constraint.
 * @param targetRepo The repository which represents the target model of a
 * relation attached to a datasource.
 * @returns The factory function which accepts a foreign key value to constrain
 * the given target repository
 */
export function createHasManyRepositoryFactory<
  Target extends Entity,
  TargetID,
  ForeignKeyType
>(
  relationMetadata: HasManyDefinition,
  targetRepositoryGetter: Getter<EntityCrudRepository<Target, TargetID>>,
): HasManyRepositoryFactory<Target, ForeignKeyType> {
  const meta = resolveHasManyMetadata(relationMetadata);
  debug('Resolved relation metadata: %o', meta);
  return function(fkValue: ForeignKeyType) {
    // tslint:disable-next-line:no-any
    const constraint: any = {[meta.keyTo]: fkValue};
    return new DefaultHasManyEntityCrudRepository<
      Target,
      TargetID,
      EntityCrudRepository<Target, TargetID>
    >(targetRepositoryGetter, constraint as DataObject<Target>);
  };
}

type HasManyResolvedDefinition = HasManyDefinition & {keyTo: string};

/**
 * Resolves given hasMany metadata if target is specified to be a resolver.
 * Mainly used to infer what the `keyTo` property should be from the target's
 * belongsTo metadata
 * @param relationMeta hasMany metadata to resolve
 */
function resolveHasManyMetadata(
  relationMeta: HasManyDefinition,
): HasManyResolvedDefinition {
  if (!isTypeResolver(relationMeta.target)) {
    const reason = 'target must be a type resolver';
    throw new Error(invalidDefinition(relationMeta, reason));
  }

  if (relationMeta.keyTo) {
    // The explict cast is needed because of a limitation of type inference
    return relationMeta as HasManyResolvedDefinition;
  }

  const sourceModel = relationMeta.source;
  if (!sourceModel || !sourceModel.modelName) {
    const reason = 'source model must be defined';
    throw new Error(invalidDefinition(relationMeta, reason));
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
    throw new Error(invalidDefinition(relationMeta, reason));
  }

  return Object.assign(relationMeta, {keyTo: defaultFkName});
}

function invalidDefinition(relationMeta: HasManyDefinition, reason: string) {
  const source = relationMeta.source;
  const model = (source && source.modelName) || '<Unknown Model>';
  const name = relationMeta.name;
  return `Invalid hasMany definition for ${model}#${name}: ${reason}`;
}
