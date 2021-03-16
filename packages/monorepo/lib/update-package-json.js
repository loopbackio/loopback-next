#!/usr/bin/env node
// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/monorepo
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * This is a script that verifies that all packages in a lerna monorepo have the
 * expected metadata in their `package.json`.
 */
'use strict';

const path = require('path');
const fs = require('fs-extra');
const debug = require('debug')('loopback:monorepo');
const {
  isDryRun,
  isTypeScriptPackage,
  loadLernaRepo,
  cloneJson,
  isJsonEqual,
  writeJsonSync,
  printJson,
  runMain,
} = require('./script-util');

/**
 * Check all required fields of package.json for each package on the matching
 * with root package.json
 * @param {object} options - Options object
 * - dryRun: a flag to control if a dry run is intended
 */
async function updatePackageJsonFiles(options) {
  const {project, packages} = await loadLernaRepo();
  const rootPath = project.rootPath;
  const rootPkg = fs.readJsonSync(path.join(rootPath, 'package.json'));

  let changed = false;
  for (const p of packages) {
    debug('Checking package.json for %s@%s', p.name, p.version);
    const pkgFile = p.manifestLocation;
    const pkg = cloneJson(p.toJSON());

    const isMonorepoPackage =
      Array.isArray(pkg.name) ||
      fs.existsSync(path.join(p.location, 'lerna.json'));

    if (isTypeScriptPackage(p) && !isMonorepoPackage) {
      pkg.main = 'dist/index.js';
      pkg.types = 'dist/index.d.ts';
    }

    if (!pkg.private) {
      pkg.publishConfig = {
        access: 'public',
      };
    }

    pkg.author = rootPkg.author;
    pkg['copyright.owner'] = getCopyrightOwner(rootPkg);
    pkg.license = rootPkg.license;

    pkg.repository = {
      type: rootPkg.repository.type,
      url: rootPkg.repository.url,
      directory: path.relative(p.rootPath, p.location).replace(/\\/g, '/'),
    };

    if (isMonorepoPackage) {
      pkg.engines = rootPkg.engines;
    } else {
      pkg.engines.node = rootPkg.engines.node;
    }

    if (!isJsonEqual(pkg, p.toJSON())) {
      if (isDryRun(options)) {
        printJson(pkg);
      } else {
        changed = true;
        console.log('%s has been updated.', path.relative(p.rootPath, pkgFile));
        writeJsonSync(pkgFile, pkg);
      }
    }
  }
  if (changed) {
    console.log('All package.json files have been updated.');
  } else {
    console.log('All package.json files are up to date.');
  }
}

function getCopyrightOwner(pkg) {
  return pkg['copyright.owner'] || (pkg.copyright && pkg.copyright.owner);
}

module.exports = updatePackageJsonFiles;

runMain(module, updatePackageJsonFiles);
