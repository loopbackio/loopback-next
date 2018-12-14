// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

// tslint:disable:no-unused

import {EntityCrudRepository, repository} from '../..';
import {Customer} from '../models/customer.model';
/**
 * Controller for Customer
 */
// @controller

export class CustomerController {
  constructor(
    // Use constructor dependency injection
    // tslint:disable-next-line:no-unused
    @repository('Customer', 'mongodbDataSource')
    private _repository: EntityCrudRepository<Customer, string>,
  ) {}
}
