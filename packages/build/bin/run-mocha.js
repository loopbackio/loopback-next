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
  const path = require('path');

  // Substitute the DIST variable with the dist folder
  const dist = utils.getDistribution();
  const mochaOpts = argv.slice(2).map(a => a.replace(/\bDIST\b/g, dist));

  // Add default options
  if (mochaOpts.indexOf('--opts') === -1) {
    const optsPath = require.resolve('../mocha.opts');
    mochaOpts.unshift('--opts', optsPath);
  }

  // Add source map support
  if (mochaOpts.indexOf('source-map-support/register') === -1) {
    // Resolve source-map-support so that the path can be used by mocha
    const sourceMapRegisterPath = require.resolve(
      'source-map-support/register',
    );
    mochaOpts.unshift('--require', sourceMapRegisterPath);
  }

  const allowConsoleLogsIx = mochaOpts.indexOf('--allow-console-logs');
  if (allowConsoleLogsIx === -1) {
    // Fail any tests that are printing to console.
    mochaOpts.unshift(
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
