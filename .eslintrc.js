// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: loopback-next
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

module.exports = {
  extends: [
    './packages/eslint-config/eslintrc.js',
    'plugin:prettier/recommended',
  ],
  plugins: ['prettier'],
  overrides: [
    {
      files: ['**/*.ts'],
      rules: {
        /*
         * The mocha plugin reports the following signature as a violation of
         * `mocha/handle-done-callback` (misinterpreting `this` as `done`).
         *
         * ```ts
         * before(async function setupApplication(this: Mocha.Context) {
         *   this.timeout(6000);
         *   // ...
         * }
         * ```
         */
        'mocha/handle-done-callback': 'off',
      },
    },
  ],
};
