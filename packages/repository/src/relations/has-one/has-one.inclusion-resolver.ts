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
} from '../relation.helpers';
import {Getter, HasOneDefinition, InclusionResolver} from '../relation.types';
import {
  HasOneResolvedDefinition,
  resolveHasOneMetadata,
} from './has-one.helpers';

export class HasOneInclusionResolver<
  Target extends Entity,
  TargetID,
  TargetRelations extends object
> implements InclusionResolver {
  private relationMeta: HasOneResolvedDefinition;

  constructor(
    relationMeta: HasOneDefinition,
    protected getTargetRepo: Getter<
      EntityCrudRepository<Target, TargetID, TargetRelations>
    >,
  ) {
    this.relationMeta = resolveHasOneMetadata(relationMeta);
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
    const relatedTargets = await findByForeignKeys(
      targetRepo,
      targetKey,
      sourceIds,
      inclusion.scope,
      options,
    );

    const linkName = this.relationMeta.name as StringKeyOf<SourceWithRelations>;

    assignTargetsOfOneToOneRelation(
      entities,
      sourceKey,
      linkName,
      relatedTargets,
      targetKey,
    );
  }
}
