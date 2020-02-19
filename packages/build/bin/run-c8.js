#!/usr/bin/env node
// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/build
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/*
========

Usage:
  node ./bin/run-c8

========
*/

'use strict';

function run(argv, options) {
  const utils = require('./utils');

  const c8Opts = argv.slice(2);
  const args = [...c8Opts];

  return utils.runCLI('c8/bin/c8', args, options);
}

module.exports = run;
if (require.main === module) run(process.argv);
