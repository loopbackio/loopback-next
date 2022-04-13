// Copyright IBM Corp. and LoopBack contributors 2020. All Rights Reserved.
// Node module: @loopback/example-passport-login
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {UserIdentity} from '../models';

export class UserIdentityRepository extends DefaultCrudRepository<
  UserIdentity,
  typeof UserIdentity.prototype.id,
  UserIdentity
> {
  constructor(@inject('datasources.db') dataSource: DbDataSource) {
    super(UserIdentity, dataSource);
  }
}
