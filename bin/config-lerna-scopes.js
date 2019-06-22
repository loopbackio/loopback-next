// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: loopback-next
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * This is an internal script to list lerna packages for loopback-next.
 * See https://github.com/marionebl/commitlint/pull/406
 */
'use strict';

const getPackages = require('@lerna/project').getPackages;
module.exports = {
  rules: {
    // https://github.com/marionebl/commitlint/blob/master/docs/reference-rules.md
    'scope-enum': async ctx => [2, 'always', await listPackages(ctx)],
  },
};

async function listPackages(context) {
  const ctx = context || {};
  const cwd = ctx.cwd || process.cwd();
  // List all lerna packages
  const packages = await getPackages(cwd);

  // Get a list of names. Npm scopes will be removed, for example,
  // @loopback/core -> core
  return packages
    .map(pkg => pkg.name)
    .map(name => (name.charAt(0) === '@' ? name.split('/')[1] : name));
}
