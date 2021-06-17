#!/usr/bin/env node
// Copyright The LoopBack Authors 2020,2021. All Rights Reserved.
// Node module: @loopback/monorepo
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * This is a script to update dependencies, devDependencies, and
 * peerDependencies in `package.json` based on local package versions for a
 * lerna monorepo.
 */
'use strict';

const {
  getPackages,
  writeJsonSync,
  isDryRun,
  stringifyJson,
  runMain,
} = require('./script-util');

const debug = require('debug')('loopback:monorepo');

/**
 * Update local package dependencies for `@loopback/*` modules
 * @param {object} options - Options object
 * - dryRun: a flag to control if a dry run is intended
 * - dependencyTypes: an array of dependency types in `package.json`
 */
async function updatePackageDeps(options) {
  // List all packages within the monorepo
  const packages = await getPackages();

  // Build a map of module name/version pairs
  const lbModuleVersions = {};
  for (const p of packages) {
    lbModuleVersions[p.name] = p.version;
  }

  let changed = false;
  for (const p of packages) {
    debug('Checking dependencies for %s@%s', p.name, p.version);
    // Load package.json
    const pkgJsonFile = p.manifestLocation;
    const pkgJson = p.toJSON();
    const updated = updateDeps(pkgJson);
    if (!updated) continue;

    if (isDryRun(options)) {
      // Dry run
      // Convert to JSON
      const json = stringifyJson(pkgJson);
      console.log('%s\n%s\n', pkgJsonFile, json);
    } else {
      changed = true;
      writeJsonSync(pkgJsonFile, pkgJson);
      console.log('%s has been updated.', pkgJsonFile);
    }
  }
  if (changed) {
    console.log('Package dependencies have been updated.');
  } else {
    console.log('Package dependencies are up to date.');
  }

  function updateDeps(pkgJson) {
    let updated = false;
    const types = (options && options.dependencyTypes) || [
      'dependencies',
      'devDependencies',
      'peerDependencies',
    ];
    for (const type of types) {
      const deps = pkgJson[type];
      if (deps) {
        // Check all entries in peerDependencies
        for (const d in deps) {
          const pkgVersion = lbModuleVersions[d];
          if (pkgVersion) {
            // Update the version range to be `^<pkgVersion>`
            // We choose to be conservative as only this version has been verified
            // by CI
            if (deps[d] !== `^${pkgVersion}`) {
              deps[d] = `^${pkgVersion}`;
              updated = true;
            }
          }
        }
      }
    }
    return updated;
  }
}

module.exports = updatePackageDeps;

runMain(module, updatePackageDeps);
