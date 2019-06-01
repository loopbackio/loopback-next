// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {EntityCrudRepository, repository} from '../..';
import {Customer} from '../models/customer.model';
/**
 * Controller for Customer
 */
// @controller

export class CustomerController {
  constructor(
    // Use constructor dependency injection
    @repository('Customer', 'mongodbDataSource')
    private _repository: EntityCrudRepository<Customer, string>,
  ) {}
}
