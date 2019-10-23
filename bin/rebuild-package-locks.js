#!/usr/bin/env node
// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: loopback-next
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * This is an internal script to rebuild package-lock files for all packages
 * within a lerna monorepo.
 */
'use strict';

const path = require('path');
const fs = require('fs-extra');
const Project = require('@lerna/project');
const build = require('../packages/build');

/**
 * Remove all package-lock.json and node_modules for all packages
 * @param {Project} project The lerna project
 */
async function removePackageLocks(project) {
  const packages = await project.getPackages();
  const rootPath = project.rootPath;
  const pkgRoots = [];
  for (const pkg of packages) {
    pkgRoots.push(pkg.location);
  }
  pkgRoots.push(rootPath);

  console.log('Cleaning package-lock.json and node_modules...');
  await Promise.all(
    pkgRoots.map(async root => {
      await fs.remove(path.join(root, 'package-lock.json'));
      await fs.remove(path.join(root, 'node_modules'));
    }),
  );
}

/**
 * Rebuild package-lock.json files:
 *
 * 1. Remove node_modules and package-lock.json for all packages, including the
 * root one
 * 2. Run `npm install` to regenerate package-lock.json files
 */
async function rebuildPackageLocks() {
  const project = new Project(process.cwd());

  await removePackageLocks(project);
  console.log('Running npm install...');
  build.runShell('npm', ['install'], {cwd: project.rootPth});
}

if (require.main === module) {
  rebuildPackageLocks().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
