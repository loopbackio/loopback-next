#!/usr/bin/env node
// Copyright The LoopBack Authors 2020,2021. All Rights Reserved.
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

const {PackageGraph} = require('@lerna/package-graph');
const path = require('path');
const fs = require('fs-extra');
const {
  isDryRun,
  loadLernaRepo,
  printJson,
  writeJsonSync,
  cloneJson,
  isJsonEqual,
  runMain,
} = require('./script-util');

const debug = require('debug')('loopback:monorepo');

const TSCONFIG = 'tsconfig.json';
const TSCONFIG_BUILD = 'tsconfig.build.json';

function loadTsConfig(pkgLocation, dryRun = true) {
  const tsconfigFile = path.join(pkgLocation, TSCONFIG);
  let file = tsconfigFile;
  if (!fs.existsSync(tsconfigFile)) {
    const tsconfigBuildFile = path.join(pkgLocation, TSCONFIG_BUILD);
    if (fs.existsSync(tsconfigBuildFile)) {
      if (!dryRun) {
        fs.moveSync(tsconfigBuildFile, tsconfigFile);
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
  const dryRun = isDryRun(options);
  const {project, packages} = await loadLernaRepo();

  const rootRefs = [];
  const graph = new PackageGraph(packages);

  const tsPackages = Array.from(graph.values()).filter(p => {
    debug(
      'Checking TypeScript project references for %s@%s',
      p.pkg.name,
      p.pkg.version,
    );
    const pkgLocation = p.pkg.location;
    return loadTsConfig(pkgLocation, dryRun) != null;
  });

  let changed = false;
  for (const p of tsPackages) {
    const pkgLocation = p.pkg.location;
    const tsconfigMeta = loadTsConfig(pkgLocation, dryRun);
    const tsconfigFile = tsconfigMeta.file;
    rootRefs.push({
      path: path
        .join(path.relative(project.rootPath, pkgLocation), TSCONFIG)
        .replace(/\\/g, '/'),
    });
    const tsconfig = tsconfigMeta.tsconfig;
    const originalTsconfigJson = cloneJson(tsconfig);

    const refs = [];
    for (const d of p.localDependencies.keys()) {
      const depPkg = graph.get(d);
      // Skip non-typescript packages
      if (loadTsConfig(depPkg.location, dryRun) == null) continue;
      const relativePath = path.relative(pkgLocation, depPkg.pkg.location);
      refs.push({path: path.join(relativePath, TSCONFIG).replace(/\\/g, '/')});
    }
    tsconfig.compilerOptions = {
      // outDir has to be set in tsconfig instead of CLI for tsc -b
      outDir: 'dist',
      ...tsconfig.compilerOptions,
      // composite must be true for project refs
      composite: true,
    };

    if (!tsconfig.include || p.name.startsWith('@loopback/example-')) {
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
      console.log('- %s', p.pkg.name);
      printJson(tsconfig);
    }
  }

  const rootTsconfigFile = path.join(project.rootPath, 'tsconfig.json');
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
    console.log('\n%s', path.relative(project.rootPath, rootTsconfigFile));
    printJson(rootTsconfig);
  }
}

module.exports = updateTsReferences;

runMain(module, updateTsReferences);
