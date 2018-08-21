// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/example-todo
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {EntityCrudRepository} from './repository';
import {
  HasManyDefinition,
  RelationType,
  BelongsToDefinition,
} from '../decorators/relation.decorator';
import {Entity, isTypeResolver} from '../model';
import {
  HasManyRepository,
  DefaultHasManyEntityCrudRepository,
  DefaultBelongsToEntityCrudRepository,
} from './relation.repository';
import {DataObject} from '../common-types';
import {Getter} from '@loopback/context';

const debug = require('debug')('loopback:repository:relation:factory');

const ERR_NO_BELONGSTO_META = 'no belongsTo metadata found';
const ERR_NO_ID_META = 'no id metadata found';

export type HasManyRepositoryFactory<Target extends Entity, ForeignKeyType> = (
  fkValue: ForeignKeyType,
) => HasManyRepository<Target>;

export type BelongsToFactory<Target extends Entity, Source extends Entity> = (
  sourceModel: Source,
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
  targetRepository:
    | EntityCrudRepository<Target, TargetID>
    | Getter<EntityCrudRepository<Target, TargetID>>,
): HasManyRepositoryFactory<Target, ForeignKeyType> {
  resolveHasManyMetadata(relationMetadata);
  debug('resolved relation metadata: %o', relationMetadata);
  const fkName = relationMetadata.keyTo;
  if (!fkName) {
    throw new Error('The foreign key property name (keyTo) must be specified');
  }
  return function(fkValue: ForeignKeyType) {
    // tslint:disable-next-line:no-any
    const constraint: any = {[fkName]: fkValue};
    return new DefaultHasManyEntityCrudRepository<
      Target,
      TargetID,
      EntityCrudRepository<Target, TargetID>
    >(targetRepository, constraint as DataObject<Target>);
  };
}

export function createBelongsToFactory<
  Target extends Entity,
  TargetId,
  Source extends Entity
>(
  belongsToMetadata: BelongsToDefinition,
  targetRepository:
    | EntityCrudRepository<Target, TargetId>
    | Getter<EntityCrudRepository<Target, TargetId>>,
): BelongsToFactory<Target, Source> {
  resolveBelongsToMetadata(belongsToMetadata);
  const foreignKey = belongsToMetadata.keyFrom;
  const primaryKey = belongsToMetadata.keyTo;
  if (!foreignKey) {
    throw new Error(
      'The foreign key property name (keyFrom) must be specified',
    );
  }
  if (!primaryKey) {
    throw new Error('The primary key property name (keyTo) must be specified');
  }
  return async function(sourceModel: Source) {
    const foreignKeyValue = sourceModel[foreignKey as keyof Source];
    // tslint:disable-next-line:no-any
    const constraint: any = {[primaryKey]: foreignKeyValue};
    const constrainedRepo = new DefaultBelongsToEntityCrudRepository(
      targetRepository,
      constraint as DataObject<Target>,
    );
    return constrainedRepo.find();
  };
}

/**
 * Resolves given hasMany metadata if target is specified to be a resolver.
 * Mainly used to infer what the `keyTo` property should be from the target's
 * belongsTo metadata
 * @param relationMeta hasMany metadata to resolve
 */
export function resolveHasManyMetadata(relationMeta: HasManyDefinition) {
  if (
    relationMeta.target &&
    isTypeResolver(relationMeta.target) &&
    !relationMeta.keyTo
  ) {
    const resolvedModel = relationMeta.target();

    debug('resolved model from given metadata: %o', resolvedModel);

    const targetRelationMeta = resolvedModel.definition.relations;

    debug('relation metadata from %o: %o', resolvedModel, targetRelationMeta);

    if (!targetRelationMeta) {
      throw new Error(ERR_NO_BELONGSTO_META);
    }

    let belongsToMetaExists = false;

    for (const key in targetRelationMeta) {
      if (targetRelationMeta[key].type === RelationType.belongsTo) {
        relationMeta.keyTo = key;
        belongsToMetaExists = true;
        break;
      }
    }

    if (!belongsToMetaExists) {
      throw new Error(ERR_NO_BELONGSTO_META);
    }
  }
  return relationMeta;
}

export function resolveBelongsToMetadata(relationMeta: BelongsToDefinition) {
  if (
    relationMeta.target &&
    isTypeResolver(relationMeta.target) &&
    !relationMeta.keyTo
  ) {
    const resolvedModel = relationMeta.target();

    debug('resolved model from given metadata: %o', resolvedModel);

    const targetPropertiesMeta = resolvedModel.definition.properties;

    debug('relation metadata from %o: %o', resolvedModel, targetPropertiesMeta);

    if (!targetPropertiesMeta) {
      throw new Error(ERR_NO_ID_META);
    }

    let idMetaExists = false;

    for (const key in targetPropertiesMeta) {
      if (targetPropertiesMeta[key].id === true) {
        relationMeta.keyTo = key;
        idMetaExists = true;
        break;
      }
    }

    if (!idMetaExists) {
      throw new Error(ERR_NO_ID_META);
    }
  }
  return relationMeta;
}
