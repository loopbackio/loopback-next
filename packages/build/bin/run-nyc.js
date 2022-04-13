#!/usr/bin/env node
// Copyright IBM Corp. and LoopBack contributors 2017,2020. All Rights Reserved.
// Node module: @loopback/build
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/*
========

Usage:
  node ./bin/run-nyc

========
*/

'use strict';

function run(argv, options) {
  const utils = require('./utils');

  const nycOpts = argv.slice(2);
  const args = [...nycOpts];

  return utils.runCLI('nyc/bin/nyc', args, options);
}

module.exports = run;
if (require.main === module) run(process.argv);
