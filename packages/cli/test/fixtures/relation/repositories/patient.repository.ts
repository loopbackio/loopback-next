// Copyright The LoopBack Authors 2020,2021. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {DefaultCrudRepository} from '@loopback/repository';
import {Patient} from '../models';
import {DbDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class PatientRepository extends DefaultCrudRepository<
  Patient,
  typeof Patient.prototype.id
> {
  constructor(@inject('datasources.db') dataSource: DbDataSource) {
    super(Patient, dataSource);
  }
}
