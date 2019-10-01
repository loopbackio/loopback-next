// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/test-repository-mongodb
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {CrudFeatures, DataSourceOptions} from '@loopback/repository-tests';

const connector = require('loopback-connector-mongodb');

export const MONGODB_CONFIG: DataSourceOptions = {
  connector,
  host: process.env.MONGODB_HOST || 'localhost',
  port: process.env.MONGODB_PORT || 27017,
  database: process.env.MONGODB_DATABASE || 'repository_tests',
};

export const MONGODB_FEATURES: Partial<CrudFeatures> = {
  idType: 'string',
  supportsTransactions: false,
};
