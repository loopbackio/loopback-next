#!/usr/bin/env node
// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/build
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/*
========

Usage:
  node ./bin/run-mocha

========
*/

'use strict';

function run(argv, options) {
  const utils = require('./utils');

  // Substitute the dist variable with the dist folder
  const dist = utils.getDistribution();
  const mochaOpts = argv.slice(2).map(a => a.replace(/\bDIST\b/g, dist));

  const setMochaOpts =
    !utils.isOptionSet(mochaOpts, '--opts') &&
    !utils.mochaOptsFileProjectExists();

  // Add default options
  // Keep it backward compatible as dryRun
  if (typeof options === 'boolean') options = {dryRun: options};
  options = options || {};
  if (setMochaOpts) {
    const mochaOptsFile = utils.getConfigFile('mocha.opts');
    mochaOpts.unshift('--opts', mochaOptsFile);
  }

  const allowConsoleLogsIx = mochaOpts.indexOf('--allow-console-logs');
  if (allowConsoleLogsIx === -1) {
    // Fail any tests that are printing to console.
    mochaOpts.unshift(
      '--no-warnings', // Disable node.js warnings
      '--require',
      require.resolve('../src/fail-on-console-logs'),
    );
  } else {
    // Allow tests to print to console, remove --allow-console-logs argument
    mochaOpts.splice(allowConsoleLogsIx, 1);
  }

  const args = [...mochaOpts];

  return utils.runCLI('mocha/bin/mocha', args, options);
}

module.exports = run;
if (require.main === module) run(process.argv);
