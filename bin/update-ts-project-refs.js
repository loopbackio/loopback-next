#!/usr/bin/env node
// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: loopback-next
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * This is an internal script to update TypeScript project references based on
 * lerna's local package dependencies.
 *
 * See https://www.typescriptlang.org/docs/handbook/project-references.html
 */
'use strict';

const path = require('path');
const fs = require('fs-extra');
const debug = require('debug')('loopback:build');

const Project = require('@lerna/project');
const PackageGraph = require('@lerna/package-graph');

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

async function updateReferences(options) {
  options = options || {};
  const dryRun = options.dryRun;
  const project = new Project(process.cwd());
  const packages = await project.getPackages();

  const rootRefs = [];
  const graph = new PackageGraph(packages);

  const tsPackages = Array.from(graph.values()).filter(p => {
    debug('Package %s', p.pkg.name);
    const pkgLocation = p.pkg.location;
    return loadTsConfig(pkgLocation, dryRun) != null;
  });

  for (const p of tsPackages) {
    const pkgLocation = p.pkg.location;
    const tsconfigMeta = loadTsConfig(pkgLocation, dryRun);
    const tsconfigFile = tsconfigMeta.file;
    rootRefs.push({
      path: path.join(path.relative(project.rootPath, pkgLocation), TSCONFIG),
    });
    const tsconfig = tsconfigMeta.tsconfig;
    const refs = [];
    for (const d of p.localDependencies.keys()) {
      const depPkg = graph.get(d);
      // Skip non-typescript packages
      if (loadTsConfig(depPkg.location, dryRun) == null) continue;
      const relativePath = path.relative(pkgLocation, depPkg.pkg.location);
      refs.push({path: path.join(relativePath, TSCONFIG)});
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
    tsconfig.references = refs;

    // Convert to JSON
    const tsconfigJson = JSON.stringify(tsconfig, null, 2);

    if (!dryRun) {
      // Using `-f` to overwrite tsconfig.json
      fs.writeFileSync(tsconfigFile, tsconfigJson + '\n', {encoding: 'utf-8'});
      debug('%s has been updated.', tsconfigFile);
    } else {
      // Otherwise write to console
      console.log('- %s', p.pkg.name);
      console.log(tsconfigJson);
    }
  }

  const rootTsconfigFile = path.join(project.rootPath, 'tsconfig.json');
  const rootTsconfig = require(rootTsconfigFile);
  rootTsconfig.compilerOptions = rootTsconfig.compilerOptions || {};
  rootTsconfig.compilerOptions.composite = true;
  rootTsconfig.references = rootRefs;

  // Reset files/include/exclude. The root should use project references now.
  rootTsconfig.files = [];
  delete rootTsconfig.include;
  delete rootTsconfig.exclude;

  // Convert to JSON
  const rootTsconfigJson = JSON.stringify(rootTsconfig, null, 2);
  if (!dryRun) {
    // Using `-f` to overwrite tsconfig.json
    fs.writeFileSync(rootTsconfigFile, rootTsconfigJson + '\n', {
      encoding: 'utf-8',
    });
    debug('%s has been updated.', rootTsconfigFile);
    console.log('TypeScript project references have been updated.');
  } else {
    console.log('\n%s', path.relative(project.rootPath, rootTsconfigFile));
    console.log(rootTsconfigJson);
    console.log(
      '\nThis is a dry-run. Please use -f option to update tsconfig files.',
    );
  }
}

if (require.main === module) {
  const dryRun = !process.argv.includes('-f');
  updateReferences({dryRun}).catch(err => {
    console.error(err);
    process.exit(1);
  });
}
