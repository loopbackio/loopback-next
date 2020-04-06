#!/usr/bin/env node
// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/docs
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

/*
 * This is an internal script to gather CHANGELOGs of all packages
 * in our monorepo and copy them to `site/changelogs` for consumption
 * from the docs. It also generates Jekyll friendly pages for CHANGELOG files.
 */

const Project = require('@lerna/project');
const fs = require('fs-extra');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '../..');
const DEST_ROOT = path.resolve(__dirname, '../site/changelogs');
const SITE_ROOT = path.resolve(__dirname, '../site');

if (require.main === module) {
  copyChangelogs().catch(err => {
    console.error('Unhandled error.', err);
    process.exit(1);
  });
}

async function copyChangelogs() {
  // Remove the original folder so we remove files from deleted packages
  await fs.remove(DEST_ROOT);

  const project = new Project(REPO_ROOT);
  const allPackages = await project.getPackages();

  const packages = allPackages
    .filter(shouldCopyChangelog)
    .map(pkg => {
      let shortName = pkg.name;
      if (pkg.name.startsWith('@loopback/')) {
        shortName = pkg.name.substring('@loopback/'.length);
      }

      const location = path.relative(REPO_ROOT, pkg.location);
      const meta = {
        name: pkg.name,
        shortName,
        private: pkg.private,
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

  // Index page for all CHANGELOG files
  const changelogIndexPage = [
    `---
lang: en
title: 'CHANGELOG Docs'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/changelog.index.html
---

## CHANGELOG`,
  ];

  for (const dir in packagesByDir) {
    const arr = packagesByDir[dir]
      .filter(shouldPublishChangelog)
      .sort((a, b) => a.name.localeCompare(b.name));
    if (arr.length) {
      // Add an entry to the index for each dir
      changelogIndexPage.push(`\n### ${dir}\n`);
    }
    for (const {location, name, shortName} of arr) {
      const src = path.join(REPO_ROOT, location, 'CHANGELOG.md');
      const exists = await fs.exists(src);
      if (!exists) continue;

      const content = await fs.readFile(src, 'utf-8');
      const md = `---
lang: en
title: 'CHANGELOG - ${name}'
keywords: LoopBack 4.0, LoopBack 4, CHANGELOG
sidebar: lb4_sidebar
permalink: /doc/en/lb4/changelog.${shortName}.html
---

${content}
`;
      const dest = path.join(DEST_ROOT, location, 'CHANGELOG.md');
      await fs.outputFile(dest, md, 'utf-8');

      // Add an entry to the index
      changelogIndexPage.push(
        `- [${name}](changelogs/${location}/CHANGELOG.md)`,
      );
    }
  }

  // Write `site/CHANGELOG.md`
  await fs.outputFile(
    path.join(SITE_ROOT, 'CHANGELOG.md'),
    changelogIndexPage.join('\n'),
    'utf-8',
  );
}

/**
 * Control if CHANGELOG for the given package should be copied
 * @param {object} pkg
 */
function shouldCopyChangelog(pkg) {
  return (
    !pkg.private &&
    !pkg.name.startsWith('@loopback/sandbox-') &&
    pkg.name !== '@loopback/docs' &&
    pkg.name !== '@loopback/benchmark'
  );
}

/**
 * Test if CHANGELOG should be published for the given package
 * @param {object} pkg
 */
function shouldPublishChangelog(pkg) {
  return !pkg.private;
}
