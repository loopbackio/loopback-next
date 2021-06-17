// Copyright The LoopBack Authors 2019,2021. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const fs = require('fs');

exports.SANDBOX_FILES = [
  {
    path: 'dist/datasources',
    file: 'mem.datasource.js',
    content: fs.readFileSync(require.resolve('./mem.datasource.js.txt')),
  },
];
