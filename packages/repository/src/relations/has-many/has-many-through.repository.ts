// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  constrainDataObject,
  constrainFilter,
  constrainWhere,
  constrainWhereOr,
  Count,
  DataObject,
  Entity,
  EntityCrudRepository,
  Filter,
  Getter,
  Options,
  Where,
} from '../..';

/**
 * CRUD operations for a target repository of a HasManyThrough relation
 *
 * EXPERIMENTAL: This interface is not stable and may change in the near future.
 * Backwards-incompatible changes may be introduced in semver-minor versions.
 */
export interface HasManyThroughRepository<
  Target extends Entity,
  TargetID,
  Through extends Entity
> {
  /**
   * Create a target model instance
   * @param targetModelData - The target model data
   * @param options - Options for the operation
   * @returns A promise which resolves to the newly created target model instance
   */
  create(
    targetModelData: DataObject<Target>,
    options?: Options & {
      throughData?: DataObject<Through>;
      throughOptions?: Options;
    },
  ): Promise<Target>;

  /**
   * Find target model instance(s)
   * @param filter - A filter object for where, order, limit, etc.
   * @param options - Options for the operation
   * @returns A promise which resolves with the found target instance(s)
   */
  find(
    filter?: Filter<Target>,
    options?: Options & {
      throughOptions?: Options;
    },
  ): Promise<Target[]>;

  /**
   * Delete multiple target model instances
   * @param where - Instances within the where scope are deleted
   * @param options
   * @returns A promise which resolves the deleted target model instances
   */
  delete(
    where?: Where<Target>,
    options?: Options & {
      throughOptions?: Options;
    },
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
    options?: Options & {
      throughOptions?: Options;
    },
  ): Promise<Count>;

  /**
   * Creates a new many-to-many association to an existing target model instance
   * @param targetModelId - The target model ID to link
   * @param options
   * @returns A promise which resolves to the linked target model instance
   */
  link(
    targetModelId: TargetID,
    options?: Options & {
      throughData?: DataObject<Through>;
      throughOptions?: Options;
    },
  ): Promise<Target>;

  /**
   * Removes an association to an existing target model instance
   * @param targetModelId - The target model to unlink
   * @param options
   * @returns A promise which resolves to null
   */
  unlink(
    targetModelId: TargetID,
    options?: Options & {
      throughOptions?: Options;
    },
  ): Promise<void>;
}

/**
 * a class for CRUD operations for hasManyThrough relation.
 *
 * Warning: The hasManyThrough interface is experimental and is subject to change.
 * If backwards-incompatible changes are made, a new major version may not be
 * released.
 */
export class DefaultHasManyThroughRepository<
  TargetEntity extends Entity,
  TargetID,
  TargetRepository extends EntityCrudRepository<TargetEntity, TargetID>,
  ThroughEntity extends Entity,
  ThroughID,
  ThroughRepository extends EntityCrudRepository<ThroughEntity, ThroughID>
> implements HasManyThroughRepository<TargetEntity, TargetID, ThroughEntity> {
  constructor(
    public getTargetRepository: Getter<TargetRepository>,
    public getThroughRepository: Getter<ThroughRepository>,
    public getTargetConstraint: (
      throughInstances: ThroughEntity | ThroughEntity[],
    ) => DataObject<TargetEntity>,
    public getThroughConstraint: () => DataObject<ThroughEntity>,
    public getThroughFkConstraint: (
      targetInstance: TargetEntity,
    ) => DataObject<ThroughEntity>,
  ) {}

  async create(
    targetModelData: DataObject<TargetEntity>,
    options?: Options & {
      throughData?: DataObject<ThroughEntity>;
      throughOptions?: Options;
    },
  ): Promise<TargetEntity> {
    const targetRepository = await this.getTargetRepository();
    const throughRepository = await this.getThroughRepository();
    const targetInstance = await targetRepository.create(
      targetModelData,
      options,
    );
    const targetConstraint = this.getThroughFkConstraint(targetInstance);
    const throughConstraint = this.getThroughConstraint();
    const constraints = {...targetConstraint, ...throughConstraint};
    await throughRepository.create(
      constrainDataObject(
        options?.throughData ?? {},
        constraints as DataObject<ThroughEntity>,
      ),
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
    const targetRepository = await this.getTargetRepository();
    const throughRepository = await this.getThroughRepository();
    const throughConstraint = this.getThroughConstraint();
    const throughInstances = await throughRepository.find(
      constrainFilter(undefined, throughConstraint),
      options?.throughOptions,
    );
    const targetConstraint = this.getTargetConstraint(throughInstances);
    return targetRepository.find(
      constrainFilter(filter, targetConstraint),
      options,
    );
  }

  async delete(
    where?: Where<TargetEntity>,
    options?: Options & {
      throughOptions?: Options;
    },
  ): Promise<Count> {
    const targetRepository = await this.getTargetRepository();
    const throughRepository = await this.getThroughRepository();
    const throughConstraint = this.getThroughConstraint();
    const throughInstances = await throughRepository.find(
      constrainFilter(undefined, throughConstraint),
      options?.throughOptions,
    );
    const targetConstraint = this.getTargetConstraint(throughInstances);

    // delete throughs that have the targets that are going to be deleted
    const throughFkConstraint = this.getThroughFkConstraint(
      targetConstraint as TargetEntity,
    );
    await throughRepository.deleteAll(
      constrainWhereOr({}, [throughConstraint, throughFkConstraint]),
    );

    // delete target(s)
    return targetRepository.deleteAll(
      constrainWhere(where, targetConstraint as Where<TargetEntity>),
      options,
    );
  }
  // only allows patch target instances for now
  async patch(
    dataObject: DataObject<TargetEntity>,
    where?: Where<TargetEntity>,
    options?: Options & {
      throughOptions?: Options;
    },
  ): Promise<Count> {
    const targetRepository = await this.getTargetRepository();
    const throughRepository = await this.getThroughRepository();
    const throughConstraint = this.getThroughConstraint();
    const throughInstances = await throughRepository.find(
      constrainFilter(undefined, throughConstraint),
      options?.throughOptions,
    );
    const targetConstraint = this.getTargetConstraint(throughInstances);
    return targetRepository.updateAll(
      constrainDataObject(dataObject, targetConstraint),
      constrainWhere(where, targetConstraint as Where<TargetEntity>),
      options,
    );
  }

  async link(
    targetModelId: TargetID,
    options?: Options & {
      throughData?: DataObject<ThroughEntity>;
      throughOptions?: Options;
    },
  ): Promise<TargetEntity> {
    throw new Error('Method not implemented.');
  }

  async unlink(
    targetModelId: TargetID,
    options?: Options & {
      throughOptions?: Options;
    },
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
