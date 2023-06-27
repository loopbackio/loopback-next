#!/usr/bin/env node
// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/docs
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

/*
 * This is an internal script to gather CHANGELOGs of all packages
 * in our monorepo and copy them to `site/changelogs` for consumption
 * from the docs. It also generates Jekyll friendly pages for CHANGELOG files.
 */

const path = require('node:path');
const fse = require('fs-extra');
const pkgJson = require('@npmcli/package-json');
const mapWorkspaces = require('@npmcli/map-workspaces');

const REPO_ROOT = path.resolve(__dirname, '../..');
const DEST_ROOT = path.resolve(__dirname, '../site/changelogs');
const SITE_ROOT = path.resolve(__dirname, '../site');

async function copyChangelogs() {
  // Remove the original folder so we remove files from deleted packages
  await fse.remove(DEST_ROOT);

  const {content: rootPkg} = await pkgJson.load(REPO_ROOT);
  const workspaces = await mapWorkspaces({cwd: REPO_ROOT, pkg: rootPkg});
  const allPackages = await Promise.all(
    Array.from(workspaces, async ([name, location]) => {
      const {content: pkg} = await pkgJson.load(location);
      return {
        name,
        location,
        private: pkg.private ?? false,
        version: pkg.version,
      };
    }),
  );
  const packages = allPackages
    .filter(shouldCopyChangelog)
    .map(pkg => ({
      name: pkg.name,
      get shortName() {
        if (this.name.startsWith('@loopback/')) {
          return this.name.substring('@loopback/'.length);
        }
        return this.name;
      },
      private: pkg.private,
      location: path.relative(REPO_ROOT, pkg.location),
      get dir() {
        return path.dirname(this.location);
      },
    }))
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
keywords: LoopBack 4.0, LoopBack 4, Node.js, TypeScript, OpenAPI
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
      const exists = await fse.exists(src);
      if (!exists) continue;

      const content = await fse.readFile(src, 'utf-8');
      const md = `---
lang: en
title: 'CHANGELOG - ${name}'
keywords: LoopBack 4.0, LoopBack 4, Node.js, TypeScript, OpenAPI, Node.js, TypeScript, OpenAPI, CHANGELOG
sidebar: lb4_sidebar
toc_level: 0
editurl: https://github.com/loopbackio/loopback-next/blob/master/${location}/CHANGELOG.md
permalink: /doc/en/lb4/changelog.${shortName}.html
---

${content}
`;
      const dest = path.join(DEST_ROOT, location, 'CHANGELOG.md');
      await fse.outputFile(dest, md, 'utf-8');

      // Add an entry to the index
      changelogIndexPage.push(
        `- [${name}](changelogs/${location}/CHANGELOG.md)`,
      );
    }
  }

  // Write `site/CHANGELOG.md`
  await fse.outputFile(
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

if (require.main === module) {
  copyChangelogs().catch(err => {
    console.error('Unhandled error.', err);
    process.exit(1);
  });
}
