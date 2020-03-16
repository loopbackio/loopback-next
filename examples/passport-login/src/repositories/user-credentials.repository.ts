// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-passport-login
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {DefaultCrudRepository} from '@loopback/repository';
import {UserCredentials} from '../models';
import {DbDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class UserCredentialsRepository extends DefaultCrudRepository<
  UserCredentials,
  typeof UserCredentials.prototype.id,
  UserCredentials
> {
  constructor(@inject('datasources.db') dataSource: DbDataSource) {
    super(UserCredentials, dataSource);
  }
}
