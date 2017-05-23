// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: juggler
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {EntityCrudRepository} from '../../src/repository';
import {Customer} from '../models/customer';
import {repository} from '../../src/decorator';

/**
 * Controller for Customer
 */
// @controller

// Use class level @repository decorator to mixin repository methods into the
// controller class

// Style 1
// Create a repository that binds Customer to mongodbDataSource
@repository(Customer, 'mongodbDataSource')
// Style 2
// Reference a pre-configured repository by name. This is close to LoopBack
// 3.x model-config.json
// @repository('myCustomerRepository')
export class CustomerController3 {
}
