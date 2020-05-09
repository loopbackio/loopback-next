// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: loopback-next
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

module.exports = {
  plugins: ['jsdoc'],
  extends: ['plugin:jsdoc/recommended', './packages/eslint-config/eslintrc.js'],
  rules: {
    /**
     * JSDoc specific rules
     * See https://www.npmjs.com/package/eslint-plugin-jsdoc#eslint-plugin-jsdoc-rules
     */
    'jsdoc/require-jsdoc': 0,
    'jsdoc/check-tag-names': [
      'error',
      {
        definedTags: [
          // API Extractor Tags
          'internal',
          'packageDocumentation',
          'remarks',
          'typeParam',
        ],
      },
    ],
  },
  settings: {
    jsdoc: {
      mode: 'typescript',
    },
  },
};
