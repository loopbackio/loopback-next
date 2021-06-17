// Copyright The LoopBack Authors 2020,2021. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {DbDataSource} from '../datasources';

export class OrderInheritanceRepository extends DefaultCrudRepository<
  OrderInheritance,
  typeof OrderInheritance.prototype.id
> {
  constructor(@inject('datasources.db') dataSource: DbDataSource) {
    super(OrderInheritance, dataSource);
  }
}
