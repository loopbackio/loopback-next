#!/usr/bin/env node
// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback-next
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
'use strict';

function run(argv) {
  const utils = require('./utils');
  const fs = require('fs');
  const path = require('path');
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

  return utils.runCLI('strong-docs/bin/cli', ['-o', 'api-docs']);
}

module.exports = run;
if (require.main === module) run(process.argv);
