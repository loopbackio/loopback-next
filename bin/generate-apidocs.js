'use strict';
var fs = require('fs');
var path = require('path');
var tsPath;
try {
  tsPath = require.resolve('typedoc/node_modules/typescript/package.json');
} catch (e) {
  // Ignore the error
}
if (tsPath) {
  tsPath = path.resolve(tsPath, '..');
  // Rename the nested typescript module for typedoc so that it uses the
  // typescript version for our projects
  try {
    fs.renameSync(tsPath, tsPath + '.bak');
  } catch (e) {
    // Ignore the error
  }
}
const spawn = require('child_process').spawn;
// Call sdocs
spawn(
  process.execPath,
  [require.resolve('strong-docs/bin/cli'), '-o', 'api-docs'],
  {stdio: 'inherit'}
).on('close', (number, signal) => (process.exitCode = number));
