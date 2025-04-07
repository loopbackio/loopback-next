const fs = require('fs');

exports.SANDBOX_FILES = [
  {
    path: 'dist/datasources',
    file: 'mem.datasource.js',
    content: fs.readFileSync(require.resolve('./mem.datasource.js.txt')),
  },
  {
    path: 'src/datasources',
    file: 'mem.datasource.ts',
    content: fs.readFileSync(require.resolve('./mem.datasource.ts.txt')),
  },
  {
    path: 'src/datasources',
    file: 'index.ts',
    content: `export * from './mem.datasource';\n`,
  },
];
