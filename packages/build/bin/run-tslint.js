#!/usr/bin/env node
// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: @loopback/build
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/*
========

Usage:
  node ./bin/run-tslint

========
*/

'use strict';

function run(argv) {
  const utils = require('./utils');

  const tslintOpts = argv.slice(2);
  const tsConfigFile = utils.getConfigFile('tsconfig.build.json');

  const args = ['-p', tsConfigFile, ...tslintOpts];

  return utils.runCLI('tslint/bin/tslint', args);
}

module.exports = run;
if (require.main === module) run(process.argv);
