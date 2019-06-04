// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const DATASOURCE_APP_PATH = 'src/datasources';
const MODEL_APP_PATH = 'src/models';
const REPOSITORY_APP_PATH = 'src/repositories';
const CONFIG_PATH = '.';
const DUMMY_CONTENT = '--DUMMY VALUE--';
const fs = require('fs');

exports.SANDBOX_FILES = [
  {
    path: CONFIG_PATH,
    file: 'myconfig.json',
    content: JSON.stringify({
      datasource: 'dbmem',
      model: 'DecoratorDefined',
    }),
  },
  {
    path: DATASOURCE_APP_PATH,
    file: 'dbkv.datasource.json',
    content: JSON.stringify({
      name: 'dbkv',
      connector: 'kv-redis',
    }),
  },
  {
    path: DATASOURCE_APP_PATH,
    file: 'dbkv.datasource.ts',
    content: DUMMY_CONTENT,
  },
  {
    path: DATASOURCE_APP_PATH,
    file: 'dbmem.datasource.json',
    content: JSON.stringify({
      name: 'dbmem',
      connector: 'memory',
    }),
  },
  {
    path: DATASOURCE_APP_PATH,
    file: 'my-ds.datasource.json',
    content: JSON.stringify({
      name: 'MyDS',
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
    file: 'restdb.datasource.json',
    content: JSON.stringify({
      name: 'restdb',
      connector: 'rest',
    }),
  },
  {
    path: DATASOURCE_APP_PATH,
    file: 'sqlite3.datasource.json',
    content: JSON.stringify({
      name: 'sqlite3',
      connector: 'loopback-connector-sqlite3',
    }),
  },
  {
    path: DATASOURCE_APP_PATH,
    file: 'sqlite3.datasource.ts',
    content: DUMMY_CONTENT,
  },
  {
    path: DATASOURCE_APP_PATH,
    file: 'restdb.datasource.ts',
    content: DUMMY_CONTENT,
  },
  {
    path: MODEL_APP_PATH,
    file: 'decorator-defined.model.ts',
    content: fs.readFileSync(
      require.resolve('./models/decorator-defined.model.txt'),
      {
        encoding: 'utf-8',
      },
    ),
  },
  {
    path: MODEL_APP_PATH,
    file: 'default-model.model.ts',
    content: fs.readFileSync(
      require.resolve('./models/default-model.model.txt'),
      {
        encoding: 'utf-8',
      },
    ),
  },
  {
    path: MODEL_APP_PATH,
    file: 'multi-word.model.ts',
    content: fs.readFileSync(require.resolve('./models/multi-word.model.txt'), {
      encoding: 'utf-8',
    }),
  },
  {
    path: MODEL_APP_PATH,
    file: 'invalid-id.model.ts',
    content: fs.readFileSync(require.resolve('./models/invalid-id.model.txt'), {
      encoding: 'utf-8',
    }),
  },
  {
    path: MODEL_APP_PATH,
    file: 'model-1-name-with-num1.model.ts',
    content: fs.readFileSync(
      require.resolve('./models/model-1-name-with-num1.model.txt'),
      {
        encoding: 'utf-8',
      },
    ),
  },
  {
    path: REPOSITORY_APP_PATH,
    file: 'default-model.repository.base.ts',
    content: fs.readFileSync(
      require.resolve('./repositories/default-model.repository.base.ts'),
      {
        encoding: 'utf-8',
      },
    ),
  },
];
