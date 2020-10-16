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

const syncDevDeps = require('./sync-dev-deps');
const updateMonorepo = require('./update-monorepo-file');

const {
  runMain,
  updatePackageDeps,
  updatePackageJson,
  updateTsProjectRefs,
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
}

runMain(module, fixMonorepo);
