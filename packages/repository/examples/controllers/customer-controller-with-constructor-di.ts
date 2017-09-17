// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

// tslint:disable:no-unused-variable

import {EntityCrudRepository} from '../../src/repository';
import {Customer} from '../models/customer';
import {repository} from '../../src/decorators/repository';
/**
 * Controller for Customer
 */
// @controller

export class CustomerController {
  constructor(
    // Use constructor dependency injection
    // tslint:disable-next-line:no-unused-variable
    @repository('Customer', 'mongodbDataSource')
    private _repository: EntityCrudRepository<Customer, string>,
  ) {}
}
