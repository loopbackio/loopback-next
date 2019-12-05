#!/usr/bin/env node
// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: loopback-next
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

/*
 * This is an internal script to gather READMEs of all packages
 * in our monorepo and copy them to `site/readmes` for consumption
 * from the docs. It also generates Jekyll friendly pages for README files.
 */

const Project = require('@lerna/project');
const fs = require('fs-extra');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '../..');
const DEST_ROOT = path.resolve(__dirname, '../site/readmes/loopback-next');
const SITE_ROOT = path.resolve(__dirname, '../site');

if (require.main === module) {
  copyReadmes().catch(err => {
    console.error('Unhandled error.', err);
    process.exit(1);
  });
}

async function copyReadmes() {
  // Remove the original folder so we remove files from deleted packages
  fs.removeSync(DEST_ROOT);

  const project = new Project(REPO_ROOT);
  const allPackages = await project.getPackages();

  const packages = allPackages
    .filter(shouldCopyReadme)
    .map(pkg => {
      let shortName = pkg.name;
      if (pkg.name.startsWith('@loopback/')) {
        shortName = pkg.name.substring('@loopback/'.length);
      }

      const location = path.relative(REPO_ROOT, pkg.location);
      const meta = {
        name: pkg.name,
        shortName,
        isPrivate: pkg.isPrivate,
        location,
        dir: path.dirname(location),
      };
      return meta;
    })
    .sort((a, b) => b.location.localeCompare(a.location));

  const packagesByDir = {};
  packages.forEach(pkg => {
    let list = packagesByDir[pkg.dir];
    if (list == null) {
      list = [];
      packagesByDir[pkg.dir] = list;
    }
    list.push(pkg);
  });

  // Index page for all README files
  const readmeIndexPage = [
    `---
lang: en
title: 'README Docs'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/readme.index.html
---

## README documents`,
  ];

  for (const dir in packagesByDir) {
    const arr = packagesByDir[dir].filter(shouldPublishReadme);
    if (arr.length) {
      // Add an entry to the index for each dir
      readmeIndexPage.push(`\n### ${dir}\n`);
    }
    for (const {location, name, shortName} of packagesByDir[dir]) {
      const src = path.join(REPO_ROOT, location, 'README.md');
      const dest = path.join(DEST_ROOT, location, 'README.md');
      await fs.copy(src, dest, {overwrite: true});

      if (!shouldPublishReadme({name, location})) continue;

      // Build a Jekyll page for the README file
      // Unfortunately our `readme` layout expects the md file to be under `site`
      const readmePage = `README-${shortName}.md`;
      const md = `---
lang: en
title: 'README - ${name}'
keywords: LoopBack 4.0, LoopBack 4, README
layout: readme
source: loopback-next
file: ${location}/README.md
sidebar: lb4_sidebar
permalink: /doc/en/lb4/readme.${shortName}.html
---
`;
      // Write `site/README-<pkg-name>.md`, such as `README-extension-health.md`
      await fs.writeFile(path.join(SITE_ROOT, readmePage), md, 'utf-8');

      // Add an entry to the index
      readmeIndexPage.push(`- [${name}](${readmePage})`);
    }
  }

  // Write `site/README-index.md`
  await fs.writeFile(
    path.join(SITE_ROOT, 'README-index.md'),
    readmeIndexPage.join('\n'),
    'utf-8',
  );
}

/**
 * Control if README for the given package should be copied
 * @param {object} pkg
 */
function shouldCopyReadme(pkg) {
  return (
    !pkg.isPrivate &&
    !pkg.name.startsWith('@loopback/sandbox-') &&
    pkg.name !== '@loopback/docs' &&
    pkg.name !== '@loopback/benchmark'
  );
}

/**
 * Test if README should be published for the given package
 * @param {object} pkg
 */
function shouldPublishReadme(pkg) {
  return !pkg.location.startsWith('packages/');
}
