// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-passport-login
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {DefaultCrudRepository} from '@loopback/repository';
import {UserIdentity} from '../models';
import {DbDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class UserIdentityRepository extends DefaultCrudRepository<
  UserIdentity,
  typeof UserIdentity.prototype.id,
  UserIdentity
> {
  constructor(@inject('datasources.db') dataSource: DbDataSource) {
    super(UserIdentity, dataSource);
  }
}
