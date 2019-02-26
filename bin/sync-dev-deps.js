#!/usr/bin/env node
// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: loopback-next
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * This is an internal script to synchronize versions of dev-dependencies
 * from monorepo's package.json to individual example packages.
 */
'use strict';

const path = require('path');
const fs = require('fs');

const Project = require('@lerna/project');

async function syncDevDeps() {
  const project = new Project(process.cwd());
  const packages = await project.getPackages();

  const rootPath = project.rootPath;

  // Load dependencies from `packages/build/package.json`
  const buildDeps = require(path.join(rootPath, 'packages/build/package.json'))
    .dependencies;

  const deps = [
    'typescript',
    'eslint',
    '@typescript-eslint/eslint-plugin',
    '@typescript-eslint/parser',
    'eslint-plugin-eslint-plugin',
  ];
  const masterDeps = {};
  for (const d of deps) {
    if (buildDeps[d] == null) {
      console.error(
        'Dependency %s is missing in packages/build/package.json',
        d,
      );
    }
    masterDeps[d] = buildDeps[d];
  }

  // Update typescript & eslint dependencies in individual packages
  for (const pkg of packages) {
    if (pkg.name === '@loopback/build') continue;
    const pkgFile = pkg.manifestLocation;
    updatePackageJson(pkgFile, masterDeps);
  }

  // Update dependencies in monorepo root
  const rootPackage = path.join(rootPath, 'package.json');
  updatePackageJson(rootPackage, masterDeps);
}

/**
 * Update package.json with given master dependencies
 * @param pkgFile - Path of `package.json`
 * @param masterDeps - Master dependencies
 */
function updatePackageJson(pkgFile, masterDeps) {
  const data = readJsonFile(pkgFile);
  const isExample = data.name.startsWith('@loopback/example-');
  const isRoot = data.name === 'loopback-next';

  let modified = false;
  if (isExample && data.devDependencies && data.devDependencies.tslint) {
    delete data.devDependencies.tslint;
    modified = true;
  }
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
  writeJsonFile(pkgFile, data);
  return true;
}

if (require.main === module) syncDevDeps();

function readJsonFile(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function writeJsonFile(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
  console.log('%s has been updated.', filePath);
}
