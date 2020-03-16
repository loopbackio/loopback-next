// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-passport-login
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ModelCrudRestApiConfig} from '@loopback/rest-crud';
import {User} from '../models/user.model';

module.exports = <ModelCrudRestApiConfig>{
  model: User,
  pattern: 'CrudRest',
  dataSource: 'db',
  basePath: '/users',
};
