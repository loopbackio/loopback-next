// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as _ from 'lodash';
import {Entity, EntityCrudRepository, Filter, Options, Where} from '..';

/**
 * Finds model instances that contain any of the provided foreign key values.
 *
 * @param targetRepository - The target repository where the model instances are found
 * @param fkName - Name of the foreign key
 * @param fkValues - Array of the values of the foreign keys to be included
 * @param scope - Additional scope constraints (not currently supported)
 * @param options - Options for the operations
 */
export async function findByForeignKeys<
  Target extends Entity,
  TargetID,
  TargetRelations extends object,
  ForeignKey
>(
  targetRepository: EntityCrudRepository<Target, TargetID, TargetRelations>,
  fkName: StringKeyOf<Target>,
  fkValues: ForeignKey[],
  scope?: Filter<Target>,
  options?: Options,
): Promise<(Target & TargetRelations)[]> {
  // throw error if scope is defined and non-empty
  // see https://github.com/strongloop/loopback-next/issues/3453
  if (scope && !_.isEmpty(scope)) {
    throw new Error('scope is not supported');
  }

  const where = ({
    [fkName]: fkValues.length === 1 ? fkValues[0] : {inq: fkValues},
  } as unknown) as Where<Target>;
  const targetFilter = {where};

  return targetRepository.find(targetFilter, options);
}

export type StringKeyOf<T> = Extract<keyof T, string>;
