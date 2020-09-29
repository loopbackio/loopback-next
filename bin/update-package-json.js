#!/usr/bin/env node
// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: loopback-next
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * This is an internal script that will verify that all packages in our monorepo
 * are registered in all required places and have the expected metadata in their
 * package.json.
 */
'use strict';

const path = require('path');
const fs = require('fs-extra');

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
 * @param {Package[]} packages A list of @lerna/project packages
 * @param {Object} rootPkg A root package.json
 */
async function updatePackageJsonFiles(options) {
  const {project, packages} = await loadLernaRepo();
  const rootPath = project.rootPath;
  const rootPkg = fs.readJsonSync(path.join(rootPath, 'package.json'));

  for (const p of packages) {
    const pkgFile = p.manifestLocation;
    const pkg = cloneJson(p.toJSON());

    const isLernaRepo = fs.existsSync(path.join(p.location, 'lerna.json'));

    if (isTypeScriptPackage(p) && !isLernaRepo) {
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

    pkg.engines = rootPkg.engines;
    if (!isJsonEqual(pkg, p.toJSON())) {
      if (isDryRun(options)) {
        printJson(pkg);
      } else {
        console.log('%s has been updated.', path.relative(p.rootPath, pkgFile));
        writeJsonSync(pkgFile, pkg);
      }
    }
  }
}

function getCopyrightOwner(pkg) {
  return pkg['copyright.owner'] || (pkg.copyright && pkg.copyright.owner);
}

module.exports = updatePackageJsonFiles;

runMain(module, updatePackageJsonFiles);
