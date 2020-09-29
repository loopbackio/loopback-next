#!/usr/bin/env node
// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: loopback-next
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * This is an internal script to update peer dependencies based on released
 * LoopBack package versions.
 */
'use strict';

const {
  getPackages,
  writeJsonSync,
  isDryRun,
  stringifyJson,
  runMain,
} = require('./script-util');

/**
 * Update local package dependencies for `@loopback/*` modules
 * @param {*} options - Options
 */
async function updatePackageDeps(options) {
  // List all packages within the monorepo
  const packages = await getPackages();

  // Build a map of module name/version pairs
  const lbModuleVersions = {};
  for (const p of packages) {
    lbModuleVersions[p.name] = p.version;
  }

  for (const p of packages) {
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
      writeJsonSync(pkgJsonFile, pkgJson);
      console.log('%s has been updated.', pkgJsonFile);
    }
  }

  function updateDeps(pkgJson) {
    let updated = false;
    const types = ['dependencies', 'devDependencies', 'peerDependencies'];
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
