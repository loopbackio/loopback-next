#!/usr/bin/env node
// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/monorepo
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * This is an internal script to verify that local monorepo dependencies
 * are excluded from package-lock files.
 */
'use strict';

const path = require('path');
const fs = require('fs-extra');
const {loadLernaRepo, runMain} = require('./script-util');
const debug = require('debug')('loopback:monorepo');

async function checkPackageLocks() {
  const {project, packages} = await loadLernaRepo();
  const packageNames = packages.map(p => p.name);
  const rootPath = project.rootPath;
  const lockFiles = packages.map(p =>
    path.relative(rootPath, path.join(p.location, 'package-lock.json')),
  );

  const checkResults = lockFiles.map(lockFile => {
    debug('Checking %s', lockFile);
    return {lockFile, violations: checkLockFile(lockFile)};
  });
  const badPackages = checkResults.filter(r => r.violations.length > 0);
  if (!badPackages.length) return true;

  console.error('\nInvalid package-lock entries found!\n');
  for (const {lockFile, violations} of badPackages) {
    console.error('  %s', lockFile);
    for (const v of violations) {
      console.error('    -> %s', v);
    }
  }

  console.error('\nRun the following command to fix the problems:');
  console.error('\n  $ npm run update-package-locks\n');
  return false;

  function checkLockFile(lockFile) {
    const file = path.resolve(project.rootPath, lockFile);
    const found = fs.existsSync(file);
    if (!found) return [];
    let data = {};
    try {
      data = require(file);
    } catch (err) {
      return [err.message];
    }
    // Find dependency module names
    const deps = Object.keys(data.dependencies || {});
    // Local packages should not be included
    return Object.keys(deps).filter(dep => packageNames.includes(dep));
  }
}

module.exports = checkPackageLocks;

runMain(module, checkPackageLocks);
