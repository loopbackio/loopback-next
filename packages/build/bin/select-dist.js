#!/usr/bin/env node
// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/build
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/*
========

Usage:
  node ./bin/select-dist command [arguments...]

The script will scan all arguments (including the command) and replace
the string dist with either dist or dist6, depending on the current
Node.js version.

Then the provided command is executed with the modified arguments.

Example usage:

  node ./bin/select-dist mocha dist/test

========
*/

'use strict';

function run(argv, options) {
  const utils = require('./utils');
  const dist = utils.getDistribution();

  const args = argv.slice(2).map(a => a.replace(/\bDIST\b/g, dist));
  const command = args.shift();

  return utils.runShell(command, args, options);
}

module.exports = run;
if (require.main === module) run(process.argv);
