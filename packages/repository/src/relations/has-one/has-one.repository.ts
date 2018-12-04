// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/example-todo
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Getter} from '@loopback/context';
import {DataObject, Options} from '../../common-types';
import {Entity} from '../../model';
import {Filter, Where} from '../../query';
import {
  constrainDataObject,
  constrainFilter,
} from '../../repositories/constraint-utils';
import {EntityCrudRepository} from '../../repositories/repository';

/**
 * CRUD operations for a target repository of a HasMany relation
 */
export interface HasOneRepository<Target extends Entity> {
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
   * Find the only target model instance that belongs to the declaring model.
   * @param filter Query filter without a Where condition
   * @param options Options for the operations
   * @returns A promise of the target object or null if not found.
   */
  get(
    filter?: Exclude<Filter<Target>, Where<Target>>,
    options?: Options,
  ): Promise<Target | undefined>;
}

export class DefaultHasOneRepository<
  TargetEntity extends Entity,
  TargetID,
  TargetRepository extends EntityCrudRepository<TargetEntity, TargetID>
> implements HasOneRepository<TargetEntity> {
  /**
   * Constructor of DefaultHasManyEntityCrudRepository
   * @param getTargetRepository the getter of the related target model repository instance
   * @param constraint the key value pair representing foreign key name to constrain
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
    return await targetRepository.create(
      constrainDataObject(targetModelData, this.constraint),
      options,
    );
  }

  async get(
    filter?: Exclude<Filter<TargetEntity>, Where<TargetEntity>>,
    options?: Options,
  ): Promise<TargetEntity | undefined> {
    const targetRepository = await this.getTargetRepository();
    const found = await targetRepository.find(
      Object.assign({limit: 1}, constrainFilter(filter, this.constraint)),
      options,
    );
    // TODO: throw EntityNotFound error when target model instance not found
    return found[0];
  }
}
