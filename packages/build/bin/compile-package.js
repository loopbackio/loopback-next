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

const debug = require('debug')('loopback:build');
const utils = require('./utils');
const path = require('path');
const fs = require('fs');
const glob = require('glob');
const fse = require('fs-extra');

function run(argv, options) {
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

  // --copy-resources is not a TS Compiler option so we remove it from the
  // list of compiler options to avoid compiler errors.
  if (isCopyResourcesSet) {
    compilerOpts.splice(compilerOpts.indexOf('--copy-resources'), 1);
  }

  let target;
  if (isTargetSet) {
    const targetIx = compilerOpts.indexOf('--target');
    target = compilerOpts[targetIx + 1];
    compilerOpts.splice(targetIx, 2);
  }

  let outDir;
  if (isOutDirSet) {
    const outDirIx = compilerOpts.indexOf('--outDir');
    outDir = path.resolve(process.cwd(), compilerOpts[outDirIx + 1]);
    compilerOpts.splice(outDirIx, 2);
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
              outDir: 'dist',
              rootDir: 'src',
            },
            include: ['src'],
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
  }

  if (target) {
    args.push('--target', target);
  }

  if (isCopyResourcesSet) {
    // Since outDir is set, ts files are compiled into that directory.
    // If copy-resources flag is passed, copy resources (non-ts files)
    // to the same outDir as well.
    copyResources(rootDir, packageDir, tsConfigFile, outDir, options);
  }

  if (target) {
    args.push('--target', target);
  }

  args.push(...compilerOpts);

  return utils.runCLI('typescript/lib/tsc', args, {cwd, ...options});
}

module.exports = run;
if (require.main === module) run(process.argv);

function copyResources(rootDir, packageDir, tsConfigFile, outDir, options) {
  if (!rootDir) {
    console.warn('Ignoring --copy-resources option - rootDir was not set.');
    return;
  }
  if (!tsConfigFile) {
    console.warn(
      'Ignoring --copy-resources option - no tsconfig file was found.',
    );
    return;
  }

  const tsConfig = require(tsConfigFile);

  if (!outDir) {
    outDir = tsConfig.compilerOptions && tsConfig.compilerOptions.outDir;
    if (!outDir) {
      console.warn(
        'Ignoring --copy-resources option - outDir was not configured.',
      );
      return;
    }
  }

  const dirs = tsConfig.include
    ? tsConfig.include.join('|')
    : ['src', 'test'].join('|');

  const compilerRootDir =
    (tsConfig.compilerOptions && tsConfig.compilerOptions.rootDir) || '';

  const pattern = `@(${dirs})/**/!(*.ts)`;
  const files = glob.sync(pattern, {root: packageDir, nodir: true});
  for (const file of files) {
    /**
     * Trim path that matches tsConfig.compilerOptions.rootDir
     */
    let targetFile = file;
    if (compilerRootDir && file.startsWith(compilerRootDir + '/')) {
      targetFile = file.substring(compilerRootDir.length + 1);
    }

    const copyFrom = path.join(packageDir, file);
    const copyTo = path.join(outDir, targetFile);
    debug('  copy %j to %j', copyFrom, copyTo);
    if (!options.dryRun) {
      fse.copySync(copyFrom, copyTo);
    }
  }
}
