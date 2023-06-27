#!/usr/bin/env node
// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/monorepo
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * This is a script to update TypeScript project references in `tsconfig.json`
 * based on lerna's local package dependencies.
 *
 * See https://www.typescriptlang.org/docs/handbook/project-references.html
 */
'use strict';

const path = require('node:path');
const fse = require('fs-extra');
const debugFactory = require('debug');
const pkgJson = require('@npmcli/package-json');
const mapWorkspaces = require('@npmcli/map-workspaces');
const {
  isDryRun,
  printJson,
  writeJsonSync,
  cloneJson,
  isJsonEqual,
  runMain,
} = require('./script-util');

const debug = debugFactory('loopback:monorepo');

const TSCONFIG = 'tsconfig.json';
const TSCONFIG_BUILD = 'tsconfig.build.json';

function loadTsConfig(location, dryRun = true) {
  const tsconfigFile = path.join(location, TSCONFIG);
  let file = tsconfigFile;
  if (!fse.existsSync(tsconfigFile)) {
    const tsconfigBuildFile = path.join(location, TSCONFIG_BUILD);
    if (fse.existsSync(tsconfigBuildFile)) {
      if (!dryRun) {
        fse.moveSync(tsconfigBuildFile, tsconfigFile);
      } else {
        file = tsconfigBuildFile;
      }
    } else {
      return undefined;
    }
  }
  return {
    file,
    tsconfig: require(file),
  };
}

/**
 * Update TypeScript project references
 * @param {object} options - Options object
 * - dryRun: a flag to control if a dry run is intended
 */
async function updateTsReferences(options) {
  const rootRefs = [];
  const dryRun = isDryRun(options);

  const {content: rootPkg} = await pkgJson.normalize(process.cwd());
  const workspaces = await mapWorkspaces({cwd: process.cwd(), pkg: rootPkg});

  const tsPackages = Array.from(workspaces).filter(([name, location]) => {
    debug('Checking TypeScript project references for %s', name);
    return loadTsConfig(location, dryRun) != null;
  });

  let changed = false;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  for (const [name, location] of tsPackages) {
    const {content: pkg} = await pkgJson.load(location);
    const {file: tsconfigFile, tsconfig} = loadTsConfig(location, dryRun);
    const originalTsconfigJson = cloneJson(tsconfig);

    rootRefs.push({
      path: path
        .join(path.relative(process.cwd(), location), TSCONFIG)
        .replace(/\\/g, '/'),
    });

    const graphDependencies = Object.assign(
      {},
      pkg.devDependencies,
      pkg.optionalDependencies,
      pkg.peerDependencies,
      pkg.dependencies,
    );

    const localDependencies = new Map(
      [...workspaces].filter(value => {
        return Object.keys(graphDependencies).includes(value[0]);
      }),
    );

    const refs = [];
    for (const d of localDependencies) {
      if (loadTsConfig(d[1], dryRun) == null) continue;
      const relativePath = path.relative(location, d[1]);
      refs.push({path: path.join(relativePath, TSCONFIG).replace(/\\/g, '/')});
    }

    tsconfig.compilerOptions = {
      // outDir has to be set in tsconfig instead of CLI for tsc -b
      outDir: 'dist',
      ...tsconfig.compilerOptions,
      // composite must be true for project refs
      composite: true,
    };

    if (!tsconfig.include || pkg.name.startsWith('@loopback/example-')) {
      // To include ts/json files
      tsconfig.include = ['src/**/*', 'src/**/*.json'];
    }
    // Sort the references so that we will have a consistent output
    tsconfig.references = refs.sort((a, b) => a.path.localeCompare(b.path));

    if (!dryRun) {
      if (!isJsonEqual(tsconfig, originalTsconfigJson)) {
        writeJsonSync(tsconfigFile, tsconfig);
        changed = true;
        debug('%s has been updated.', tsconfigFile);
      }
    } else {
      // Otherwise write to console
      console.log('- %s', pkg.name);
      printJson(tsconfig);
    }
  }

  const rootTsconfigFile = path.join(process.cwd(), 'tsconfig.json');
  const rootTsconfig = require(rootTsconfigFile);
  const originalRootTsconfigJson = cloneJson(rootTsconfig);

  rootTsconfig.compilerOptions = rootTsconfig.compilerOptions || {};
  rootTsconfig.compilerOptions.composite = true;
  rootTsconfig.references = rootRefs;

  // Reset files/include/exclude. The root should use project references now.
  rootTsconfig.files = [];
  delete rootTsconfig.include;
  delete rootTsconfig.exclude;

  if (!dryRun) {
    if (!isJsonEqual(originalRootTsconfigJson, rootTsconfig)) {
      // Using `-f` to overwrite tsconfig.json
      writeJsonSync(rootTsconfigFile, rootTsconfig);
      changed = true;
      debug('%s has been updated.', rootTsconfigFile);
    }
    if (changed) {
      console.log('TypeScript project references have been updated.');
    } else {
      console.log('TypeScript project references are up to date.');
    }
  } else {
    console.log('\n%s', path.relative(process.cwd(), rootTsconfigFile));
    printJson(rootTsconfig);
  }
}

module.exports = updateTsReferences;

runMain(module, updateTsReferences);
