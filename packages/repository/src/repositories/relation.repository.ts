// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/example-todo
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {EntityCrudRepository} from './repository';
import {
  constrainDataObject,
  constrainFilter,
  constrainWhere,
} from './constraint-utils';
import {DataObject, Options} from '../common-types';
import {Entity} from '../model';
import {Filter, Where} from '../query';
import {Getter} from '@loopback/context';

/**
 * CRUD operations for a target repository of a HasMany relation
 */
export interface HasManyRepository<Target extends Entity> {
  /**
   * Create a target model instance
   * @param targetModelData The target model data
   * @param options Options for the operation
   * @returns A promise which resolves to the newly created target model instance
   */
  create(
    targetModelData: DataObject<Target>,
    options?: Options,
  ): Promise<Target>;
  /**
   * Find target model instance(s)
   * @param Filter A filter object for where, order, limit, etc.
   * @param options Options for the operation
   * @returns A promise which resolves with the found target instance(s)
   */
  find(filter?: Filter, options?: Options): Promise<Target[]>;
  /**
   * Delete multiple target model instances
   * @param where Instances within the where scope are deleted
   * @param options
   * @returns A promise which resolves the deleted target model instances
   */
  delete(where?: Where, options?: Options): Promise<number>;
  /**
   * Patch multiple target model instances
   * @param dataObject The fields and their new values to patch
   * @param where Instances within the where scope are patched
   * @param options
   * @returns A promise which resolves the patched target model instances
   */
  patch(
    dataObject: DataObject<Target>,
    where?: Where,
    options?: Options,
  ): Promise<number>;
}

export interface BelongsToRepository<Target extends Entity> {
  find(options?: Options): Promise<Target>;
}

export class DefaultHasManyEntityCrudRepository<
  TargetEntity extends Entity,
  TargetID,
  TargetRepository extends EntityCrudRepository<TargetEntity, TargetID>
> implements HasManyRepository<TargetEntity> {
  /**
   * Constructor of DefaultHasManyEntityCrudRepository
   * @param targetRepositoryGetter the related target model repository instance
   * @param constraint the key value pair representing foreign key name to constrain
   * the target repository instance
   */

  public targetRepositoryGetter: Getter<TargetRepository>;

  constructor(
    targetRepository: TargetRepository | Getter<TargetRepository>,
    public constraint: DataObject<TargetEntity>,
  ) {
    this.targetRepositoryGetter =
      typeof targetRepository === 'object'
        ? ((() => Promise.resolve(targetRepository)) as Getter<
            TargetRepository
          >)
        : targetRepository;
  }

  async create(
    targetModelData: DataObject<TargetEntity>,
    options?: Options,
  ): Promise<TargetEntity> {
    return (await this.targetRepositoryGetter()).create(
      constrainDataObject(targetModelData, this.constraint),
      options,
    );
  }

  async find(filter?: Filter, options?: Options): Promise<TargetEntity[]> {
    return (await this.targetRepositoryGetter()).find(
      constrainFilter(filter, this.constraint),
      options,
    );
  }

  async delete(where?: Where, options?: Options): Promise<number> {
    return (await this.targetRepositoryGetter()).deleteAll(
      constrainWhere(where, this.constraint),
      options,
    );
  }

  async patch(
    dataObject: DataObject<TargetEntity>,
    where?: Where,
    options?: Options,
  ): Promise<number> {
    return (await this.targetRepositoryGetter()).updateAll(
      constrainDataObject(dataObject, this.constraint),
      constrainWhere(where, this.constraint),
      options,
    );
  }
}

export class DefaultBelongsToEntityCrudRepository<
  TargetEntity extends Entity,
  TargetId,
  TargetRepository extends EntityCrudRepository<TargetEntity, TargetId>
> {
  public targetRepositoryGetter: Getter<TargetRepository>;

  constructor(
    targetRepository: TargetRepository | Getter<TargetRepository>,
    public constraint: DataObject<TargetEntity>,
  ) {
    this.targetRepositoryGetter =
      typeof targetRepository === 'object'
        ? () => Promise.resolve(targetRepository)
        : targetRepository;
  }

  async find(options?: Options): Promise<TargetEntity> {
    return (await (await this.targetRepositoryGetter()).find(
      constrainFilter(undefined, this.constraint),
      options,
    ))[0];
  }
}
