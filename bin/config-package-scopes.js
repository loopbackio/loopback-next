// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/monorepo
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * This is a script to list workspace packages.
 */
'use strict';

const pkgJson = require('@npmcli/package-json');
const mapWorkspaces = require('@npmcli/map-workspaces');
const debugFactory = require('debug');
const {runMain} = require('./script-util');

const debug = debugFactory('loopback:monorepo');

module.exports = {
  rules: {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'scope-enum': async ctx => [2, 'always', await getPackageNames(ctx)],
  },
};

async function getPackageNames() {
  const {content: pkg} = await pkgJson.normalize(process.cwd());
  const workspaces = await mapWorkspaces({cwd: process.cwd(), pkg});
  const packages = Array.from(workspaces, entry => {
    return entry[0].startsWith('@') ? entry[0].split('/')[1] : entry[0];
  });
  debug('Scope names for the NPM Workspace: %s', packages);
  return packages;
}

runMain(module, getPackageNames);
