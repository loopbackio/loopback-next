const DATASOURCE_APP_PATH = 'src/datasources';
const {getSourceForDataSourceClassWithConfig} = require('../../test-utils');
const fs = require('fs');

exports.SANDBOX_FILES = [
  {
    path: DATASOURCE_APP_PATH,
    file: 'cache.datasource.ts',
    content: getSourceForDataSourceClassWithConfig('DbkvDataSource', {
      name: 'cache',
      connector: 'kv-redis',
    }),
  },
  {
    path: 'src',
    file: 'application.ts',
    content: fs.readFileSync(require.resolve('./application.ts'), {
      encoding: 'utf-8',
    }),
  },
];
