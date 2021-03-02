#!/usr/bin/env node
// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/docs
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

/*
 * This is an internal script to gather READMEs of all packages
 * in our monorepo and copy them to `site/readmes` for consumption
 * from the docs.
 */

const {getPackages} = require('@lerna/project');
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

  const allPackages = await getPackages(REPO_ROOT);
  const packages = allPackages.filter(isDocumented).map(pkg => ({
    name: pkg.name,
    location: path.relative(REPO_ROOT, pkg.location),
  }));

  for (const {location} of packages) {
    let files = await fs.readdir(path.join(REPO_ROOT, location));
    files = files.filter(
      // Copy README.md and image files
      f =>
        f === 'README.md' ||
        ['.png', '.jpg', 'jpeg'].includes(path.extname(f).toLowerCase()),
    );
    for (const f of files) {
      await fs.copy(
        path.join(REPO_ROOT, location, f),
        path.join(DEST_ROOT, location, f),
        {overwrite: true},
      );
    }
  }
}

function isDocumented(pkg) {
  return (
    !pkg.name.startsWith('@loopback/sandbox-') &&
    pkg.name !== '@loopback/docs' &&
    pkg.name !== '@loopback/benchmark'
  );
}
