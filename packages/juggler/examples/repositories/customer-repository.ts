// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/juggler
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Options} from '../../src/common';
import {Where} from '../../src/query';
import {DataSource} from '../../src/datasource';

import {EntityCrudRepository, CrudRepositoryImpl} from '../../src/repository';
import {Customer} from '../models/customer';

/**
 * A custom repository implementation
 */
export class CustomerRepository extends CrudRepositoryImpl<Customer, string> {
  constructor(dataSource: DataSource, model: Customer) {
    super(dataSource, Customer);
  }

 /**
  * Override deleteAll to disable the operation
  */
  deleteAll(where?: Where, options?: Options) {
    return Promise.reject(new Error('deleteAll is disabled'));
  }
}
