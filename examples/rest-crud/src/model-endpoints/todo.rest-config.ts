// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-rest-crud
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ModelCrudRestApiConfig} from '@loopback/rest-crud';
import {Todo} from '../models';

module.exports = <ModelCrudRestApiConfig>{
  model: Todo,
  pattern: 'CrudRest',
  dataSource: 'db',
  basePath: '/todos',
};
