'use strict';
const spawn = require('child_process').spawn;
// Call sdocs
spawn(
  process.execPath,
  [require.resolve('strong-docs/bin/cli'), '-o', 'api-docs'],
  {stdio: 'inherit'}
).on('close', (number, signal) => (process.exitCode = number));
