// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/juggler
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {EntityCrudRepository} from '../../src/repository';
import {repository} from '../../src/decorator';
import {Customer} from '../models/customer';

/**
 * Controller for Customer
 */
// @controller
export class CustomerController1 {
  // Use property dependency injection
  @repository(Customer, 'mongodbDataSource')
  private repository: EntityCrudRepository<Customer, string>;
}
