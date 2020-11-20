#!/usr/bin/env node
// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: loopback-next
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * This is an internal script to update package metadata for the monorepo for
 * consistency.
 */
'use strict';

const path = require('path');

const syncDevDeps = require('./sync-dev-deps');
const updateMonorepo = require('./update-monorepo-file');

const {
  isJsonEqual,
  loadLernaRepo,
  runMain,
  updatePackageDeps,
  updatePackageJson,
  updateTsProjectRefs,
  writeJsonSync,
} = require('../packages/monorepo');

async function fixMonorepo() {
  // Ensure all packages use the local version of `@loopback/*`
  await updatePackageDeps();
  // Ensure `devDependencies` is in sync
  await syncDevDeps();
  // Ensure package.json has consistent metadata
  await updatePackageJson();
  // Ensure `MONOREPO.md` is up to date
  await updateMonorepo();
  // Ensure TypeScript project references are up to date
  await updateTsProjectRefs();
  // Ensure consistent order of keys in package.json
  await updateOrderOfPackageJsonFields();
}

runMain(module, fixMonorepo);

async function updateOrderOfPackageJsonFields() {
  const {packages} = await loadLernaRepo();
  for (const pkg of packages.filter(p => !p.private)) {
    const manifest = pkg.toJSON();

    // Keys to update in the desired order,
    // filtered to those present in `package.json` only.
    const depKeys = [
      'peerDependencies',
      'dependencies',
      'devDependencies',
    ].filter(k => k in manifest);

    // Get all top-level keys like "name", "version", "dependencies"
    let keys = Object.keys(manifest);
    // Remove "*dependencies"
    keys = keys.filter(k => !depKeys.includes(k));

    // Find the position of "publishConfig" (if present) or "license"
    let ix = keys.indexOf('publishConfig');
    if (ix === -1) {
      ix = keys.indexOf('license');
      if (ix === -1) {
        const relPath = path.relative(pkg.rootPath, pkg.manifestLocation);
        throw new Error(
          `Fatal error: ${relPath} is missing required "license" field.`,
        );
      }
    }

    // Insert back "*dependencies" after "publishConfig" or "license"
    keys.splice(
      ix + 1, // index at which to start changing the array.
      0, // number of elements to remove
      ...depKeys, // elements to insert
    );

    // Build a new manifest with the keys in the correct order
    const updated = {};
    for (const k of keys) {
      updated[k] = manifest[k];
    }

    if (!isJsonEqual(updated, manifest)) {
      writeJsonSync(pkg.manifestLocation, updated);
    }
  }
}
