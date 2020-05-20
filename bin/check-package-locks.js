#!/usr/bin/env node
// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: loopback-next
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * This is an internal script to verify that local monorepo dependencies
 * are excluded from package-lock files.
 */
'use strict';

const path = require('path');
const fs = require('fs-extra');

const Project = require('@lerna/project');

async function checkPackageLocks() {
  const project = new Project(process.cwd());
  const packages = await project.getPackages();
  const packageNames = packages.map(p => p.name);
  const rootPath = project.rootPath;
  const lockFiles = packages.map(p =>
    path.relative(rootPath, path.join(p.location, 'package-lock.json')),
  );

  const checkResults = await Promise.all(
    lockFiles.map(async lockFile => {
      return {lockFile, violations: await checkLockFile(lockFile)};
    }),
  );
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

  async function checkLockFile(lockFile) {
    const file = path.resolve(project.rootPath, lockFile);
    const found = await fs.exists(file);
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

if (require.main === module) {
  checkPackageLocks().then(
    ok => process.exit(ok ? 0 : 1),
    err => {
      console.error(err);
      process.exit(2);
    },
  );
}
