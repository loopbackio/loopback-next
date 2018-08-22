#!/usr/bin/env node
// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/build
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/*
========

Usage:
  node ./bin/copy-resources

========
*/

'use strict';

function run(argv, options) {
  const utils = require('./utils');
  const path = require('path');
  const util = require('util');
  const glob = require('glob');
  const fse = require('fs-extra');
  const debug = require('debug')('loopback:build');

  if (options === true) {
    options = {dryRun: true};
  } else {
    options = options || {};
  }

  const packageDir = utils.getPackageDir();

  const copyOpts = argv.slice(2);

  // Honor --dry from tsc
  if (utils.isOptionSet(copyOpts, '--dry')) {
    options.dryRun = true;
  }

  var outDir = utils.getOptionValue(copyOpts, 'outDir');
  var rootDir = utils.getOptionValue(copyOpts, 'rootDir');

  if (!outDir || !rootDir) {
    const tsConfigFile = utils.getConfigFile(
      'tsconfig.build.json',
      'tsconfig.json',
    );
    if (tsConfigFile) {
      debug('Loading tsconfig from %s', tsConfigFile);
      const tsConfig = require(tsConfigFile);
      const compilerOptions = tsConfig.compilerOptions || {};
      debug('tsconfig compilerOptions %j', compilerOptions);
      outDir = outDir || compilerOptions.outDir;
      rootDir = rootDir || compilerOptions.rootDir;
    }
  }
  debug('rootDir: %s, outDir: %s', rootDir, outDir);

  const pattern = `${rootDir}/**/!(*.ts)`;
  const files = glob.sync(pattern, {
    root: packageDir,
    nodir: true,
  });

  for (const file of files) {
    // Trim leading `src/`
    const target = file.substr(`${rootDir}/`.length);
    const sourceFile = path.resolve(packageDir, file);
    const targetFile = path.resolve(packageDir, outDir, target);
    debug('Copying %s to %s', sourceFile, targetFile);
    if (!options.dryRun) fse.copySync(sourceFile, targetFile);
  }
  if (options.dryRun) {
    return util.format('%s %s %s', argv[0], argv[1], copyOpts.join(' '));
  }
}

module.exports = run;
if (require.main === module) run(process.argv);
