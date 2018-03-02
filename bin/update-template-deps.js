#!/usr/bin/env node
// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * This is an internal script to update module dependencies for CLI code
 * generation templates of package.json.
 */
'use strict';

const path = require('path');
const fs = require('fs');
const lerna = require('lerna');
const ls = new lerna.LsCommand(null, {json: true, loglevel: 'silent'});

// We don't have to run the command as the preparations will collect packages
ls.configureLogging();
ls.runValidations();
ls.runPreparations();

const pkgs = ls.filteredPackages.filter(pkg => !pkg.isPrivate()).map(pkg => ({
  name: pkg.name,
  version: pkg.version,
}));

const lbModules = {};
for (const p of pkgs) {
  lbModules[p.name] = '^' + p.version;
}

const rootPath = ls.repository.rootPath;

// Load dependencies from `packages/build/package.json`
const buildDeps = require(path.join(rootPath, 'packages/build/package.json'))
  .dependencies;

// Load dependencies from `packages/cli/lib/dependencies.json`
const dependenciesFile = path.join(
  rootPath,
  'packages/cli/lib/dependencies.json',
);

// Loading existing dependencies from `packages/cli/lib/dependencies.json`
let currentDeps = {};
try {
  currentDeps = require(dependenciesFile);
} catch (e) {
  // Ignore error
}

// Merge all entries
const deps = Object.assign({}, currentDeps, buildDeps, lbModules);

// Convert to JSON
const json = JSON.stringify(deps, null, 2);

if (process.argv[2] === '-f') {
  // Using `-f` to overwrite packages/cli/lib/dependencies.json
  fs.writeFileSync(dependenciesFile, json + '\n', {encoding: 'utf-8'});
  console.log('%s has been updated.', dependenciesFile);
} else {
  // Otherwise write to console
  console.log(json);
}
