// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/example-todo
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {CrudRestApiConfig} from '@loopback/rest-crud';
import {Todo} from '../models';

module.exports = <CrudRestApiConfig>{
  model: Todo,
  pattern: 'CrudRest',
  dataSource: 'db',
  basePath: '/todos',
};
