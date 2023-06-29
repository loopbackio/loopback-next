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

const path = require('node:path');
const pkgJson = require('@npmcli/package-json');
const mapWorkspaces = require('@npmcli/map-workspaces');
const {isDryRun, printJson, runMain} = require('./script-util');

/**
 * Update `templateDependencies` in `packages/cli/package.json`
 * @param {*} options - Options
 */
async function updateTemplateDeps(options) {
  const rootPath = process.cwd();

  const {content: rootPkg} = await pkgJson.load(rootPath);
  const workspaces = await mapWorkspaces({cwd: rootPath, pkg: rootPkg});

  const packages = await Promise.all(
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

  // Load eslint related dependencies from `packages/eslint-config/package.json`
  const {content: eslintPkg} = await pkgJson.load(
    path.join(rootPath, 'packages/eslint-config'),
  );

  // Load dependencies from `packages/build/package.json`
  const {content: buildPkg} = await pkgJson.load(
    path.join(rootPath, 'packages/build'),
  );

  // Load dependencies from `packages/core/package.json` for `tslib`
  const {content: corePkg} = await pkgJson.load(
    path.join(rootPath, 'packages/core'),
  );

  const cliPath = path.join(rootPath, 'packages/cli');

  const cliPkg = await pkgJson.load(cliPath);

  const config = {
    ...cliPkg.content.config,
    templateDependencies: {
      tslib: corePkg.dependencies.tslib,
      ...cliPkg.content.config.templateDependencies,
      ...buildPkg.dependencies,
      ...eslintPkg.dependencies,
      ...lbModules,
    },
  };

  if (isDryRun(options)) {
    // Dry run
    printJson(config);
  } else {
    cliPkg.update({config});
    const fullPath = path.join(cliPath, 'package.json');
    console.log('%s has been updated.', path.relative(process.cwd(), fullPath));
  }
}

module.exports = updateTemplateDeps;

runMain(module, updateTemplateDeps);
