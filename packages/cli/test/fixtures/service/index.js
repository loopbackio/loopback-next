// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const DATASOURCE_APP_PATH = 'src/datasources';
const CONFIG_PATH = '.';
const {getSourceForDataSourceClassWithConfig} = require('../../test-utils');

exports.SANDBOX_FILES = [
  {
    path: CONFIG_PATH,
    file: 'mysoapconfig.json',
    content: JSON.stringify({
      name: 'MultiWordService',
      datasource: 'myds',
    }),
  },
  {
    path: CONFIG_PATH,
    file: 'myrestconfig.json',
    content: JSON.stringify({
      name: 'myservice',
      datasource: 'restdb',
    }),
  },
  {
    path: DATASOURCE_APP_PATH,
    file: 'myds.datasource.ts',
    content: getSourceForDataSourceClassWithConfig('MydsDataSource', {
      name: 'myds',
      connector: 'soap',
    }),
  },
  {
    path: DATASOURCE_APP_PATH,
    file: 'map-ds.datasource.ts',
    content: getSourceForDataSourceClassWithConfig('MapdsDataSource', {
      name: 'MapDS',
      connector: 'soap',
    }),
  },
  {
    path: DATASOURCE_APP_PATH,
    file: 'dbmem.datasource.ts',
    content: getSourceForDataSourceClassWithConfig('DbmemDataSource', {
      name: 'dbmem',
      connector: 'memory',
    }),
  },
  {
    path: DATASOURCE_APP_PATH,
    file: 'restdb.datasource.ts',
    content: getSourceForDataSourceClassWithConfig('RestdbDataSource', {
      name: 'restdb',
      connector: 'rest',
    }),
  },
  {
    path: DATASOURCE_APP_PATH,
    file: 'no-name.datasource.ts',
    content: getSourceForDataSourceClassWithConfig('NoNameDataSource', {
      connector: 'rest',
    }),
  },
];
