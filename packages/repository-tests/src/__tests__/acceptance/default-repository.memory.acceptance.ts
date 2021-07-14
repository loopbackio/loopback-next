// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository-tests
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {DefaultCrudRepository} from '@loopback/repository';
import {CrudRepositoryCtor, crudRepositoryTestSuite} from '../..';

describe('DefaultCrudRepository + memory connector', () => {
  crudRepositoryTestSuite(
    {connector: 'memory'},
    // Workaround for the following TypeScript error
    //   Type 'DefaultCrudRepository<T, ID, {}>' is not assignable to
    //     type 'EntityCrudRepository<T, ID, Relations>'.
    // See https://github.com/microsoft/TypeScript/issues/31840
    DefaultCrudRepository as CrudRepositoryCtor,
    {
      idType: 'number',
      supportsTransactions: false,
    },
  );
});
