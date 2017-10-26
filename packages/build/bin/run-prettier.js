#!/usr/bin/env node
// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback-next
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/*
========

Usage:
  node ./bin/run-prettier

========
*/

'use strict';

function run(argv) {
  const utils = require('./utils');

  const prettierOpts = argv.slice(2);
  const configFile = utils.getConfigFile('.prettierrc');

  const args = [
    '--config',
    // It's important to keep this path relative to rootDir
    configFile,
    ...prettierOpts,
  ];

  return utils.runCLI('prettier/bin/prettier', args);
}

module.exports = run;
if (require.main === module) run(process.argv);
