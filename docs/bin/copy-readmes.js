#!/usr/bin/env node
// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/docs
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

/*
 * This is an internal script to gather READMEs of all packages
 * in our monorepo and copy them to `site/readmes` for consumption
 * from the docs.
 */

const Project = require('@lerna/project');
const fs = require('fs-extra');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '../..');
const DEST_ROOT = path.resolve(__dirname, '../site/readmes/loopback-next');

copyReadmes().catch(err => {
  console.error('Unhandled error.', err);
  process.exit(1);
});

async function copyReadmes() {
  // Remove the original folder so we remove files from deleted packages
  fs.removeSync(DEST_ROOT);

  const project = new Project(REPO_ROOT);
  const allPackages = await project.getPackages();

  const packages = allPackages.filter(isDocumented).map(pkg => ({
    name: pkg.name,
    location: path.relative(REPO_ROOT, pkg.location),
  }));

  for (const {location} of packages) {
    const src = path.join(REPO_ROOT, location, 'README.md');
    const dest = path.join(DEST_ROOT, location, 'README.md');
    await fs.copy(src, dest, {overwrite: true});
  }
}

function isDocumented(pkg) {
  return (
    !pkg.name.startsWith('@loopback/sandbox-') &&
    pkg.name !== '@loopback/docs' &&
    pkg.name !== '@loopback/benchmark'
  );
}
