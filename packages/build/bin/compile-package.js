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

function run(argv, dryRun) {
  const utils = require('./utils');
  const path = require('path');
  const fs = require('fs');

  const packageDir = utils.getPackageDir();

  const compilerOpts = argv.slice(2);

  const isTargetSet = utils.isOptionSet(compilerOpts, '--target');
  const isOutDirSet = utils.isOptionSet(compilerOpts, '--outDir');
  const isProjectSet = utils.isOptionSet(compilerOpts, '-p', '--project');

  var target;

  if (!isTargetSet) {
    // Find the last non-option argument as the `target`
    // For example `-p tsconfig.json es2017` or `es2017 -p tsconfig.json`
    for (var i = compilerOpts.length - 1; i >= 0; i--) {
      target = compilerOpts[i];
      // It's an option
      if (target.indexOf('-') === 0) {
        target = undefined;
        continue;
      }
      // It's the value of an option
      if (i >= 1 && compilerOpts[i - 1].indexOf('-') === 0) {
        target = undefined;
        continue;
      }
      // Remove the non-option
      compilerOpts.splice(i, 1);
      break;
    }

    if (!target) {
      target = utils.getCompilationTarget();
    }
  }

  var outDir;

  if (!isOutDirSet) {
    outDir = path.join(packageDir, utils.getDistribution(target));
  }

  var tsConfigFile;

  if (!isProjectSet) {
    var rootDir = utils.getRootDir();
    tsConfigFile = utils.getConfigFile('tsconfig.build.json', 'tsconfig.json');
    if (tsConfigFile === path.join(rootDir, 'config/tsconfig.build.json')) {
      // No local tsconfig.build.json or tsconfig.json found
      var baseConfigFile = path.join(rootDir, 'config/tsconfig.common.json');
      baseConfigFile = path.relative(packageDir, baseConfigFile);
      // Create tsconfig.json under the package as it's required to parse
      // include/exclude correctly
      tsConfigFile = path.join(packageDir, 'tsconfig.json');
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
  }

  const args = [];

  if (tsConfigFile) {
    args.push('-p', tsConfigFile);
  }

  if (outDir) {
    args.push('--outDir', outDir);
  }

  if (target) {
    args.push('--target', target);
  }

  args.push(...compilerOpts);

  return utils.runCLI('typescript/lib/tsc', args, dryRun);
}

module.exports = run;
if (require.main === module) run(process.argv);
