#!/usr/bin/env node
// Copyright IBM Corp. and LoopBack contributors 2017,2020. All Rights Reserved.
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
const {globSync} = require('glob');
const fse = require('fs-extra');
const {buildOpts: buildOptions} = require('typescript');

function run(argv, options) {
  if (options === true) {
    options = {dryRun: true};
  } else {
    options = options || {};
  }

  const packageDir = utils.getPackageDir();

  const runnerName = argv[1];

  const compilerOpts = argv.slice(2);
  const runnerIsLbttsc = runnerName.includes('lb-ttsc');
  const isUseTtscSet = utils.isOptionSet(compilerOpts, '--use-ttypescript');
  const useTtsc = runnerIsLbttsc || isUseTtscSet;
  const isTargetSet = utils.isOptionSet(compilerOpts, '--target');
  const isOutDirSet = utils.isOptionSet(compilerOpts, '--outDir');
  const isProjectSet = utils.isOptionSet(compilerOpts, '-p', '--project');
  const isCopyResourcesSet = utils.isOptionSet(
    compilerOpts,
    '--copy-resources',
  );

  let TSC_CLI = 'typescript/lib/tsc';
  if (useTtsc) {
    try {
      require.resolve('ttypescript');
      TSC_CLI = 'ttypescript/lib/tsc';
    } catch (e) {
      if (isUseTtscSet) {
        console.error(
          'Error using the --use-ttypescript option - ttypescript is not installed',
        );
      } else {
        console.error('Error using lb-ttsc - ttypescript is not installed');
      }
      process.exit(1);
    }
  }
  debug(`Using ${TSC_CLI} to compile package`);

  // --copy-resources and --use-ttypescript are not a TS Compiler options,
  // so we remove them from the list of compiler options to avoid compiler
  // errors.
  if (isCopyResourcesSet) {
    compilerOpts.splice(compilerOpts.indexOf('--copy-resources'), 1);
  }

  if (isUseTtscSet) {
    compilerOpts.splice(compilerOpts.indexOf('--use-ttypescript'), 1);
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

  let cwd = process.env.LERNA_ROOT_PATH || process.cwd();
  if (tsConfigFile && fs.existsSync(tsConfigFile)) {
    const tsconfig = require(tsConfigFile);
    if (tsconfig.references) {
      args.unshift('-b');
      // Reset the cwd for a composite project
      cwd = process.cwd();
    } else {
      // Make the config file relative the current directory
      args.push('-p', path.relative(cwd, tsConfigFile));
    }
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

  const validArgs = validArgsForBuild(args);

  return utils.runCLI(TSC_CLI, validArgs, {cwd, ...options});
}

/**
 * `tsc -b` only accepts valid arguments. `npm run build -- --<other-arg>` may
 * pass in extra arguments. We need to remove such arguments.
 * @param {string[]} args An array of arguments
 */
function validArgsForBuild(args) {
  const validBooleanOptions = [];
  const validValueOptions = [];

  // See https://github.com/microsoft/TypeScript/blob/v3.8.3/src/compiler/commandLineParser.ts#L122
  buildOptions.forEach(opt => {
    /**
     * name: "help",
     * shortName: "h",
     * type: "boolean",
     */
    const options =
      opt.type === 'boolean' ? validBooleanOptions : validValueOptions;
    options.push(`--${opt.name}`);
    if (opt.shortName) {
      validBooleanOptions.push(`-${opt.shortName}`);
    }
  });
  let validArgs = args;
  if (args.includes('-b') || args.includes('--build')) {
    validArgs = filterArgs(args, (arg, next) => {
      if (validBooleanOptions.includes(arg)) {
        return next === 'false' || next === 'true' ? 2 : 1;
      }
      if (validValueOptions.includes(arg)) return 2;
      return 0;
    });
    // `-b` has to be the first argument
    validArgs.unshift('-b');
  }
  debug('Valid args for tsc -b', validArgs);
  return validArgs;
}

/**
 * Filter arguments by name from the args
 * @param {string[]} args - Array of args
 * @param {function} filter - (arg: string) => 0, 1, 2
 */
function filterArgs(args, filter) {
  const validArgs = [];
  let i = 0;
  while (i < args.length) {
    const length = filter(args[i], args[i + 1]);
    if (length === 0) {
      i++;
    } else if (length === 1) {
      validArgs.push(args[i]);
      i++;
    } else if (length === 2) {
      validArgs.push(args[i], args[i + 1]);
      i += 2;
    }
  }
  return validArgs;
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
  const files = globSync(pattern, {root: packageDir, nodir: true});
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
