// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/test-repository-mysql
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {CrudFeatures, DataSourceOptions} from '@loopback/repository-tests';

const connector = require('loopback-connector-mysql');

export const MYSQL_CONFIG: DataSourceOptions = {
  connector,
  host: process.env.MYSQL_HOST || 'localhost',
  port: process.env.MYSQL_PORT || 3306,
  database: process.env.MYSQL_DATABASE || 'repository_tests',
  username: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  createDatabase: true,
};

export const MYSQL_FEATURES: Partial<CrudFeatures> = {
  idType: 'number',
  freeFormProperties: false,
  emptyValue: null,
  supportsTransactions: true,
};
