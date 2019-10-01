// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/test-repository-postgresql
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {CrudFeatures, DataSourceOptions} from '@loopback/repository-tests';

const connector = require('loopback-connector-postgresql');

export const POSTGRESQL_CONFIG: DataSourceOptions = {
  connector,
  host: process.env.POSTGRESQL_HOST || 'localhost',
  port: process.env.POSTGRESQL_PORT || 5432,
  database: process.env.POSTGRESQL_DATABASE || 'repository_tests',
  username: process.env.POSTGRESQL_USER || 'root',
  password: process.env.POSTGRESQL_PASSWORD || 'pass',
};

export const POSTGRESQL_FEATURES: Partial<CrudFeatures> = {
  idType: 'number',
  freeFormProperties: false,
  emptyValue: null,
  supportsTransactions: true,
};
