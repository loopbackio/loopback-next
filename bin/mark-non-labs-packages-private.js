#!/usr/bin/env node
// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: loopback-next
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * This is an internal script to set all non-labs packages to be private
 */
'use strict';

const path = require('path');
const fs = require('fs');

const Project = require('@lerna/project');

async function markNonLabsPackagesPrivate() {
  const project = new Project(process.cwd());
  const packages = await project.getPackages();

  // Set `"private": "true"` in individual packages
  for (const pkg of packages) {
    const dir = path.relative(pkg.rootPath, pkg.location);
    if (dir.startsWith('labs')) continue;
    const data = readJsonFile(pkg.manifestLocation);
    let modified = !data.private;
    if (!modified) continue;
    data.private = true;
    writeJsonFile(pkg.manifestLocation, data, dir);
  }
}

if (require.main === module) markNonLabsPackagesPrivate();

function readJsonFile(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function writeJsonFile(filePath, data, dir) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
  console.log('> %s has been marked as private.', dir || filePath);
}
