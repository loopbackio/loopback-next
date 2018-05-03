#!/usr/bin/env node
// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/build
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/*
========

Usage:
  node ./bin/run-prettier

========
*/

'use strict';

function run(argv, options) {
  const utils = require('./utils');

  const prettierOpts = argv.slice(2);

  const isConfigSet = utils.isOptionSet(
    prettierOpts,
    '--find-config-path',
    '--no-config',
    '--config',
  );
  const configFile = isConfigSet ? null : utils.getConfigFile('.prettierrc');

  const args = ['--config-precedence', 'prefer-file'];
  if (configFile) {
    args.push('--config', configFile);
  }
  args.push(...prettierOpts);

  return utils.runCLI('prettier/bin-prettier', args, options);
}

module.exports = run;
if (require.main === module) run(process.argv);
