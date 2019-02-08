// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/example-todo
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
 * CRUD operations for a target repository of a HasManyThrough relation
 */
export interface HasManyThroughRepository<
  Target extends Entity,
  Through extends Entity
> {
  /**
   * Create a target model instance
   * @param targetModelData - The target model data
   * @param throughModelData - The through model data
   * @param options - Options for the operation
   * @param throughOptions - Options passed to create through
   * @returns A promise which resolves to the newly created target model instance
   */
  create(
    targetModelData: DataObject<Target>,
    throughModelData?: DataObject<Through>,
    options?: Options,
    throughOptions?: Options,
  ): Promise<Target>;
  /**
   * Find target model instance(s)
   * @param filter - A filter object for where, order, limit, etc.
   * @param options - Options for the operation
   * @returns A promise which resolves with the found target instance(s)
   */
  find(
    filter?: Filter<Target>,
    options?: Options,
    throughOptions?: Options,
  ): Promise<Target[]>;
  /**
   * Delete multiple target model instances
   * @param where - Instances within the where scope are deleted
   * @param options
   * @returns A promise which resolves the deleted target model instances
   */
  delete(
    where?: Where<Target>,
    options?: Options,
    throughOptions?: Options,
  ): Promise<Count>;
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
    throughOptions?: Options,
  ): Promise<Count>;
}

export class DefaultHasManyThroughRepository<
  TargetEntity extends Entity,
  TargetID,
  TargetRepository extends EntityCrudRepository<TargetEntity, TargetID>,
  ThroughEntity extends Entity,
  ThroughID,
  ThroughRepository extends EntityCrudRepository<ThroughEntity, ThroughID>
> implements HasManyThroughRepository<TargetEntity, ThroughEntity> {
  /**
   * Constructor of DefaultHasManyThroughEntityCrudRepository
   * @param getTargetRepository - the getter of the related target model repository instance
   * @param getThroughRepository - the getter of the related through model repository instance
   * @param getTargetConstraint - the getter of the constraint used to query target
   * @param getThroughConstraint - the getter of the constraint used to query through
   * the hasManyThrough instance
   */
  constructor(
    public getTargetRepository: Getter<TargetRepository>,
    public getThroughRepository: Getter<ThroughRepository>,
    public getTargetConstraint: (
      throughInstances: ThroughEntity[],
    ) => DataObject<TargetEntity>,
    public getThroughConstraint: (
      targetInstance?: TargetEntity,
    ) => DataObject<ThroughEntity>,
  ) {}

  async create(
    targetModelData: DataObject<TargetEntity>,
    throughModelData: DataObject<ThroughEntity> = {},
    options?: Options,
    throughOptions?: Options,
  ): Promise<TargetEntity> {
    const targetRepository = await this.getTargetRepository();
    const throughRepository = await this.getThroughRepository();
    const targetInstance = await targetRepository.create(
      targetModelData,
      options,
    );
    const throughConstraint = this.getThroughConstraint(targetInstance);
    await throughRepository.create(
      constrainDataObject(throughModelData, throughConstraint as DataObject<
        ThroughEntity
      >),
      throughOptions,
    );
    return targetInstance;
  }

  async find(
    filter?: Filter<TargetEntity>,
    options?: Options,
    throughOptions?: Options,
  ): Promise<TargetEntity[]> {
    const targetRepository = await this.getTargetRepository();
    const throughRepository = await this.getThroughRepository();
    const throughConstraint = this.getThroughConstraint();
    const throughInstances = await throughRepository.find(
      constrainFilter(undefined, throughConstraint),
      throughOptions,
    );
    const targetConstraint = this.getTargetConstraint(throughInstances);
    return targetRepository.find(
      constrainFilter(filter, targetConstraint),
      options,
    );
  }

  async delete(
    where?: Where<TargetEntity>,
    options?: Options,
    throughOptions?: Options,
  ): Promise<Count> {
    const targetRepository = await this.getTargetRepository();
    const throughRepository = await this.getThroughRepository();
    const throughConstraint = this.getThroughConstraint();
    const throughInstances = await throughRepository.find(
      constrainFilter(undefined, throughConstraint),
      throughOptions,
    );
    const targetConstraint = this.getTargetConstraint(throughInstances);
    return targetRepository.deleteAll(
      constrainWhere(where, targetConstraint as Where<TargetEntity>),
      options,
    );
  }

  async patch(
    dataObject: DataObject<TargetEntity>,
    where?: Where<TargetEntity>,
    options?: Options,
    throughOptions?: Options,
  ): Promise<Count> {
    const targetRepository = await this.getTargetRepository();
    const throughRepository = await this.getThroughRepository();
    const throughConstraint = this.getThroughConstraint();
    const throughInstances = await throughRepository.find(
      constrainFilter(undefined, throughConstraint),
      throughOptions,
    );
    const targetConstraint = this.getTargetConstraint(throughInstances);
    return targetRepository.updateAll(
      constrainDataObject(dataObject, targetConstraint),
      constrainWhere(where, targetConstraint as Where<TargetEntity>),
      options,
    );
  }
}
