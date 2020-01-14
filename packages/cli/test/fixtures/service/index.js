// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const DATASOURCE_APP_PATH = 'src/datasources';
const CONFIG_PATH = '.';
const DUMMY_CONTENT = '--DUMMY VALUE--';

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
    file: 'myds.datasource.config.json',
    content: JSON.stringify({
      name: 'myds',
      connector: 'soap',
    }),
  },
  {
    path: DATASOURCE_APP_PATH,
    file: 'map-ds.datasource.config.json',
    content: JSON.stringify({
      name: 'MapDS',
      connector: 'soap',
    }),
  },
  {
    path: DATASOURCE_APP_PATH,
    file: 'myds.datasource.ts',
    content: DUMMY_CONTENT,
  },
  {
    path: DATASOURCE_APP_PATH,
    file: 'dbmem.datasource.config.json',
    content: JSON.stringify({
      name: 'dbmem',
      connector: 'memory',
    }),
  },
  {
    path: DATASOURCE_APP_PATH,
    file: 'dbmem.datasource.ts',
    content: DUMMY_CONTENT,
  },
  {
    path: DATASOURCE_APP_PATH,
    file: 'restdb.datasource.config.json',
    content: JSON.stringify({
      name: 'restdb',
      connector: 'rest',
    }),
  },
  {
    path: DATASOURCE_APP_PATH,
    file: 'restdb.datasource.ts',
    content: DUMMY_CONTENT,
  },
  {
    path: DATASOURCE_APP_PATH,
    file: 'no-name.datasource.config.json',
    content: JSON.stringify({
      connector: 'rest',
    }),
  },
  {
    path: DATASOURCE_APP_PATH,
    file: 'no-name.datasource.ts',
    content: DUMMY_CONTENT,
  },
];
