// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/example-getting-started
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  DefaultCrudRepository,
  DataSourceType,
} from '../../../../../src/repositories';
import {Order} from '../models/order.model';
import {inject} from '@loopback/core';

export class OrderRepository extends DefaultCrudRepository<
  Order,
  typeof Order.prototype.id
> {
  constructor(protected datasource: DataSourceType) {
    super(Order, datasource);
  }
}
