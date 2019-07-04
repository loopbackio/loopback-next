// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Options} from '../../common-types';
import {Entity} from '../../model';
import {Inclusion} from '../../query';
import {EntityCrudRepository} from '../../repositories/repository';
import {
  assignTargetsOfOneToOneRelation,
  findByForeignKeys,
  StringKeyOf,
  uniq,
} from '../relation.helpers';
import {
  BelongsToDefinition,
  Getter,
  InclusionResolver,
} from '../relation.types';
import {
  BelongsToResolvedDefinition,
  resolveBelongsToMetadata,
} from './belongs-to.helpers';

export class BelongsToInclusionResolver<
  Target extends Entity,
  TargetID,
  TargetRelations extends object
> implements InclusionResolver {
  private relationMeta: BelongsToResolvedDefinition;

  constructor(
    relationMeta: BelongsToDefinition,
    protected getTargetRepo: Getter<
      EntityCrudRepository<Target, TargetID, TargetRelations>
    >,
  ) {
    this.relationMeta = resolveBelongsToMetadata(relationMeta);
  }

  async fetchIncludedModels<SourceWithRelations extends Entity>(
    entities: SourceWithRelations[],
    inclusion: Inclusion<Target>,
    options?: Options,
  ): Promise<void> {
    if (!entities.length) return;

    const sourceKey = this.relationMeta.keyFrom as StringKeyOf<
      SourceWithRelations
    >;
    const sourceIds = entities.map(e => e[sourceKey]);
    const targetKey = this.relationMeta.keyTo as StringKeyOf<Target>;

    const targetRepo = await this.getTargetRepo();
    const targetsFound = await findByForeignKeys(
      targetRepo,
      targetKey as StringKeyOf<Target>,
      uniq(sourceIds),
      inclusion.scope,
      options,
    );

    const linkName = this.relationMeta.name as StringKeyOf<SourceWithRelations>;

    assignTargetsOfOneToOneRelation(
      entities,
      sourceKey,
      linkName,
      targetsFound,
      targetKey,
    );
  }
}
