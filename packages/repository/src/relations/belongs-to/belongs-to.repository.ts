// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Getter} from '@loopback/core';
import {DataObject, Options} from '../../common-types';
import {EntityNotFoundError} from '../../errors';
import {Entity} from '../../model';
import {constrainFilter, EntityCrudRepository} from '../../repositories';

/**
 * CRUD operations for a target repository of a BelongsTo relation
 */
export interface BelongsToRepository<Target extends Entity> {
  /**
   * Gets the target model instance
   * @param options
   * @returns A promise resolved with the target object or rejected
   * with an EntityNotFoundError when target model instance was not found.
   */
  get(options?: Options): Promise<Target>;
}

export class DefaultBelongsToRepository<
  TargetEntity extends Entity,
  TargetId,
  TargetRepository extends EntityCrudRepository<TargetEntity, TargetId>,
> implements BelongsToRepository<TargetEntity>
{
  /**
   * Constructor of DefaultBelongsToEntityCrudRepository
   * @param getTargetRepository - the getter of the related target model repository instance
   * @param constraint - the key value pair representing foreign key name to constrain
   * the target repository instance
   */
  constructor(
    public getTargetRepository: Getter<TargetRepository>,
    public constraint: DataObject<TargetEntity>,
  ) {}

  async get(options?: Options): Promise<TargetEntity> {
    const targetRepo = await this.getTargetRepository();
    const result = await targetRepo.find(
      constrainFilter(undefined, this.constraint),
      options,
    );
    if (!result.length) {
      // We don't have a direct access to the foreign key value here :(
      const id = 'constraint ' + JSON.stringify(this.constraint);
      throw new EntityNotFoundError(targetRepo.entityClass, id);
    }
    return result[0];
  }
}
