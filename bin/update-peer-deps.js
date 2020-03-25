#!/usr/bin/env node
// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: loopback-next
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * This is an internal script to update peer dependencies based on released
 * LoopBack package versions.
 */
'use strict';

const fs = require('fs');

const Project = require('@lerna/project');

async function updatePeerDeps() {
  // List all packages within the monorepo
  const project = new Project(process.cwd());
  const packages = await project.getPackages();

  // Build a map of module name/version pairs
  const lbModuleVersions = {};
  for (const p of packages) {
    lbModuleVersions[p.name] = p.version;
  }

  for (const p of packages) {
    // Load package.json
    const pkgJsonFile = p.manifestLocation;
    const pkgJson = require(pkgJsonFile);
    let updated = false;
    if (pkgJson.peerDependencies) {
      // Check all entries in peerDependencies
      for (const d in pkgJson.peerDependencies) {
        const pkgVersion = lbModuleVersions[d];
        if (pkgVersion) {
          // Update the version range to be `^<pkgVersion>`
          // We choose to be conservative as only this version has been verified
          // by CI
          pkgJson.peerDependencies[d] = `^${pkgVersion}`;
          updated = true;
        }
      }
    }
    if (!updated) continue;

    // Convert to JSON
    const json = JSON.stringify(pkgJson, null, 2);
    if (process.argv[2] === '-f') {
      // Using `-f` to overwrite package.json
      fs.writeFileSync(pkgJsonFile, json + '\n', {encoding: 'utf-8'});
      console.log('%s has been updated.', pkgJsonFile);
    } else {
      // Otherwise write to console
      console.log('%s\n', pkgJsonFile, json);
    }
  }
}

if (require.main === module) {
  updatePeerDeps().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
