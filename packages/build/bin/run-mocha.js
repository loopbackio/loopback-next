#!/usr/bin/env node
// Copyright IBM Corp. and LoopBack contributors 2018,2020. All Rights Reserved.
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

  const mochaOpts = argv.slice(2);

  const setMochaOpts =
    !utils.isOptionSet(
      mochaOpts,
      '--config', // mocha 6.x
      '--package', // mocha 6.x
      '--no-config', // mocha 6.x
    ) && !utils.mochaConfiguredForProject();

  // Add default options
  // Keep it backward compatible as dryRun
  if (typeof options === 'boolean') options = {dryRun: options};
  options = options || {};
  if (setMochaOpts) {
    // Use the default `.mocharc.json` from `@loopback/build`
    const mochaOptsFile = utils.getConfigFile('.mocharc.json');
    mochaOpts.unshift('--config', mochaOptsFile);
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

  // Allow `--lang en_US.UTF-8`
  const lang = mochaOpts.indexOf('--lang');
  if (lang !== -1) {
    process.env.LANG = mochaOpts[lang + 1];
    mochaOpts.splice(lang, 2);
  }

  const args = [...mochaOpts];

  return utils.runCLI('mocha/bin/mocha', args, options);
}

module.exports = run;
if (require.main === module) run(process.argv);
