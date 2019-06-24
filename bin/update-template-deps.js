#!/usr/bin/env node
// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: loopback-next
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * This is an internal script to update module dependencies for CLI code
 * generation templates of package.json.
 */
'use strict';

const path = require('path');
const fs = require('fs');

const Project = require('@lerna/project');

async function updateTemplateDeps() {
  const project = new Project(process.cwd());
  const packages = await project.getPackages();

  const pkgs = packages
    .filter(pkg => !pkg.private)
    .map(pkg => ({
      name: pkg.name,
      version: pkg.version,
    }));

  const lbModules = {};
  for (const p of pkgs) {
    lbModules[p.name] = '^' + p.version;
  }

  const rootPath = project.rootPath;

  // Load dependencies from `packages/build/package.json`
  const buildDeps = require(path.join(rootPath, 'packages/build/package.json'))
    .dependencies;

  // Load dependencies from `packages/cli/package.json`
  const cliPackageJson = path.join(rootPath, 'packages/cli/package.json');

  // Loading existing dependencies from `packages/cli/package.json`
  const cliPkg = require(cliPackageJson);
  cliPkg.config = cliPkg.config || {};
  const currentDeps = cliPkg.config.templateDependencies || {};

  // Merge all entries
  const deps = Object.assign({}, currentDeps, buildDeps, lbModules);

  cliPkg.config.templateDependencies = deps;

  // Convert to JSON
  const json = JSON.stringify(cliPkg, null, 2);

  if (process.argv[2] === '-f') {
    // Using `-f` to overwrite packages/cli/lib/dependencies.json
    fs.writeFileSync(cliPackageJson, json + '\n', {encoding: 'utf-8'});
    console.log('%s has been updated.', cliPackageJson);
  } else {
    // Otherwise write to console
    console.log(json);
  }
}

if (require.main === module) {
  updateTemplateDeps().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
