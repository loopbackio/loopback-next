#!/usr/bin/env node
// Copyright IBM Corp. 2017,2018. All Rights Reserved.
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

function run(argv, options) {
  const rimraf = require('rimraf');
  const path = require('path');
  const utils = require('./utils');
  var globPatterns = argv.slice(2);
  var removed = [];
  if (!globPatterns.length) {
    globPatterns = [utils.getDistribution()];
  }
  // Keep it backward compatible as dryRun
  if (typeof options === 'boolean') options = {dryRun: options};
  options = options || {};
  globPatterns.forEach(pattern => {
    var relativePath = path.relative(process.cwd(), pattern);
    if (relativePath.indexOf('..') !== -1) {
      if (!options.dryRun) {
        console.error(
          'Skipping ' +
            pattern +
            ' as it is not inside the project root directory.',
        );
      }
    } else {
      if (!options.dryRun) rimraf.sync(pattern);
      removed.push(pattern);
    }
  });
  return 'rm -rf ' + removed.join(' ');
}

module.exports = run;
if (require.main === module) run(process.argv);
