// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/test-repository-mongodb
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {DefaultCrudRepository} from '@loopback/repository';
import {
  CrudRepositoryCtor,
  crudRepositoryTestSuite,
} from '@loopback/repository-tests';
import {MONGODB_CONFIG, MONGODB_FEATURES} from './mongodb.datasource';

describe('MongoDB + DefaultCrudRepository', () => {
  crudRepositoryTestSuite(
    MONGODB_CONFIG,
    // Workaround for https://github.com/microsoft/TypeScript/issues/31840
    DefaultCrudRepository as CrudRepositoryCtor,
    MONGODB_FEATURES,
  );
});
