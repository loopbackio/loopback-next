#!/usr/bin/env node
// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/monorepo
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * This is a script to rebuild package-lock files for all packages within a
 * lerna monorepo.
 */
'use strict';

const path = require('path');
const fs = require('fs-extra');
const Project = require('@lerna/project');
const filterPackages = require('@lerna/filter-packages');
const {runMain, runShell} = require('./script-util');
const debug = require('debug')('loopback:monorepo');

/**
 * Remove all package-lock.json and node_modules for all packages
 * @param {Project} project The lerna project
 * @param {string[]} scopes A list of package names to be included
 */
async function removePackageLocks(project, ...scopes) {
  const packages = await project.getPackages();
  const rootPath = project.rootPath;
  const pkgRoots = [];
  let matchedPackages = packages;
  if (scopes.length) {
    matchedPackages = filterPackages(packages, scopes, [], true, true);
    if (matchedPackages.length === 0) {
      console.error('No matching packages found for %s', scopes);
      return pkgRoots;
    }
  }
  for (const pkg of matchedPackages) {
    debug('Package %s@%s', pkg.name, pkg.version);
    pkgRoots.push(pkg.location);
  }
  // Only clean the monorepo root package if no scopes is provided
  if (scopes.length === 0) pkgRoots.push(rootPath);

  console.log('Cleaning package-lock.json and node_modules...');
  await Promise.all(
    pkgRoots.map(async root => {
      const loc = path.relative(rootPath, root);
      debug('Cleaning %s', loc);
      console.log('  - %s', loc);
      await fs.remove(path.join(root, 'package-lock.json'));
      await fs.remove(path.join(root, 'node_modules'));
    }),
  );
  return pkgRoots;
}

/**
 * Rebuild package-lock.json files:
 *
 * 1. Remove node_modules and package-lock.json for matching packages,
 * including the root one if no scopes is specified
 * 2. Run `npx lerna bootstrap or npm install` to regenerate package-lock.json
 * files
 *
 * @param {string[]} scopes - Optional lerna scopes to filter packages
 */
async function rebuildPackageLocks(...scopes) {
  const project = new Project(process.cwd());

  if (scopes.length) {
    const removed = await removePackageLocks(project, ...scopes);
    if (removed.length === 0) return;
    const args = [];
    scopes.forEach(s => args.push('--scope', s));

    console.log(`Running lerna bootstrap ${args.join(' ')}...`);
    runShell('npx', ['lerna', 'bootstrap', ...args], {
      cwd: project.rootPth,
    });
  } else {
    await removePackageLocks(project, ...scopes);
    console.log('Running npm install...');
    runShell('npm', ['install'], {cwd: project.rootPth});
  }
}

runMain(module, rebuildPackageLocks, ...process.argv.slice(2));
