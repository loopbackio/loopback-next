// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {EntityCrudRepository, repository} from '../..';
import {Customer} from '../models/customer.model';

/**
 * Controller for Customer
 */
export class CustomerController {
  constructor(
    // Use constructor dependency injection
    @repository('Customer', 'mongodbDataSource')
    public repo: EntityCrudRepository<Customer, string>,
  ) {}
}
