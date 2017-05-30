// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/juggler
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {EntityCrudRepository} from '../../src/repository';
import {Customer} from '../models/customer';
import {repository} from '../../src/decorator';
/**
 * Controller for Customer
 */
// @controller
export class CustomerController2 {
  constructor(
    // Use constructor dependency injection
    @repository(Customer, 'mongodbDataSource')
    private repository: EntityCrudRepository<Customer, string>) {
  }
}
