
'use strict';
// Call sdocs
require('child_process').spawn(
  '../../node_modules/strong-docs/bin/cli.js',
  ['-o', 'api-docs']
).on('close', (number, signal) => (process.exitCode = number));
