#!/usr/bin/env node
// Copyright IBM Corp. 2017,2019. All Rights Reserved.
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
const fs = require('fs');
const debug = require('debug')('loopback:build');

const Project = require('@lerna/project');
const PackageGraph = require('@lerna/package-graph');

const TSCONFIG = 'tsconfig.json';
const TSCONFIG_BUILD = 'tsconfig.build.json';

function loadTSConfig(pkg) {
  const pkgLocation = pkg.location;
  const tsconfigFile = path.join(pkgLocation, TSCONFIG);
  const tsconfigBuildFile = path.join(pkgLocation, TSCONFIG_BUILD);
  if (!fs.existsSync(tsconfigFile) && !fs.existsSync(tsconfigBuildFile)) {
    return undefined;
  }
  let tsconfig;
  try {
    tsconfig = require(tsconfigFile);
  } catch (err) {
    tsconfig = require(tsconfigBuildFile);
  }
  return tsconfig;
}

async function updateReferences(options) {
  options = options || {};
  const dryRun = options.dryRun;
  const project = new Project(process.cwd());
  const packages = await project.getPackages();

  const rootRefs = [];
  const graph = new PackageGraph(packages);

  for (const p of graph.values()) {
    debug('Package %s', p.pkg.name);
    const pkgLocation = p.pkg.location;
    const tsconfig = loadTSConfig(p.pkg);
    // Skip non-typescript packages
    if (!tsconfig) {
      debug('Skipping non-TS package: %s', p.pkg.name);
      continue;
    }
    rootRefs.push({
      path: path.join(path.relative(project.rootPath, pkgLocation), TSCONFIG),
    });
    const refs = [];
    for (const d of p.localDependencies.keys()) {
      const depPkg = graph.get(d);
      // Skip non-typescript packages
      if (!loadTSConfig(depPkg.pkg)) {
        debug('Skipping non-TS dependency: %s', depPkg.pkg.name);
        continue;
      }
      const relativePath = path.relative(pkgLocation, depPkg.pkg.location);
      refs.push({path: path.join(relativePath, TSCONFIG)});
    }
    tsconfig.compilerOptions = Object.assign(
      {
        // outDir & target have to be set in tsconfig instead of CLI for tsc -b
        target: 'es2017',
        outDir: 'dist',
      },
      tsconfig.compilerOptions,
      {
        // composite must be true for project refs
        composite: true,
      },
    );

    if (!tsconfig.include) {
      // To include ts/json files
      tsconfig.include = ['src/**/*', 'src/**/*.json'];
    }
    tsconfig.references = refs;

    // Convert to JSON
    const tsconfigJson = JSON.stringify(tsconfig, null, 2);

    if (!dryRun) {
      const tsconfigFile = path.join(pkgLocation, TSCONFIG);
      const tsconfigBuildFile = path.join(pkgLocation, TSCONFIG_BUILD);
      // Using `-f` to overwrite tsconfig.json
      fs.writeFileSync(tsconfigFile, tsconfigJson + '\n', {encoding: 'utf-8'});
      if (fs.existsSync(tsconfigBuildFile)) {
        fs.unlinkSync(tsconfigBuildFile);
      }
      if (fs.existsSync(path.join(pkgLocation, 'index.ts'))) {
        fs.unlinkSync(path.join(pkgLocation, 'index.ts'));
      }
      if (fs.existsSync(path.join(pkgLocation, 'index.d.ts'))) {
        fs.unlinkSync(path.join(pkgLocation, 'index.d.ts'));
      }
      const pkg = require(path.join(pkgLocation, 'package.json'));
      pkg.main = 'dist/index.js';
      pkg.types = 'dist/index.d.ts';
      fs.writeFileSync(
        path.join(pkgLocation, 'package.json'),
        JSON.stringify(pkg, null, 2) + '\n',
      );
      debug('%s has been updated.', tsconfigFile);
    } else {
      // Otherwise write to console
      debug(tsconfigJson);
      console.log('%s', p.pkg.name);
      refs.forEach(r => console.log('  %s', r.path));
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
    debug(rootTsconfigJson);
    console.log('\n%s', path.relative(project.rootPath, rootTsconfigFile));
    rootRefs.forEach(r => console.log('  %s', r.path));
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
