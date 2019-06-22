const fs = require('fs');

exports.SANDBOX_FILES = [
  {
    path: 'dist/datasources',
    file: 'mem.datasource.js',
    content: fs.readFileSync(require.resolve('./mem.datasource.js.txt')),
  },
];
