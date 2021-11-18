#!/usr/bin/env node
// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/monorepo
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * This is a script that verifies that all packages in a lerna monorepo have the
 * expected metadata in their `package.json`.
 */
'use strict';

import debugFactory from 'debug';
import fs from 'fs-extra';
import path from 'node:path';
import {
  cloneJson, isDryRun, isJsonEqual, isMonorepoPackage, isTypeScriptPackage, loadLernaRepo, printJson,
  runMain, writeJsonSync
} from './script-util.cjs';

const debug = debugFactory('loopback:monorepo');

const orderedPkgProperties = [
  'name',
  'description',
  'version',
  'keywords',
  'private',
  'license',
  'bin',
  'main',
  'unpkg',
  'types',
  'author',
  'copyright.owner',
  'homepage',
  'repository',
  'bugs',
  'engines',
  'scripts',
  'publishConfig',
  'files',
  'peerDependencies',
  'dependencies',
  'devDependencies',
  'config',
];

/**
 * Check all required fields of package.json for each package on the matching
 * with root package.json
 * @param {object} options - Options object
 * - dryRun: a flag to control if a dry run is intended
 */
async function updatePackageJsonFiles(options) {
  const {project, packages} = await loadLernaRepo();
  const rootPath = project.rootPath;
  const rootPkg = fs.readJsonSync(path.join(rootPath, 'package.json'));

  let changed = false;
  for (const p of packages) {
    debug('Checking package.json for %s@%s', p.name, p.version);
    const pkgFile = p.manifestLocation;
    let pkg = cloneJson(p.toJSON());

    if (isTypeScriptPackage(p) && !isMonorepoPackage(p)) {
      pkg.main = 'dist/index.js';
      pkg.types = 'dist/index.d.ts';
    }

    if (!pkg.private) {
      pkg.publishConfig = {
        access: 'public',
      };
    }

    pkg.author = rootPkg.author;
    pkg['copyright.owner'] = getCopyrightOwner(rootPkg);
    pkg.license = rootPkg.license;

    pkg.repository = {
      type: rootPkg.repository.type,
      url: rootPkg.repository.url,
      directory: path.relative(p.rootPath, p.location).replace(/\\/g, '/'),
    };

    if (!isMonorepoPackage(p)) {
      pkg.engines = Object.assign(pkg.engines, {node: rootPkg.engines.node});
    } else {
      pkg.engines = rootPkg.engines;
    }

    const unknownProperties = [];
    pkg = Object.fromEntries(
      Object.entries(pkg).sort(([a], [b]) => {
        const ai = orderedPkgProperties.indexOf(a);
        const bi = orderedPkgProperties.indexOf(b);
        // add the properties that are not in the list before peerDependencies
        if (ai === -1) {
          if (unknownProperties.indexOf(a) === -1) unknownProperties.push(a);
          return (
            orderedPkgProperties.indexOf('peerDependencies') -
            orderedPkgProperties.indexOf(b)
          );
        }
        if (bi === -1) {
          if (unknownProperties.indexOf(b) === -1) unknownProperties.push(b);
          return (
            orderedPkgProperties.indexOf(a) -
            orderedPkgProperties.indexOf('peerDependencies')
          );
        }
        return ai - orderedPkgProperties.indexOf(b);
      }),
    );

    if (unknownProperties.length) {
      console.group(`Properties are not recognized in ${p.name}:`);
      unknownProperties.forEach(key => console.log('-', key));
      console.groupEnd();
    }

    if (!isJsonEqual(pkg, p.toJSON())) {
      if (isDryRun(options)) {
        printJson(pkg);
      } else {
        changed = true;
        console.log('%s has been updated.', path.relative(p.rootPath, pkgFile));
        writeJsonSync(pkgFile, pkg);
      }
    }
  }
  if (changed) {
    console.log('All package.json files have been updated.');
  } else {
    console.log('All package.json files are up to date.');
  }
}

function getCopyrightOwner(pkg) {
  return pkg['copyright.owner'] || (pkg.copyright && pkg.copyright.owner);
}

export { updatePackageJsonFiles };

runMain(import.meta.url, updatePackageJsonFiles);
