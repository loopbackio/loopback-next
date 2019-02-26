// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/* eslint-disable @typescript-eslint/no-unused-vars */

import {EntityCrudRepository, repository} from '../..';
import {Customer} from '../models/customer.model';

/**
 * Controller for Customer
 */
// @controller
export class CustomerController {
  // Use property dependency injection
  @repository('Customer', 'mongodbDataSource')
  private repository: EntityCrudRepository<Customer, string>;
}
