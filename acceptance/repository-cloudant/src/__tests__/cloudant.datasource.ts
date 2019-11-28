// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/test-repository-cloudant
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {CrudFeatures, DataSourceOptions} from '@loopback/repository-tests';

const connector = require('loopback-connector-cloudant');

export const CLOUDANT_CONFIG: DataSourceOptions = {
  connector,
  host: process.env.CLOUDANT_HOST ?? 'localhost',
  port: process.env.CLOUDANT_PORT ?? 5984,
  username: process.env.CLOUDANT_USER ?? 'admin',
  password: process.env.CLOUDANT_PASSWORD ?? 'pass',
  database: process.env.CLOUDANT_DATABASE ?? 'repository_tests',
  url: process.env.CLOUDANT_URL ?? 'http://localhost:5984',
};

export const CLOUDANT_FEATURES: Partial<CrudFeatures> = {
  idType: 'string',
  supportsTransactions: false,
  hasRevisionToken: true,
};
