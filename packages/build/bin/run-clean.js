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

function run(argv, dryRun) {
  const fs = require('fs-extra');
  const path = require('path');
  const utils = require('./utils');
  var files = argv.slice(2);
  var removed = [];
  if (!files.length) {
    files = [utils.getDistribution()];
  }
  files.forEach(f => {
    var file = path.relative(process.cwd(), f);
    if (file.indexOf('..') !== -1) {
      console.error('Skipping ' + f + ' as it is not inside the project');
    } else {
      if (!dryRun) fs.removeSync(f);
      removed.push(f);
    }
  });
  return 'rm -rf ' + removed.join(' ');
}

module.exports = run;
if (require.main === module) run(process.argv);
