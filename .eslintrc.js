// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: loopback-next
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const {packages} = require('./lerna.json');
const projects = packages
  .filter(spec => spec !== 'docs')
  .map(spec => `${spec}/tsconfig.json`);

module.exports = {
  root: true,
  extends: ['./packages/eslint-config/eslintrc.js'],
  parserOptions: {
    project: [
      'tsconfig.eslint.json',
      ...projects,
      'packages/tsdocs/fixtures/monorepo/packages/*/tsconfig.json',
    ],
    tsconfigRootDir: __dirname,
  },
};
