// Copyright IBM Corp. and LoopBack contributors 2018,2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Getter} from '@loopback/core';
import {EntityNotFoundError, TypeResolver} from '../../';
import {DataObject, Options} from '../../common-types';
import {Entity} from '../../model';
import {constrainFilter, EntityCrudRepository} from '../../repositories';
/**
 * CRUD operations for a target repository of a BelongsTo relation
 */
export interface BelongsToRepository<Target extends Entity> {
  /**
   * Gets the target model instance
   * @param options
   * options.polymorphicType - a string or a string array of polymorphic type names
   * to specify which repositories should are expected to be searched
   * It is highly recommended to contain this param especially for
   * datasources using deplicated ids across tables
   * @returns A promise resolved with the target object or rejected
   * with an EntityNotFoundError when target model instance was not found.
   */
  get(
    options?: Options & {polymorphicType?: string | string[]},
  ): Promise<Target>;
}

export class DefaultBelongsToRepository<
  TargetEntity extends Entity,
  TargetId,
  TargetRepository extends EntityCrudRepository<TargetEntity, TargetId>,
> implements BelongsToRepository<TargetEntity>
{
  /**
   * Constructor of DefaultBelongsToEntityCrudRepository
   * @param getTargetRepository - either a dictionary of target model type - target repository instance
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

  async get(
    options?: Options & {polymorphicType?: string | string[]},
  ): Promise<TargetEntity> {
    let polymorphicTypes = options?.polymorphicType;
    let allKeys: string[];
    if (Object.keys(this.getTargetRepositoryDict).length <= 1) {
      allKeys = Object.keys(this.getTargetRepositoryDict);
    } else if (!polymorphicTypes || polymorphicTypes.length === 0) {
      console.warn(
        'It is highly recommended to specify the polymorphicTypes param when using polymorphic types.',
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
    let result: TargetEntity[] = [];
    for (const key of allKeys) {
      const targetRepository = await this.getTargetRepositoryDict[key]();
      result = result.concat(
        await targetRepository.find(
          constrainFilter(undefined, this.constraint),
          {...options, polymorphicType: key},
        ),
      );
      if (result.length >= 1) {
        return result[0];
      }
    }
    // We don't have a direct access to the foreign key value here :(
    const id = 'constraint ' + JSON.stringify(this.constraint);
    throw new EntityNotFoundError(this.targetResolver().name, id);
  }
}
