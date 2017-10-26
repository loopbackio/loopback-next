#!/usr/bin/env node
// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback-next
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/*
========

Usage:
  node ./bin/compile-package <target>

Where <target> is either es2017 or es2015.

========
*/

'use strict';

function run(argv) {
  const utils = require('./utils');
  const path = require('path');
  const fs = require('fs');

  const packageDir = utils.getPackageDir();

  const compilerOpts = argv.slice(2);
  let target = compilerOpts.shift();

  if (!target) {
    target = utils.getCompilationTarget();
  }

  let outDir = utils.getDistribution();

  const tsConfigFile = path.join(utils.getPackageDir(), 'tsconfig.build.json');
  var baseConfigFile = path.join(
    utils.getRootDir(),
    'config/tsconfig.common.json'
  );
  baseConfigFile = path.relative(utils.getPackageDir(), baseConfigFile);
  if (!fs.existsSync(tsConfigFile)) {
    fs.writeFileSync(
      tsConfigFile,
      JSON.stringify(
        {
          extends: baseConfigFile,
          include: ['src', 'test'],
          exclude: [
            'node_modules/**',
            'packages/*/node_modules/**',
            '**/*.d.ts',
          ],
        },
        null,
        '  '
      )
    );
  }

  const args = [
    '-p',
    tsConfigFile,
    '--target',
    target,
    '--outDir',
    path.join(packageDir, outDir),
    ...compilerOpts,
  ];

  return utils.runCLI('typescript/lib/tsc', args);
}

module.exports = run;
if (require.main === module) run(process.argv);
