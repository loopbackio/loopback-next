#!/usr/bin/env node
// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: loopback-next
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * This is an internal script to synchronize versions of dev-dependencies
 * from monorepo's package.json to individual example packages.
 */
'use strict';

const path = require('path');
const fs = require('fs-extra');

const {
  loadLernaRepo,
  writeJsonSync,
  isDryRun,
  printJson,
  runMain,
} = require('../packages/monorepo');

async function syncDevDeps(options) {
  const {project, packages} = await loadLernaRepo();

  const rootPath = project.rootPath;

  // Load dependencies from `packages/eslint-config/package.json`
  const eslintDeps = require(path.join(
    rootPath,
    'packages/eslint-config/package.json',
  )).dependencies;

  const buildDeps = require(path.join(rootPath, 'packages/build/package.json'))
    .dependencies;

  const deps = [
    '@typescript-eslint/eslint-plugin',
    '@typescript-eslint/parser',
    'eslint-config-prettier',
    'eslint-plugin-eslint-plugin',
    'eslint-plugin-mocha',
  ];
  const masterDeps = {};

  masterDeps['eslint'] = buildDeps['eslint'];
  masterDeps['prettier'] = buildDeps['prettier'];
  masterDeps['typescript'] = buildDeps['typescript'];

  for (const d of deps) {
    if (eslintDeps[d] == null) {
      console.error(
        'Dependency %s is missing in packages/build/package.json',
        d,
      );
    }
    masterDeps[d] = eslintDeps[d];
  }

  // Update typescript & eslint dependencies in individual packages
  for (const pkg of packages) {
    if (pkg.name === '@loopback/eslint-config') continue;
    const pkgFile = pkg.manifestLocation;
    updatePackageJson(
      pkgFile,
      {
        eslint: masterDeps.eslint,
        typescript: masterDeps.typescript,
      },
      options,
    );
  }

  // Update dependencies in monorepo root
  const rootPackage = path.join(rootPath, 'package.json');
  updatePackageJson(rootPackage, masterDeps, options);
}

/**
 * Update package.json with given master dependencies
 * @param pkgFile - Path of `package.json`
 * @param masterDeps - Master dependencies
 * @param options - Options
 */
function updatePackageJson(pkgFile, masterDeps, options) {
  const data = readPackageJson(pkgFile);
  const isExample = data.name.startsWith('@loopback/example-');
  const isRoot = data.name === 'loopback-next';

  let modified = false;
  for (const dep in masterDeps) {
    if (
      data.devDependencies &&
      // Force update for examples and loopback-next
      (isExample || isRoot || dep in data.devDependencies)
    ) {
      modified = modified || data.devDependencies[dep] !== masterDeps[dep];
      data.devDependencies[dep] = masterDeps[dep];
    }
    if (data.dependencies && dep in data.dependencies) {
      modified = modified || data.dependencies[dep] !== masterDeps[dep];
      data.dependencies[dep] = masterDeps[dep];
    }
  }
  if (!modified) return false;
  writePackageJson(pkgFile, data, options);
  return true;
}

function readPackageJson(filePath) {
  return fs.readJsonSync(filePath, 'utf-8');
}

function writePackageJson(filePath, data, options) {
  data.dependencies = sortObjectByKeys(data.dependencies);
  data.devDependencies = sortObjectByKeys(data.devDependencies);
  if (isDryRun(options)) {
    console.log('%s', filePath);
    printJson(data);
  } else {
    writeJsonSync(filePath, data);
    console.log('%s has been updated.', filePath);
  }
}

/**
 * Sort an object by keys
 * @param data - An object to be sorted
 */
function sortObjectByKeys(data) {
  if (data == null) return undefined;
  if (typeof data !== 'object') return data;
  const keys = Object.keys(data).sort();
  const result = {};
  for (const k of keys) {
    result[k] = data[k];
  }
  return result;
}

module.exports = syncDevDeps;

runMain(module, syncDevDeps);
