// Copyright IBM Corp. and LoopBack contributors 2018,2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import debugFactory from 'debug';
import {DataObject} from '../../common-types';
import {Entity} from '../../model';
import {EntityCrudRepository} from '../../repositories/repository';
import {
  BelongsToDefinition,
  Getter,
  InclusionResolver,
} from '../relation.types';
import {resolveBelongsToMetadata} from './belongs-to.helpers';
import {createBelongsToInclusionResolver} from './belongs-to.inclusion-resolver';
import {DefaultBelongsToRepository} from './belongs-to.repository';

const debug = debugFactory('loopback:repository:relations:belongs-to:accessor');

export interface BelongsToAccessor<Target extends Entity, SourceId> {
  /**
   * Invoke the function to obtain HasManyRepository.
   */
  (sourceId: SourceId, polymorphicTypes?: string | string[]): Promise<Target>;

  /**
   * Use `resolver` property to obtain an InclusionResolver for this relation.
   */
  inclusionResolver: InclusionResolver<Entity, Target>;
}

/**
 * Enforces a BelongsTo constraint on a repository
 * If the target model is polymorphic, i.e. stored within different repositories,
 * supply the targetRepositoryGetter with a dictionary in the form of {[typeName: string]: repositoryGetter}
 */
export function createBelongsToAccessor<
  Target extends Entity,
  TargetId,
  Source extends Entity,
  SourceId,
>(
  belongsToMetadata: BelongsToDefinition,
  targetRepositoryGetter:
    | Getter<EntityCrudRepository<Target, TargetId>>
    | {
        [repoType: string]: Getter<EntityCrudRepository<Target, TargetId>>;
      },
  sourceRepository: EntityCrudRepository<Source, SourceId>,
): BelongsToAccessor<Target, SourceId> {
  const meta = resolveBelongsToMetadata(belongsToMetadata);
  // resolve the repositoryGetter into a dictionary
  if (typeof targetRepositoryGetter === 'function') {
    targetRepositoryGetter = {
      [meta.target().name]: targetRepositoryGetter as Getter<
        EntityCrudRepository<Target, TargetId>
      >,
    };
  }
  debug('Resolved BelongsTo relation metadata: %o', meta);
  const result: BelongsToAccessor<Target, SourceId> =
    async function getTargetInstanceOfBelongsTo(
      sourceId: SourceId,
      polymorphicTypes?: string | string[],
    ) {
      if (meta.polymorphic !== false) {
        if (!polymorphicTypes || polymorphicTypes.length === 0) {
          console.warn(
            'It is highly recommended to specify the polymorphicTypes param when using polymorphic types.',
          );
        }
      }
      const foreignKey = meta.keyFrom;
      const primaryKey = meta.keyTo;
      const sourceModel = await sourceRepository.findById(sourceId);
      const foreignKeyValue = sourceModel[foreignKey as keyof Source];
      // workaround to check referential integrity.
      // should be removed once the memory connector ref integrity is done
      // GH issue: https://github.com/loopbackio/loopback-next/issues/2333
      if (!foreignKeyValue) {
        return undefined as unknown as Target;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const constraint: any = {[primaryKey]: foreignKeyValue};
      const constrainedRepo = new DefaultBelongsToRepository(
        targetRepositoryGetter as {
          [repoType: string]: Getter<EntityCrudRepository<Target, TargetId>>;
        },
        constraint as DataObject<Target>,
        belongsToMetadata.target,
      );
      return constrainedRepo.get({polymorphicType: polymorphicTypes});
    };

  result.inclusionResolver = createBelongsToInclusionResolver(
    meta,
    targetRepositoryGetter as {
      [repoType: string]: Getter<EntityCrudRepository<Target, TargetId>>;
    },
  );
  return result;
}
