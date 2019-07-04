// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Options} from '../../common-types';
import {Entity} from '../../model';
import {Inclusion} from '../../query';
import {EntityCrudRepository} from '../../repositories/repository';
import {
  assignTargetsOfOneToManyRelation,
  findByForeignKeys,
  StringKeyOf,
} from '../relation.helpers';
import {Getter, HasManyDefinition, InclusionResolver} from '../relation.types';
import {
  HasManyResolvedDefinition,
  resolveHasManyMetadata,
} from './has-many.helpers';

export class HasManyInclusionResolver<
  Target extends Entity,
  TargetID,
  TargetRelations extends object
> implements InclusionResolver {
  private relationMeta: HasManyResolvedDefinition;

  constructor(
    relationMeta: HasManyDefinition,
    protected getTargetRepo: Getter<
      EntityCrudRepository<Target, TargetID, TargetRelations>
    >,
  ) {
    this.relationMeta = resolveHasManyMetadata(relationMeta);
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
      targetKey,
      sourceIds,
      inclusion.scope,
      options,
    );

    const linkName = this.relationMeta.name as StringKeyOf<SourceWithRelations>;

    assignTargetsOfOneToManyRelation(
      entities,
      sourceKey,
      linkName,
      targetsFound,
      targetKey,
    );
  }
}
