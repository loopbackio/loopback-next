// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Getter} from '@loopback/context';
import {Count, DataObject, Options} from '../../common-types';
import {Entity} from '../../model';
import {Filter, Where} from '../../query';
import {
  constrainDataObject,
  constrainFilter,
  constrainWhere,
} from '../../repositories/constraint-utils';
import {EntityCrudRepository} from '../../repositories/repository';

/**
 * CRUD operations for a target repository of a HasMany relation
 */
export interface HasManyRepository<Target extends Entity> {
  /**
   * Create a target model instance
   * @param targetModelData - The target model data
   * @param options - Options for the operation
   * @returns A promise which resolves to the newly created target model instance
   */
  create(
    targetModelData: DataObject<Target>,
    options?: Options,
  ): Promise<Target>;
  /**
   * Find target model instance(s)
   * @param filter - A filter object for where, order, limit, etc.
   * @param options - Options for the operation
   * @returns A promise which resolves with the found target instance(s)
   */
  find(filter?: Filter<Target>, options?: Options): Promise<Target[]>;
  /**
   * Delete multiple target model instances
   * @param where - Instances within the where scope are deleted
   * @param options
   * @returns A promise which resolves the deleted target model instances
   */
  delete(where?: Where<Target>, options?: Options): Promise<Count>;
  /**
   * Patch multiple target model instances
   * @param dataObject - The fields and their new values to patch
   * @param where - Instances within the where scope are patched
   * @param options
   * @returns A promise which resolves the patched target model instances
   */
  patch(
    dataObject: DataObject<Target>,
    where?: Where<Target>,
    options?: Options,
  ): Promise<Count>;
}

export class DefaultHasManyRepository<
  TargetEntity extends Entity,
  TargetID,
  TargetRepository extends EntityCrudRepository<TargetEntity, TargetID>
> implements HasManyRepository<TargetEntity> {
  /**
   * Constructor of DefaultHasManyEntityCrudRepository
   * @param getTargetRepository - the getter of the related target model repository instance
   * @param constraint - the key value pair representing foreign key name to constrain
   * the target repository instance
   */
  constructor(
    public getTargetRepository: Getter<TargetRepository>,
    public constraint: DataObject<TargetEntity>,
  ) {}

  async create(
    targetModelData: DataObject<TargetEntity>,
    options?: Options,
  ): Promise<TargetEntity> {
    const targetRepository = await this.getTargetRepository();
    return targetRepository.create(
      constrainDataObject(targetModelData, this.constraint),
      options,
    );
  }

  async find(
    filter?: Filter<TargetEntity>,
    options?: Options,
  ): Promise<TargetEntity[]> {
    const targetRepository = await this.getTargetRepository();
    return targetRepository.find(
      constrainFilter(filter, this.constraint),
      options,
    );
  }

  async delete(where?: Where<TargetEntity>, options?: Options): Promise<Count> {
    const targetRepository = await this.getTargetRepository();
    return targetRepository.deleteAll(
      constrainWhere(where, this.constraint as Where<TargetEntity>),
      options,
    );
  }

  async patch(
    dataObject: DataObject<TargetEntity>,
    where?: Where<TargetEntity>,
    options?: Options,
  ): Promise<Count> {
    const targetRepository = await this.getTargetRepository();
    return targetRepository.updateAll(
      constrainDataObject(dataObject, this.constraint),
      constrainWhere(where, this.constraint as Where<TargetEntity>),
      options,
    );
  }
}
