// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/test-repository-cloudant
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {DefaultCrudRepository} from '@loopback/repository';
import {
  CrudRepositoryCtor,
  crudRepositoryTestSuite,
} from '@loopback/repository-tests';
import {CLOUDANT_CONFIG, CLOUDANT_FEATURES} from './cloudant.datasource';

describe('CLOUDANT + DefaultCrudRepository', () => {
  crudRepositoryTestSuite(
    CLOUDANT_CONFIG,
    // Workaround for https://github.com/microsoft/TypeScript/issues/31840
    DefaultCrudRepository as CrudRepositoryCtor,
    CLOUDANT_FEATURES,
  );
});
