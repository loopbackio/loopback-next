// Copyright IBM Corp. and LoopBack contributors 2019,2020. All Rights Reserved.
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
  InvalidPolymorphismError,
  Options,
  StringKeyOf,
  TypeResolver,
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
  Through extends Entity,
> {
  /**
   * Create a target model instance
   * @param targetModelData - The target model data
   * @param options - Options for the operation
   * options.polymorphicType a string or a string array of polymorphic type names
   * specify of which concrete model the created instance should be
   * @returns A promise which resolves to the newly created target model instance
   */
  create(
    targetModelData: DataObject<Target>,
    options?: Options & {
      throughData?: DataObject<Through>;
      throughOptions?: Options;
    } & {polymorphicType?: string},
  ): Promise<Target>;

  /**
   * Find target model instance(s)
   * @param filter - A filter object for where, order, limit, etc.
   * @param options - Options for the operation
   * options.throughOptions.discriminator - target discriminator field on through
   * options.polymorphicType a string or a string array of polymorphic type names
   * to specify which repositories should are expected to be searched
   * It is highly recommended to contain this param especially for
   * datasources using deplicated ids across tables
   * @returns A promise which resolves with the found target instance(s)
   */
  find(
    filter?: Filter<Target>,
    options?: Options & {
      throughOptions?: Options & {discriminator?: string};
    } & {polymorphicType?: string | string[]},
  ): Promise<Target[]>;

  /**
   * Delete multiple target model instances
   * @param where - Instances within the where scope are deleted
   * @param options
   * options.throughOptions.discriminator - target discriminator field on through
   * options.polymorphicType a string or a string array of polymorphic type names
   * to specify which repositories should are expected to be searched
   * It is highly recommended to contain this param especially for
   * datasources using deplicated ids across tables
   * @returns A promise which resolves the deleted target model instances
   */
  delete(
    where?: Where<Target>,
    options?: Options & {
      throughOptions?: Options & {discriminator?: string};
    } & {polymorphicType?: string | string[]},
  ): Promise<Count>;

  /**
   * Patch multiple target model instances
   * @param dataObject - The fields and their new values to patch
   * @param where - Instances within the where scope are patched
   * @param options
   * options.throughOptions.discriminator - target discriminator field on through
   * options.isPolymorphic - whether dataObject is a dictionary
   * @returns A promise which resolves the patched target model instances
   */
  patch(
    dataObject:
      | DataObject<Target>
      | {[polymorphicType: string]: DataObject<Target>},
    where?: Where<Target>,
    options?: Options & {
      throughOptions?: Options & {discriminator?: string};
    } & {isPolymorphic?: boolean},
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
  ): Promise<void>;

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

  /**
   * Remove all association to an existing target model instance
   * @param options
   * @return A promise which resolves to void
   */
  unlinkAll(
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
  ThroughRepository extends EntityCrudRepository<ThroughEntity, ThroughID>,
> implements HasManyThroughRepository<TargetEntity, TargetID, ThroughEntity>
{
  constructor(
    public getTargetRepository:
      | Getter<TargetRepository>
      | {
          [repoType: string]: Getter<TargetRepository>;
        },
    public getThroughRepository: Getter<ThroughRepository>,
    public getTargetConstraintFromThroughModels: (
      throughInstances: ThroughEntity[],
    ) => DataObject<TargetEntity>,
    public getTargetKeys: (throughInstances: ThroughEntity[]) => TargetID[],
    public getThroughConstraintFromSource: () => DataObject<ThroughEntity>,
    public getTargetIds: (targetInstances: TargetEntity[]) => TargetID[],
    public getThroughConstraintFromTarget: (
      targetID: TargetID[],
    ) => DataObject<ThroughEntity>,
    public targetResolver: TypeResolver<Entity, typeof Entity>,
    public throughResolver: TypeResolver<Entity, typeof Entity>,
  ) {
    if (typeof getTargetRepository === 'function') {
      this.getTargetRepositoryDict = {
        [targetResolver().name]:
          getTargetRepository as Getter<TargetRepository>,
      };
    } else {
      this.getTargetRepositoryDict = getTargetRepository as {
        [repoType: string]: Getter<TargetRepository>;
      };
    }
  }

  public getTargetRepositoryDict: {
    [repoType: string]: Getter<TargetRepository>;
  };

  async create(
    targetModelData: DataObject<TargetEntity>,
    options?: Options & {
      throughData?: DataObject<ThroughEntity>;
      throughOptions?: Options;
    } & {polymorphicType?: string},
  ): Promise<TargetEntity> {
    let targetPolymorphicTypeName = options?.polymorphicType;
    if (targetPolymorphicTypeName) {
      if (!this.getTargetRepositoryDict[targetPolymorphicTypeName]) {
        throw new InvalidPolymorphismError(targetPolymorphicTypeName);
      }
    } else {
      if (Object.keys(this.getTargetRepositoryDict).length > 1) {
        console.warn(
          'It is highly recommended to specify the polymorphicTypes param when using polymorphic types.',
        );
      }
      targetPolymorphicTypeName = this.targetResolver().name;
      if (!this.getTargetRepositoryDict[targetPolymorphicTypeName]) {
        throw new InvalidPolymorphismError(targetPolymorphicTypeName);
      }
    }

    const targetRepository =
      await this.getTargetRepositoryDict[targetPolymorphicTypeName]();
    const targetInstance = await targetRepository.create(
      targetModelData,
      options,
    );
    await this.link(targetInstance.getId(), options);
    return targetInstance;
  }

  async find(
    filter?: Filter<TargetEntity>,
    options?: Options & {
      throughOptions?: Options & {discriminator?: string};
    } & {polymorphicType?: string | string[]},
  ): Promise<TargetEntity[]> {
    const targetDiscriminatorOnThrough = options?.throughOptions?.discriminator;
    let targetPolymorphicTypes = options?.polymorphicType;
    let allKeys: string[];
    if (Object.keys(this.getTargetRepositoryDict).length <= 1) {
      allKeys = Object.keys(this.getTargetRepositoryDict);
    } else {
      if (!targetDiscriminatorOnThrough) {
        console.warn(
          'It is highly recommended to specify the targetDiscriminatorOnThrough param when using polymorphic types.',
        );
      }
      if (!targetPolymorphicTypes || targetPolymorphicTypes.length === 0) {
        console.warn(
          'It is highly recommended to specify the polymorphicTypes param when using polymorphic types.',
        );
        allKeys = Object.keys(this.getTargetRepositoryDict);
      } else {
        if (typeof targetPolymorphicTypes === 'string') {
          targetPolymorphicTypes = [targetPolymorphicTypes];
        }
        allKeys = [];
        new Set(targetPolymorphicTypes!).forEach(element => {
          if (Object.keys(this.getTargetRepositoryDict).includes(element)) {
            allKeys.push(element);
          }
        });
      }
    }

    const sourceConstraint = this.getThroughConstraintFromSource();

    const throughCategorized: {[concreteType: string]: (ThroughEntity & {})[]} =
      {};
    const throughRepository = await this.getThroughRepository();
    (
      await throughRepository.find(
        constrainFilter(undefined, sourceConstraint),
        options?.throughOptions,
      )
    ).forEach(element => {
      let concreteTargetType;
      if (!targetDiscriminatorOnThrough) {
        concreteTargetType = this.targetResolver().name;
      } else {
        concreteTargetType = String(
          element[targetDiscriminatorOnThrough as StringKeyOf<ThroughEntity>],
        );
      }
      if (!allKeys.includes(concreteTargetType)) {
        return;
      }
      if (!this.getTargetRepositoryDict[concreteTargetType]) {
        throw new InvalidPolymorphismError(
          concreteTargetType,
          targetDiscriminatorOnThrough,
        );
      }
      if (!throughCategorized[concreteTargetType]) {
        throughCategorized[concreteTargetType] = [];
      }
      throughCategorized[concreteTargetType].push(element);
    });

    let allTargets: TargetEntity[] = [];
    for (const key of Object.keys(throughCategorized)) {
      const targetRepository = await this.getTargetRepositoryDict[key]();
      const targetConstraint = this.getTargetConstraintFromThroughModels(
        throughCategorized[key],
      );
      allTargets = allTargets.concat(
        await targetRepository.find(constrainFilter(filter, targetConstraint), {
          ...options,
          polymorphicType: key,
        }),
      );
    }

    return allTargets;
  }

  async delete(
    where?: Where<TargetEntity>,
    options?: Options & {
      throughOptions?: Options & {discriminator?: string};
    } & {polymorphicType?: string | string[]},
  ): Promise<Count> {
    const targetDiscriminatorOnThrough = options?.throughOptions?.discriminator;
    let targetPolymorphicTypes = options?.polymorphicType;
    let allKeys: string[];
    if (Object.keys(this.getTargetRepositoryDict).length <= 1) {
      allKeys = Object.keys(this.getTargetRepositoryDict);
    } else {
      if (!targetDiscriminatorOnThrough) {
        console.warn(
          'It is highly recommended to specify the targetDiscriminatorOnThrough param when using polymorphic types.',
        );
      }
      if (!targetPolymorphicTypes || targetPolymorphicTypes.length === 0) {
        console.warn(
          'It is highly recommended to specify the polymorphicTypes param when using polymorphic types.',
        );
        allKeys = Object.keys(this.getTargetRepositoryDict);
      } else {
        if (typeof targetPolymorphicTypes === 'string') {
          targetPolymorphicTypes = [targetPolymorphicTypes];
        }
        allKeys = [];
        new Set(targetPolymorphicTypes!).forEach(element => {
          if (Object.keys(this.getTargetRepositoryDict).includes(element)) {
            allKeys.push(element);
          }
        });
      }
    }

    const sourceConstraint = this.getThroughConstraintFromSource();
    let totalCount = 0;
    const throughCategorized: {[concreteType: string]: (ThroughEntity & {})[]} =
      {};
    const throughRepository = await this.getThroughRepository();
    (
      await throughRepository.find(
        constrainFilter(undefined, sourceConstraint),
        options?.throughOptions,
      )
    ).forEach(element => {
      let concreteTargetType;
      if (!targetDiscriminatorOnThrough) {
        concreteTargetType = this.targetResolver().name;
      } else {
        concreteTargetType = String(
          element[targetDiscriminatorOnThrough as StringKeyOf<ThroughEntity>],
        );
      }
      if (!allKeys.includes(concreteTargetType)) {
        return;
      }
      if (!this.getTargetRepositoryDict[concreteTargetType]) {
        throw new InvalidPolymorphismError(
          concreteTargetType,
          targetDiscriminatorOnThrough,
        );
      }
      if (!throughCategorized[concreteTargetType]) {
        throughCategorized[concreteTargetType] = [];
      }
      throughCategorized[concreteTargetType].push(element);
    });

    for (const targetKey of Object.keys(throughCategorized)) {
      const targetRepository = await this.getTargetRepositoryDict[targetKey]();
      if (where) {
        // only delete related through models
        // TODO(Agnes): this performance can be improved by only fetching related data
        // TODO: add target ids to the `where` constraint
        const targets = await targetRepository.find({where});
        const targetIds = this.getTargetIds(targets);
        if (targetIds.length > 0) {
          const targetConstraint =
            this.getThroughConstraintFromTarget(targetIds);
          const constraints = {...targetConstraint, ...sourceConstraint};
          await throughRepository.deleteAll(
            constrainDataObject(
              {},
              constraints as DataObject<ThroughEntity>,
            ) as Where<ThroughEntity>,
            options?.throughOptions,
          );
        }
      } else {
        // otherwise, delete through models that relate to the sourceId
        const targetFkValues = this.getTargetKeys(
          throughCategorized[targetKey],
        );
        // delete through instances that have the targets that are going to be deleted
        const throughFkConstraint =
          this.getThroughConstraintFromTarget(targetFkValues);
        await throughRepository.deleteAll(
          constrainWhereOr({}, [
            sourceConstraint as Where<ThroughEntity>,
            throughFkConstraint as Where<ThroughEntity>,
          ]),
        );
      }
      // delete target(s)
      const targetConstraint = this.getTargetConstraintFromThroughModels(
        throughCategorized[targetKey],
      );
      totalCount +=
        (
          await targetRepository.deleteAll(
            constrainWhere(where, targetConstraint as Where<TargetEntity>),
            options,
          )
        )?.count ?? 0;
    }
    return {count: totalCount};
  }

  // only allows patch target instances for now
  async patch(
    dataObject:
      | DataObject<TargetEntity>
      | {[polymorphicType: string]: DataObject<TargetEntity>},
    where?: Where<TargetEntity>,
    options?: Options & {
      throughOptions?: Options & {discriminator?: string};
    } & {isPolymorphic?: boolean},
  ): Promise<Count> {
    const targetDiscriminatorOnThrough = options?.throughOptions?.discriminator;
    const isMultipleTypes = options?.isPolymorphic;
    let allKeys: string[];
    if (!targetDiscriminatorOnThrough) {
      if (Object.keys(this.getTargetRepositoryDict).length > 1) {
        console.warn(
          'It is highly recommended to specify the targetDiscriminatorOnThrough param when using polymorphic types.',
        );
      }
    }
    if (!isMultipleTypes) {
      if (Object.keys(this.getTargetRepositoryDict).length > 1) {
        console.warn(
          'It is highly recommended to specify the isMultipleTypes param and pass in a dictionary of dataobjects when using polymorphic types.',
        );
      }
      allKeys = Object.keys(this.getTargetRepositoryDict);
    } else {
      allKeys = [];
      new Set(Object.keys(dataObject)).forEach(element => {
        if (Object.keys(this.getTargetRepositoryDict).includes(element)) {
          allKeys.push(element);
        }
      });
    }

    const sourceConstraint = this.getThroughConstraintFromSource();

    const throughCategorized: {[concreteType: string]: (ThroughEntity & {})[]} =
      {};
    const throughRepository = await this.getThroughRepository();
    (
      await throughRepository.find(
        constrainFilter(undefined, sourceConstraint),
        options?.throughOptions,
      )
    ).forEach(element => {
      let concreteTargetType;
      if (!targetDiscriminatorOnThrough) {
        concreteTargetType = this.targetResolver().name;
      } else {
        concreteTargetType = String(
          element[targetDiscriminatorOnThrough as StringKeyOf<ThroughEntity>],
        );
      }
      if (!allKeys.includes(concreteTargetType)) {
        return;
      }
      if (!this.getTargetRepositoryDict[concreteTargetType]) {
        throw new InvalidPolymorphismError(
          concreteTargetType,
          targetDiscriminatorOnThrough,
        );
      }
      if (!throughCategorized[concreteTargetType]) {
        throughCategorized[concreteTargetType] = [];
      }
      throughCategorized[concreteTargetType].push(element);
    });

    let updatedCount = 0;
    for (const key of Object.keys(throughCategorized)) {
      const targetRepository = await this.getTargetRepositoryDict[key]();
      const targetConstraint = this.getTargetConstraintFromThroughModels(
        throughCategorized[key],
      );
      updatedCount +=
        (
          await targetRepository.updateAll(
            constrainDataObject(
              isMultipleTypes
                ? (
                    dataObject as {
                      [polymorphicType: string]: DataObject<TargetEntity>;
                    }
                  )[key]
                : (dataObject as DataObject<TargetEntity>),
              targetConstraint,
            ),
            constrainWhere(where, targetConstraint as Where<TargetEntity>),
            options,
          )
        )?.count ?? 0;
    }

    return {count: updatedCount};
  }

  async link(
    targetId: TargetID,
    options?: Options & {
      throughData?: DataObject<ThroughEntity>;
      throughOptions?: Options;
    },
  ): Promise<void> {
    const throughRepository = await this.getThroughRepository();
    const sourceConstraint = this.getThroughConstraintFromSource();
    const targetConstraint = this.getThroughConstraintFromTarget([targetId]);
    const constraints = {...targetConstraint, ...sourceConstraint};
    await throughRepository.create(
      constrainDataObject(
        options?.throughData ?? {},
        constraints as DataObject<ThroughEntity>,
      ),
      options?.throughOptions,
    );
  }

  async unlink(
    targetId: TargetID,
    options?: Options & {
      throughOptions?: Options;
    },
  ): Promise<void> {
    const throughRepository = await this.getThroughRepository();
    const sourceConstraint = this.getThroughConstraintFromSource();
    const targetConstraint = this.getThroughConstraintFromTarget([targetId]);
    const constraints = {...targetConstraint, ...sourceConstraint};
    await throughRepository.deleteAll(
      constrainDataObject(
        {},
        constraints as DataObject<ThroughEntity>,
      ) as Where<ThroughEntity>,
      options?.throughOptions,
    );
  }

  async unlinkAll(
    options?: Options & {
      throughOptions?: Options;
    },
  ): Promise<void> {
    const throughRepository = await this.getThroughRepository();
    const sourceConstraint = this.getThroughConstraintFromSource();
    const throughInstances = await throughRepository.find(
      constrainFilter(undefined, sourceConstraint),
      options?.throughOptions,
    );
    const targetFkValues = this.getTargetKeys(throughInstances);
    const targetConstraint =
      this.getThroughConstraintFromTarget(targetFkValues);
    const constraints = {...targetConstraint, ...sourceConstraint};
    await throughRepository.deleteAll(
      constrainDataObject(
        {},
        constraints as DataObject<ThroughEntity>,
      ) as Where<ThroughEntity>,
      options?.throughOptions,
    );
  }
}
