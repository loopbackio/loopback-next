// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/monorepo
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * This is a script to list lerna packages for a monorepo.
 * See https://github.com/marionebl/commitlint/pull/406
 */
'use strict';

const debug = require('debug')('loopback:monorepo');
const {getPackages, runMain} = require('./script-util');

module.exports = {
  rules: {
    // https://github.com/marionebl/commitlint/blob/master/docs/reference-rules.md
    'scope-enum': async ctx => [2, 'always', await getPackageNames(ctx)],
  },
};

async function getPackageNames() {
  // List all lerna packages
  const packages = await getPackages();

  // Get a list of names. Npm scopes will be removed, for example,
  // @loopback/core -> core
  const names = packages.map(getShortName);
  debug('Scope names for the lerna monorepo: %s', names);
  return names;
}

/**
 * Get short name of a package. The NPM scope will be removed if it exists.
 * For example, the short name of `@loopback/core` is `core`.
 * @param {Package} pkg - Lerna project
 */
function getShortName(pkg) {
  const name = pkg.name;
  return name.startsWith('@') ? name.split('/')[1] : name;
}

runMain(module, getPackageNames);
