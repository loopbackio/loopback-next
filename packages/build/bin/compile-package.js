#!/usr/bin/env node
// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/build
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/*
========

Usage:
  node ./bin/compile-package <target>

Where <target> is one of es2015, es2017 or es2018.

========
*/

'use strict';

function run(argv, options) {
  const utils = require('./utils');
  const path = require('path');
  const fs = require('fs');
  const glob = require('glob');
  const fse = require('fs-extra');

  const packageDir = utils.getPackageDir();

  const compilerOpts = argv.slice(2);

  const isTargetSet = utils.isOptionSet(compilerOpts, '--target');
  const isOutDirSet = utils.isOptionSet(compilerOpts, '--outDir');
  const isProjectSet = utils.isOptionSet(compilerOpts, '-p', '--project');
  const isIgnoreResourcesSet = utils.isOptionSet(
    compilerOpts,
    '--ignore-resources',
  );

  var target;

  // --ignore-resources is not a TS Compiler option so we remove it from the
  // list of compiler options to avoid compiler errors.
  if (isIgnoreResourcesSet) {
    compilerOpts.splice(compilerOpts.indexOf('--ignore-resources'), 1);
  }

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
      if (baseConfigFile.indexOf('..' + path.sep) !== 0) {
        // tsconfig only supports relative or rooted path
        baseConfigFile = '.' + path.sep + baseConfigFile;
      }
      baseConfigFile = baseConfigFile.replace(/\\/g, '/');
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
              'examples/*/node_modules/**',
              '**/*.d.ts',
            ],
          },
          null,
          '  ',
        ),
      );
    }
  }

  const args = [];

  const cwd = process.env.LERNA_ROOT_PATH || process.cwd();
  if (tsConfigFile) {
    // Make the config file relative the current directory
    args.push('-p', path.relative(cwd, tsConfigFile));
  }

  if (outDir) {
    args.push('--outDir', outDir);

    // Since outDir is set, ts files are compiled into that directory.
    // If ignore-resources flag is not passed, copy resources (non-ts files)
    // to the same outDir as well.
    if (rootDir && tsConfigFile && !isIgnoreResourcesSet) {
      const tsConfig = require(tsConfigFile);
      const dirs = tsConfig.include
        ? tsConfig.include.join('|')
        : ['src', 'test'].join('|');

      const pattern = `@(${dirs})/**/!(*.ts)`;
      const files = glob.sync(pattern, {root: packageDir, nodir: true});
      for (const file of files) {
        fse.copySync(path.join(packageDir, file), path.join(outDir, file));
      }
    }
  }

  if (target) {
    args.push('--target', target);
  }

  args.push(...compilerOpts);

  if (options === true) {
    options = {dryRun: true};
  } else {
    options = options || {};
  }
  return utils.runCLI('typescript/lib/tsc', args, {cwd, ...options});
}

module.exports = run;
if (require.main === module) run(process.argv);
