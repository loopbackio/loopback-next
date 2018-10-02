// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/example-todo
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as debugFactory from 'debug';
import {camelCase} from 'lodash';
import {DataObject, isTypeResolver} from '..';
import {
  BelongsToDefinition,
  HasManyDefinition,
  RelationMetadata,
} from '../decorators/relation.decorator';
import {Entity} from '../model';
import {
  DefaultBelongsToRepository,
  DefaultHasManyEntityCrudRepository,
  Getter,
  HasManyRepository,
} from './relation.repository';
import {EntityCrudRepository} from './repository';

const debug = debugFactory('loopback:repository:relation-factory');

export type HasManyRepositoryFactory<Target extends Entity, ForeignKeyType> = (
  fkValue: ForeignKeyType,
) => HasManyRepository<Target>;

export type BelongsToAccessor<Target extends Entity, SourceId> = (
  sourceId: SourceId,
) => Promise<Target>;

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
  debug('Resolved HasMany relation metadata: %o', meta);
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

/**
 * Enforces a BelongsTo constraint on a repository
 */
export function createBelongsToAccessor<
  Target extends Entity,
  TargetId,
  Source extends Entity,
  SourceId
>(
  belongsToMetadata: BelongsToDefinition,
  targetRepoGetter: Getter<EntityCrudRepository<Target, TargetId>>,
  sourceRepository: EntityCrudRepository<Source, SourceId>,
): BelongsToAccessor<Target, SourceId> {
  const meta = resolveBelongsToMetadata(belongsToMetadata);
  debug('Resolved BelongsTo relation metadata: %o', meta);
  return async function getTargetInstanceOfBelongsTo(sourceId: SourceId) {
    const foreignKey = meta.keyFrom;
    const primaryKey = meta.keyTo;
    const sourceModel = await sourceRepository.findById(sourceId);
    const foreignKeyValue = sourceModel[foreignKey as keyof Source];
    // tslint:disable-next-line:no-any
    const constraint: any = {[primaryKey]: foreignKeyValue};
    const constrainedRepo = new DefaultBelongsToRepository(
      targetRepoGetter,
      constraint as DataObject<Target>,
    );
    return constrainedRepo.get();
  };
}

type BelongsToResolvedDefinition = BelongsToDefinition & {keyTo: string};

/**
 * Resolves given belongsTo metadata if target is specified to be a resolver.
 * Mainly used to infer what the `keyTo` property should be from the target's
 * property id metadata
 * @param relationMeta belongsTo metadata to resolve
 */
function resolveBelongsToMetadata(relationMeta: BelongsToDefinition) {
  if (!isTypeResolver(relationMeta.target)) {
    const reason = 'target must be a type resolver';
    throw new Error(invalidDefinition(relationMeta, reason));
  }

  if (!relationMeta.keyFrom) {
    const reason = 'keyFrom is required';
    throw new Error(invalidDefinition(relationMeta, reason));
  }

  const sourceModel = relationMeta.source;
  if (!sourceModel || !sourceModel.modelName) {
    const reason = 'source model must be defined';
    throw new Error(invalidDefinition(relationMeta, reason));
  }

  const targetModel = relationMeta.target();
  const targetName = targetModel.modelName;
  debug('Resolved model %s from given metadata: %o', targetName, targetModel);

  const targetProperties = targetModel.definition.properties;
  debug('relation metadata from %o: %o', targetName, targetProperties);

  if (relationMeta.keyTo) {
    // The explict cast is needed because of a limitation of type inference
    return relationMeta as BelongsToResolvedDefinition;
  }

  const targetPrimaryKey = targetModel.definition.idProperties()[0];
  if (!targetPrimaryKey) {
    const reason = `${targetName} does not have any primary key (id property)`;
    throw new Error(invalidDefinition(relationMeta, reason));
  }

  return Object.assign(relationMeta, {keyTo: targetPrimaryKey});
}

function invalidDefinition(relationMeta: RelationMetadata, reason: string) {
  const {name, type, source} = relationMeta;
  const model = (source && source.modelName) || '<Unknown Model>';
  return `Invalid ${type} definition for ${model}#${name}: ${reason}`;
}
