#!/usr/bin/env node
// Copyright IBM Corp. and LoopBack contributors 2017,2020. All Rights Reserved.
// Node module: @loopback/build
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/*
========

Usage:
  node ./bin/run-clean file1 file2 ...

The script will `rm -rf` all files/folders.

Then the provided command is executed with the modified arguments.

Example usage:

  node ./bin/run-clean dist dist6

========
*/

'use strict';
const {rimrafSync} = require('rimraf');
const path = require('path');

function run(argv, options) {
  const globPatterns = argv.slice(2);
  const removed = [];
  if (!globPatterns.length) {
    console.error('Please specify file patterns to remove.');
    process.exit(1);
  }
  // Keep it backward compatible as dryRun
  if (typeof options === 'boolean') options = {dryRun: options};
  options = options || {};
  globPatterns.forEach(pattern => {
    const relativePath = path.relative(process.cwd(), pattern);
    if (relativePath.indexOf('..') !== -1) {
      if (!options.dryRun) {
        console.error(
          'Skipping ' +
            pattern +
            ' as it is not inside the project root directory.',
        );
      }
    } else {
      if (!options.dryRun) rimrafSync(pattern, {glob: true});
      removed.push(pattern);
    }
  });
  return 'rm -rf ' + removed.join(' ');
}

module.exports = run;
if (require.main === module) run(process.argv);
