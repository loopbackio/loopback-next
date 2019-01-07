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

  const masterDeps = {
    typescript: buildDeps.typescript,
    tslint: buildDeps.tslint,
  };

  // Update typescript & tslint dependencies in individual packages
  for (const pkg of packages) {
    const data = readJsonFile(pkg.manifestLocation);
    let modified = false;
    for (const dep in masterDeps) {
      if (data.devDependencies && dep in data.devDependencies) {
        data.devDependencies[dep] = masterDeps[dep];
        modified = true;
      }
    }
    if (!modified) continue;
    writeJsonFile(pkg.manifestLocation, data);
  }

  // Update dependencies in monorepo root
  const rootPackage = path.join(rootPath, 'package.json');
  const data = readJsonFile(rootPackage);
  Object.assign(data.devDependencies, masterDeps);
  writeJsonFile(rootPackage, data);
}

if (require.main === module) syncDevDeps();

function readJsonFile(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function writeJsonFile(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
  console.log('%s has been updated.', filePath);
}
