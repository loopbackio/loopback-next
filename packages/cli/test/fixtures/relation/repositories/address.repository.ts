// Copyright The LoopBack Authors 2020,2021. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {DefaultCrudRepository, BelongsToAccessor} from '@loopback/repository';
import {Address, Customer} from '../models';
import {DbDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class AddressRepository extends DefaultCrudRepository<
  Address,
  typeof Address.prototype.id
> {
  public readonly myCustomer: BelongsToAccessor<
    Customer,
    typeof Address.prototype.id
  >;
  constructor(@inject('datasources.db') dataSource: DbDataSource) {
    super(Address, dataSource);
  }
}
