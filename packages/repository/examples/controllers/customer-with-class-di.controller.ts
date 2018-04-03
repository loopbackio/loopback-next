// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {repository} from '../..';

/**
 * Controller for Customer
 */
// @controller

// Use class level @repository decorator to mixin repository methods into the
// controller class

// Style 1
// Create a repository that binds Customer to mongodbDataSource
@repository('Customer', 'mongodbDataSource')
export class CustomerController {}
