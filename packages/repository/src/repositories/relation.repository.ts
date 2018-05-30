// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/example-todo
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {EntityCrudRepository} from './repository';
import {constrainDataObject, constrainFilter} from './constraint-utils';
import {AnyObject, Options} from '../common-types';
import {Entity} from '../model';
import {Filter} from '../query';

/**
 * CRUD operations for a target repository of a HasMany relation
 */
export interface HasManyEntityCrudRepository<T extends Entity> {
  /**
   * Create a target model instance
   * @param targetModelData The target model data
   * @param options Options for the operation
   * @returns A promise which resolves to the newly created target model instance
   */
  create(targetModelData: Partial<T>, options?: Options): Promise<T>;
  /**
   * Find target model instance(s)
   * @param Filter A filter object for where, order, limit, etc.
   * @param options Options for the operation
   * @returns A promise which resolves with the found target instance(s)
   */
  find(filter?: Filter | undefined, options?: Options): Promise<T[]>;
}

export class DefaultHasManyEntityCrudRepository<
  T extends Entity,
  TargetRepository extends EntityCrudRepository<T, typeof Entity.prototype.id>
> implements HasManyEntityCrudRepository<T> {
  /**
   * Constructor of DefaultHasManyEntityCrudRepository
   * @param targetRepository the related target model repository instance
   * @param constraint the key value pair representing foreign key name to constrain
   * the target repository instance
   */
  constructor(
    public targetRepository: TargetRepository,
    public constraint: AnyObject,
  ) {}

  async create(targetModelData: Partial<T>, options?: Options): Promise<T> {
    return await this.targetRepository.create(
      constrainDataObject(targetModelData, this.constraint),
      options,
    );
  }

  async find(filter?: Filter | undefined, options?: Options): Promise<T[]> {
    return await this.targetRepository.find(
      constrainFilter(filter, this.constraint),
      options,
    );
  }
}
