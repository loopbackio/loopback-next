#!/usr/bin/env node
// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: loopback-next
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * This is an internal script to update module dependencies for CLI code
 * generation templates of package.json.
 */
'use strict';

const path = require('path');
const {
  isDryRun,
  printJson,
  writeJsonSync,
  loadLernaRepo,
  runMain,
} = require('../packages/monorepo');

/**
 * Update `templateDependencies` in `packages/cli/package.json`
 * @param {*} options - Options
 */
async function updateTemplateDeps(options) {
  const {project, packages} = await loadLernaRepo();

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

  // Load eslint related dependencies from `packages/eslint-config/package.json`
  const eslintDeps = require(path.join(
    rootPath,
    'packages/eslint-config/package.json',
  )).dependencies;

  // Load dependencies from `packages/build/package.json`
  const buildDeps = require(path.join(rootPath, 'packages/build/package.json'))
    .dependencies;

  // Load dependencies from `packages/core/package.json` for `tslib`
  const coreDeps = require(path.join(rootPath, 'packages/core/package.json'))
    .dependencies;

  // Load dependencies from `packages/cli/package.json`
  const cliPackageJson = path.join(rootPath, 'packages/cli/package.json');

  // Loading existing dependencies from `packages/cli/package.json`
  const cliPkg = require(cliPackageJson);
  cliPkg.config = cliPkg.config || {};
  const currentDeps = cliPkg.config.templateDependencies || {};

  // Merge all entries
  const deps = {
    tslib: coreDeps.tslib,
    ...currentDeps,
    ...buildDeps,
    ...eslintDeps,
    ...lbModules,
  };

  cliPkg.config.templateDependencies = deps;

  if (isDryRun(options)) {
    // Dry run
    printJson(cliPkg);
  } else {
    //Overwrite packages/cli/lib/dependencies.json
    writeJsonSync(cliPackageJson, cliPkg);
    console.log('%s has been updated.', cliPackageJson);
  }
}

module.exports = updateTemplateDeps;

runMain(module, updateTemplateDeps);
