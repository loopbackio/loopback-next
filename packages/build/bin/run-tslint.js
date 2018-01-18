#!/usr/bin/env node
// Copyright IBM Corp. 2017,2018. All Rights Reserved.
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

function run(argv, dryRun) {
  const utils = require('./utils');

  const tslintOpts = argv.slice(2);

  const isConfigSet = utils.isOptionSet(tslintOpts, '-c', '--config');
  const isProjectSet = utils.isOptionSet(tslintOpts, '-p', '--project');

  const tslintConfigFile = isConfigSet
    ? null
    : utils.getConfigFile('tslint.build.json', 'tslint.json');
  const tsConfigFile = isProjectSet
    ? null
    : utils.getConfigFile('tsconfig.build.json', 'tsconfig.json');

  const args = [];
  if (tsConfigFile) {
    args.push('-p', tsConfigFile);
  }
  if (tslintConfigFile) {
    args.push('-c', tslintConfigFile);
  }
  args.push(...tslintOpts);

  return utils.runCLI('tslint/bin/tslint', args, dryRun);
}

module.exports = run;
if (require.main === module) run(process.argv);
