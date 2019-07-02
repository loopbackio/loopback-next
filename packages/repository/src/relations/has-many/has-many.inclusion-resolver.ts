// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {AnyObject, Options} from '../../common-types';
import {Entity} from '../../model';
import {Inclusion} from '../../query';
import {EntityCrudRepository} from '../../repositories/repository';
import {findByForeignKeys} from '../relation.helpers';
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
    // TODO(bajtos) reject unsupported inclusion options, e.g. "scope"

    const sourceIds = entities.map(e => e.getId());
    const targetKey = this.relationMeta.keyTo;

    const targetRepo = await this.getTargetRepo();
    const found = await findByForeignKeys(
      targetRepo,
      targetKey as keyof Target,
      sourceIds,
      inclusion.scope,
      options,
    );

    // TODO(bajtos) Extract this code into a shared helper
    // Build a lookup map sourceId -> target entity
    const lookup = new Map<TargetID, (Target & TargetRelations)[]>();
    for (const target of found) {
      const fk: TargetID = (target as AnyObject)[targetKey];
      const val = lookup.get(fk) || [];
      val.push(target);
      lookup.set(fk, val);
    }

    for (const source of entities) {
      const targets = lookup.get(source.getId());
      if (!targets) continue;
      const sourceKey = this.relationMeta.name as keyof SourceWithRelations;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      source[sourceKey] = targets as any;
    }
  }
}
