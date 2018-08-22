#!/usr/bin/env node
// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/build
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/*
========

Usage:
  node ./bin/compile-package <target>

Where <target> is one of es2015, es2017 or es2017.

========
*/

'use strict';

function run(argv, options) {
  const utils = require('./utils');
  const path = require('path');
  const fs = require('fs');
  const copyResources = require('./copy-resources');

  if (options === true) {
    options = {dryRun: true};
  } else {
    options = options || {};
  }

  const packageDir = utils.getPackageDir();

  const compilerOpts = argv.slice(2);

  const isTargetSet = utils.isOptionSet(compilerOpts, '--target');
  const isOutDirSet = utils.isOptionSet(compilerOpts, '--outDir');
  const isProjectSet = utils.isOptionSet(compilerOpts, '-p', '--project');
  const isCopyResourcesSet = utils.isOptionSet(
    compilerOpts,
    '--copy-resources',
  );

  let target;
  // Honor --dry from tsc
  if (utils.isOptionSet(compilerOpts, '--dry')) {
    options.dryRun = true;
  }

  // --copy-resources is not a TS Compiler option so we remove it from the
  // list of compiler options to avoid compiler errors.
  if (isCopyResourcesSet) {
    compilerOpts.splice(compilerOpts.indexOf('--copy-resources'), 1);
  }

  if (!isTargetSet) {
    // Find the last non-option argument as the `target`
    // For example `-p tsconfig.json es2017` or `es2017 -p tsconfig.json`
    for (let i = compilerOpts.length - 1; i >= 0; i--) {
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

  let outDir;

  if (isOutDirSet) {
    const outDirIx = compilerOpts.indexOf('--outDir');
    outDir = path.resolve(process.cwd(), compilerOpts[outDirIx + 1]);
    compilerOpts.splice(outDirIx, 2);
  } else {
    outDir = path.join(packageDir, utils.getDistribution(target));
  }

  let tsConfigFile;

  let rootDir;
  if (!isProjectSet) {
    rootDir = utils.getRootDir();
    tsConfigFile = utils.getConfigFile('tsconfig.build.json', 'tsconfig.json');
    if (tsConfigFile === path.join(rootDir, 'config/tsconfig.build.json')) {
      // No local tsconfig.build.json or tsconfig.json found
      let baseConfigFile = path.join(rootDir, 'config/tsconfig.common.json');
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
            compilerOptions: {
              target: 'es2017',
              outDir: 'dist',
            },
            exclude: ['**/*.d.ts'],
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
    args.push('--outDir', path.relative(cwd, outDir));

    // Since outDir is set, ts files are compiled into that directory.
    // If copy-resources flag is passed, copy resources (non-ts files)
    // to the same outDir as well.
    if (rootDir && tsConfigFile && isCopyResourcesSet) {
      const tsConfig = require(tsConfigFile);
      const tsRootDir =
        (tsConfig.compilerOptions && tsConfig.compilerOptions.rootDir) || 'src';
      copyResources(
        [argv[0], argv[1], '--rootDir', tsRootDir, '--outDir', outDir],
        options,
      );
    }
  }

  if (target) {
    args.push('--target', target);
  }

  args.push(...compilerOpts);

  // Move --build or -b as the 1st argument to avoid:
  // error TS6369: Option '--build' must be the first command line argument.
  const buildOptions = utils.removeOptions(args, '-b', '--build');
  if (buildOptions.length) {
    let projectOptions = utils.removeOptions(args, '-p', '--project');
    projectOptions = projectOptions.filter(p => !p.startsWith('-'));
    // Remove conflict options with '--build'
    utils.removeOptions(args, '--outDir', '--target');
    if (buildOptions.length === 1) {
      args.unshift(...buildOptions, ...projectOptions);
    } else {
      args.unshift(...buildOptions);
    }
  }

  return utils.runCLI('typescript/lib/tsc', args, {cwd, ...options});
}

module.exports = run;
if (require.main === module) run(process.argv);
