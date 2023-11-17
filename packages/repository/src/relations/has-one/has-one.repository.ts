// Copyright IBM Corp. and LoopBack contributors 2018,2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Getter} from '@loopback/core';
import {Filter, Where} from '@loopback/filter';
import {TypeResolver} from '../../';
import {Count, DataObject, Options} from '../../common-types';
import {EntityNotFoundError, InvalidPolymorphismError} from '../../errors';
import {Entity} from '../../model';
import {
  constrainDataObject,
  constrainFilter,
  constrainWhere,
  EntityCrudRepository,
} from '../../repositories';

/**
 * CRUD operations for a target repository of a HasMany relation
 */
export interface HasOneRepository<Target extends Entity> {
  /**
   * Create a target model instance
   * @param targetModelData - The target model data
   * @param options - Options for the operation
   * options.polymorphicType - If polymorphic target model,
   * specify of which concrete model the created instance should be
   * @returns A promise which resolves to the newly created target model instance
   */
  create(
    targetModelData: DataObject<Target>,
    options?: Options & {polymorphicType?: string},
  ): Promise<Target>;

  /**
   * Find the only target model instance that belongs to the declaring model.
   * @param filter - Query filter without a Where condition
   * @param options - Options for the operations
   * options.polymorphicType - a string or a string array of polymorphic type names
   * to specify which repositories should are expected to be searched
   * It is highly recommended to contain this param especially for
   * datasources using deplicated ids across tables
   * @returns A promise resolved with the target object or rejected
   * with an EntityNotFoundError when target model instance was not found.
   */
  get(
    filter?: Pick<Filter<Target>, Exclude<keyof Filter<Target>, 'where'>>,
    options?: Options & {polymorphicType?: string | string[]},
  ): Promise<Target>;

  /**
   * Delete the related target model instance
   * @param options
   * options.polymorphicType - a string or a string array of polymorphic type names
   * to specify which repositories should are expected to be searched
   * It is highly recommended to contain this param especially for
   * datasources using deplicated ids across tables
   * @returns A promise which resolves the deleted target model instances
   */
  delete(
    options?: Options & {polymorphicType?: string | string[]},
  ): Promise<Count>;

  /**
   * Patch the  related target model instance
   * @param dataObject - The target model fields and their new values to patch
   * If the target models are of different types, this should be a dictionary
   * @param options
   * options.isPolymorphic - whether dataObject is a dictionary
   * @returns A promise which resolves the patched target model instances
   */
  patch(
    dataObject:
      | DataObject<Target>
      | {[polymorphicType: string]: DataObject<Target>},
    options?: Options & {isPolymorphic?: boolean},
  ): Promise<Count>;
}

export class DefaultHasOneRepository<
  TargetEntity extends Entity,
  TargetID,
  TargetRepository extends EntityCrudRepository<TargetEntity, TargetID>,
