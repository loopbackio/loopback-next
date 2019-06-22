// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/test-repository-mysql
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {DefaultCrudRepository} from '@loopback/repository';
import {
  CrudRepositoryCtor,
  crudRepositoryTestSuite,
} from '@loopback/repository-tests';
import {MYSQL_CONFIG, MYSQL_FEATURES} from './mysql.datasource';

describe('MySQL + DefaultCrudRepository', () => {
  crudRepositoryTestSuite(
    MYSQL_CONFIG,
    // Workaround for https://github.com/microsoft/TypeScript/issues/31840
    DefaultCrudRepository as CrudRepositoryCtor,
    MYSQL_FEATURES,
  );
});
