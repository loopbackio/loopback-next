// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Getter} from '@loopback/core';
import {omit} from 'lodash';
import {
  constrainDataObject,
  constrainFilter,
  constrainWhere,
  Count,
  DataObject,
  Entity,
  Filter,
  Options,
  Where,
} from '../..';
import {EntityCrudRepository} from '../../repositories';

/**
 * CRUD operations for a target repository of a HasAndBelongsToMany relation
 */
export interface HasAndBelongsToManyRepository<
  Target extends Entity,
  TargetID
> {
  create(
    targetDataObject: DataObject<Target>,
    options?: Options & {
      throughOptions?: Options;
    },
  ): Promise<Target>;

  find(
    filter?: Filter<Target>,
    options?: Options & {
      throughOptions?: Options;
    },
  ): Promise<Target[]>;

  delete(
    where?: Where<Target>,
    options?: Options & {throughOptions?: Options},
  ): Promise<Count>;

  patch(
    targetDataObject: DataObject<Target>,
    where?: Where<Target>,
    options?: Options & {
      throughOptions?: Options;
    },
  ): Promise<Count>;

  link(
    targetId: TargetID,
    options?: Options & {targetOptions?: Options},
  ): Promise<Target>;

  unlink(
    targetId: TargetID,
    options?: Options & {targetOptions?: Options},
  ): Promise<void>;
}

export class DefaultHasAndBelongsToManyRepository<
  TargetRepository extends EntityCrudRepository<TargetEntity, TargetID>,
  ThroughRepository extends EntityCrudRepository<ThroughEntity, ThroughID>,
  TargetEntity extends Entity,
  ThroughEntity extends Entity,
  TargetID,
  ThroughID
> implements HasAndBelongsToManyRepository<TargetEntity, TargetID> {
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
    targetDataObject: DataObject<TargetEntity>,
    options?: Options & {
      throughOptions?: Options;
    },
  ): Promise<TargetEntity> {
    const throughRepository = await this.getThroughRepository();
    const targetRepository = await this.getTargetRepository();

    const targetInstance = await targetRepository.create(
      targetDataObject,
      omit(options, ['throughOptions']),
    );

    await throughRepository.create(
      constrainDataObject({}, this.getThroughConstraint()),
      options?.throughOptions,
    );

    return targetInstance;
  }

  async find(
    filter?: Filter<TargetEntity>,
    options?: Options & {
      throughOptions?: Options;
    },
  ): Promise<TargetEntity[]> {
    const throughRepository = await this.getThroughRepository();
    const targetRepository = await this.getTargetRepository();

    const throughInstances = await throughRepository.find(
      constrainFilter(undefined, this.getThroughConstraint()),
      options?.throughOptions,
    );

    return targetRepository.find(
      constrainFilter(filter, this.getTargetConstraint(throughInstances)),
      omit(options, ['throughOptions']),
    );
  }

  async delete(
    where?: Where<TargetEntity>,
    options?: Options & {throughOptions?: Options},
  ): Promise<Count> {
    const throughRepository = await this.getThroughRepository();
    const targetRepository = await this.getTargetRepository();

    const throughInstances = await throughRepository.find(
      constrainFilter(undefined, this.getThroughConstraint()),
      options?.throughOptions,
    );

    // ToDo: Delete throughInstances

    return targetRepository.deleteAll(
      constrainWhere(
        where,
        this.getTargetConstraint(throughInstances) as Where<TargetEntity>,
      ),
      omit(options, ['throughOptions']),
    );
  }

  async patch(
    targetDataObject: DataObject<TargetEntity>,
    where?: Where<TargetEntity>,
    options?: Options & {
      throughOptions?: Options;
    },
  ): Promise<Count> {
    const throughRepository = await this.getThroughRepository();
    const targetRepository = await this.getTargetRepository();

    const throughInstances = await throughRepository.find(
      constrainFilter(undefined, this.getThroughConstraint()),
      options?.throughOptions,
    );

    const targetConstraint = this.getTargetConstraint(throughInstances);
    return targetRepository.updateAll(
      constrainDataObject(targetDataObject, targetConstraint),
      constrainWhere(where, targetConstraint as Where<TargetEntity>),
      omit(options, ['throughOptions']),
    );
  }

  async link(
    targetId: TargetID,
    options?: Options & {targetOptions?: Options},
  ): Promise<TargetEntity> {
    const throughRepository = await this.getThroughRepository();
    const targetRepository = await this.getTargetRepository();

    const targetInstance = await targetRepository.findById(
      targetId,
      undefined,
      options?.targetOptions,
    );

    await throughRepository.create(
      this.getThroughConstraint(targetInstance),
      omit(options, ['targetOptions']),
    );

    return targetInstance;
  }

  async unlink(
    targetId: TargetID,
    options?: Options & {targetOptions?: Options},
  ): Promise<void> {
    const throughRepository = await this.getThroughRepository();
    const targetRepository = await this.getTargetRepository();

    const targetInstance = await targetRepository.findById(
      targetId,
      undefined,
      options?.targetOptions,
    );

    return throughRepository.delete(
      this.getThroughConstraint(targetInstance),
      omit(options, ['targetOptions']),
    );
  }
}
