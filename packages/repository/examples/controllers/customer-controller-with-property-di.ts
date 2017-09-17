// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

// tslint:disable:no-unused-variable

import {EntityCrudRepository} from '../../src/repository';
import {repository} from '../../src/decorators/repository';
import {Customer} from '../models/customer';

/**
 * Controller for Customer
 */
// @controller
export class CustomerController {
  // Use property dependency injection
  @repository('Customer', 'mongodbDataSource')
  private repository: EntityCrudRepository<Customer, string>;
}