> implements HasOneRepository<TargetEntity>
{
  /**
   * Constructor of DefaultHasOneEntityCrudRepository
   * @param getTargetRepository  - either a dictionary of target model type - target repository instance
   * or a single target repository instance
   * e.g. if the target is of a non-polymorphic type "Student", put the studentRepositoryGetterInstance
   * if the target is of a polymorphic type "Person" which can be either a "Student" or a "Teacher"
   * then put "{Student: studentRepositoryGetterInstance, Teacher: teacherRepositoryGetterInstance}"
   * @param constraint - the key value pair representing foreign key name to constrain
   * the target repository instance
   * @param targetResolver - () => Target to resolve the target class
   * e.g. if the target is of type "Student", then put "() => Student"
   */

  constructor(
    public getTargetRepository:
      | Getter<TargetRepository>
      | {
          [repoType: string]: Getter<TargetRepository>;
        },
    public constraint: DataObject<TargetEntity>,
    public targetResolver: TypeResolver<Entity, typeof Entity>,
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
    options?: Options & {polymorphicType?: string},
  ): Promise<TargetEntity> {
    let polymorphicTypeName = options?.polymorphicType;
    if (polymorphicTypeName) {
      if (!this.getTargetRepositoryDict[polymorphicTypeName]) {
        throw new InvalidPolymorphismError(polymorphicTypeName);
      }
    } else {
      if (Object.keys(this.getTargetRepositoryDict).length > 1) {
        console.warn(
          'It is highly recommended to specify the polymorphicType param when using polymorphic types.',
        );
      }
      polymorphicTypeName = this.targetResolver().name;
      if (!this.getTargetRepositoryDict[polymorphicTypeName]) {
        throw new InvalidPolymorphismError(polymorphicTypeName);
      }
    }
    const targetRepository =
      await this.getTargetRepositoryDict[polymorphicTypeName]();
    return targetRepository.create(
      constrainDataObject(targetModelData, this.constraint),
      options,
    );
  }

  async get(
    filter?: Pick<
      Filter<TargetEntity>,
      Exclude<keyof Filter<TargetEntity>, 'where'>
    >,
    options?: Options & {polymorphicType?: string | string[]},
  ): Promise<TargetEntity> {
    let polymorphicTypes = options?.polymorphicType;
    let allKeys: string[];
    if (Object.keys(this.getTargetRepositoryDict).length <= 1) {
      allKeys = Object.keys(this.getTargetRepositoryDict);
    } else if (!polymorphicTypes || polymorphicTypes.length === 0) {
      console.warn(
        'It is highly recommended to specify the polymorphicType param when using polymorphic types.',
      );
      allKeys = Object.keys(this.getTargetRepositoryDict);
    } else {
      if (typeof polymorphicTypes === 'string') {
        polymorphicTypes = [polymorphicTypes];
      }
      allKeys = [];
      new Set(polymorphicTypes!).forEach(element => {
        if (Object.keys(this.getTargetRepositoryDict).includes(element)) {
          allKeys.push(element);
        }
      });
    }
    for (const key of allKeys) {
      const targetRepository = await this.getTargetRepositoryDict[key]();
      const found = await targetRepository.find(
        Object.assign({limit: 1}, constrainFilter(filter, this.constraint)),
        {...options, polymorphicType: key},
      );
      if (found.length >= 1) {
        return found[0];
      }
    }
    // We don't have a direct access to the foreign key value here :(
    const id = 'constraint ' + JSON.stringify(this.constraint);
    throw new EntityNotFoundError(this.targetResolver().name, id);
  }

  async delete(
    options?: Options & {polymorphicType?: string | string[]},
  ): Promise<Count> {
    let polymorphicTypes = options?.polymorphicType;
    let allKeys: string[];
    if (Object.keys(this.getTargetRepositoryDict).length <= 1) {
      allKeys = Object.keys(this.getTargetRepositoryDict);
    } else if (!polymorphicTypes || polymorphicTypes.length === 0) {
      console.warn(
        'It is highly recommended to specify the polymorphicType param when using polymorphic types.',
      );
      allKeys = Object.keys(this.getTargetRepositoryDict);
    } else {
      if (typeof polymorphicTypes === 'string') {
        polymorphicTypes = [polymorphicTypes];
      }
      allKeys = [];
      new Set(polymorphicTypes!).forEach(element => {
        if (Object.keys(this.getTargetRepositoryDict).includes(element)) {
          allKeys.push(element);
        }
      });
    }
    let total = 0;
    for (const key of allKeys) {
      const targetRepository = await this.getTargetRepositoryDict[key]();
      total +=
        (
          await targetRepository.deleteAll(
            constrainWhere({}, this.constraint as Where<TargetEntity>),
            options,
          )
        )?.count ?? 0;
    }
    return {count: total};
  }

  async patch(
    dataObject:
      | DataObject<TargetEntity>
      | {[polymorphicType: string]: DataObject<TargetEntity>},
    options?: Options & {isPolymorphic?: boolean},
  ): Promise<Count> {
    const isMultipleTypes = options?.isPolymorphic;
    let allKeys: string[];
    if (!isMultipleTypes) {
      if (Object.keys(this.getTargetRepositoryDict).length > 1) {
        console.warn(
          'It is highly recommended to specify the isPolymorphic param and pass in a dictionary of dataobjects when using polymorphic types.',
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
    let total = 0;
    for (const key of allKeys) {
      const targetRepository = await this.getTargetRepositoryDict[key]();
      total +=
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
              this.constraint,
            ),
            constrainWhere({}, this.constraint as Where<TargetEntity>),
            options,
          )
        )?.count ?? 0;
    }
    return {count: total};
  }
}
