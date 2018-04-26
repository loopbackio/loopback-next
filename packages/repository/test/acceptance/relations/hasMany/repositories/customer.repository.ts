// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Customer} from '../models/customer.model';
import {inject, Context} from '@loopback/core';
import {
  DefaultCrudRepository,
  DataSourceType,
} from '../../../../../src/repositories';

export class CustomerRepository extends DefaultCrudRepository<
  Customer,
  typeof Customer.prototype.id
> {
  constructor(protected datasource: DataSourceType) {
    super(Customer, datasource);
  }
}
