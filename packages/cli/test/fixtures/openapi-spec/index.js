const fs = require('fs');

exports.SANDBOX_FILES = [
  {
    path: '.',
    file: 'index.js',
    content: fs.readFileSync(require.resolve('./index.js.txt')),
  },
  {
    path: '.',
    file: 'openapi.json',
    content: fs.readFileSync(require.resolve('./openapi.json')),
  },
];
