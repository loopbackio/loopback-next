#!/usr/bin/env node
// Copyright IBM Corp. and LoopBack contributors 2019,2020. All Rights Reserved.
// Node module: @loopback/build
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/*
========

Usage:
  node ./bin/run-eslint

========
*/

'use strict';

function run(argv, options) {
  const utils = require('./utils');

  const eslintOpts = argv.slice(2);

  const isConfigSet = utils.isOptionSet(eslintOpts, '-c', '--config');
  const isExtSet = utils.isOptionSet(eslintOpts, '--ext');

  const eslintConfigFile = isConfigSet
    ? null
    : utils.getConfigFile('.eslintrc.js', '.eslintrc.json');

  const eslintIgnoreFile = utils.getConfigFile('.eslintignore');

  const args = [];
  if (eslintConfigFile) {
    args.push('-c', eslintConfigFile);
  }
  if (eslintIgnoreFile) {
    args.push('--ignore-path', eslintIgnoreFile);
  }

  if (!isExtSet) {
    args.push('--ext', '.js,.ts');
  }
  args.push(...eslintOpts);

  return utils.runCLI('eslint/bin/eslint', args, options);
}

module.exports = run;
if (require.main === module) run(process.argv);
