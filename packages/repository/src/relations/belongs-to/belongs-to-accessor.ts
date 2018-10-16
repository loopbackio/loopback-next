// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/example-todo
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as debugFactory from 'debug';
import {DataObject} from '../../common-types';
import {InvalidRelationError} from '../../errors';
import {Entity} from '../../model';
import {EntityCrudRepository} from '../../repositories/repository';
import {isTypeResolver} from '../../type-resolver';
import {BelongsToDefinition, Getter} from '../relation.types';
import {DefaultBelongsToRepository} from './belongs-to.repository';

const debug = debugFactory('loopback:repository:belongs-to-accessor');

export type BelongsToAccessor<Target extends Entity, SourceId> = (
  sourceId: SourceId,
) => Promise<Target>;

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
    throw new InvalidRelationError(reason, relationMeta);
  }

  if (!relationMeta.keyFrom) {
    const reason = 'keyFrom is required';
    throw new InvalidRelationError(reason, relationMeta);
  }

  const sourceModel = relationMeta.source;
  if (!sourceModel || !sourceModel.modelName) {
    const reason = 'source model must be defined';
    throw new InvalidRelationError(reason, relationMeta);
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
    throw new InvalidRelationError(reason, relationMeta);
  }

  return Object.assign(relationMeta, {keyTo: targetPrimaryKey});
}
