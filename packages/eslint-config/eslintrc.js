// Copyright IBM Corp. and LoopBack contributors 2019,2020. All Rights Reserved.
// Node module: @loopback/eslint-config
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const fs = require('fs');

/**
 * Default ESLint configuration for LoopBack
 *
 * See https://eslint.org/docs/user-guide/configuring
 */
module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
    mocha: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    /*
     * The `project` setting is required for `@typescript-eslint/await-thenable`
     * but it causes significant performance overhead (1m13s vs 13s)
     * See https://github.com/typescript-eslint/typescript-eslint/issues/389
     */
    project: getProjectFile(),
    ecmaFeatures: {
      ecmaVersion: 2017,
      jsx: false,
    },
    noWatch: true,
  },
  plugins: ['eslint-plugin', '@typescript-eslint', 'mocha'],
  rules: {
    'prefer-const': 'error',
    'no-mixed-operators': 'off',
    'no-console': 'off',
    // 'no-undef': 'off',
    'no-inner-declarations': 'off',
    // TypeScript allows method overloading
    'no-dupe-class-members': 'off',
    'no-useless-escape': 'off',
    // TypeScript allows the same name for namespace and function
    'no-redeclare': 'off',

    /**
     * Rules imported from eslint-config-loopback
     */
    'mocha/handle-done-callback': 'error',
    'mocha/no-exclusive-tests': 'error',
    'mocha/no-identical-title': 'error',
    'mocha/no-nested-tests': 'error',
    'no-array-constructor': 'error',

    /**
     * TypeScript specific rules
     * See https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin#supported-rules
     */
    '@typescript-eslint/array-type': 'off',
    '@typescript-eslint/indent': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-member-accessibility': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/no-object-literal-type-assertion': 'off',
    '@typescript-eslint/no-parameter-properties': 'off',
    '@typescript-eslint/no-angle-bracket-type-assertion': 'off',
    '@typescript-eslint/prefer-interface': 'off',
    '@typescript-eslint/no-namespace': 'off',
    '@typescript-eslint/ban-types': 'off',
    '@typescript-eslint/no-triple-slash-reference': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/no-non-null-asserted-optional-chain': 'error',

    // Disable warning  Missing return type on function for now
    '@typescript-eslint/explicit-module-boundary-types': 'off',

    /**
     * The following rules are enforced to support legacy tslint configuration
     */
    // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/ROADMAP.md
    // Rules mapped from `@loopback/tslint-config/tslint.common.json
    '@typescript-eslint/adjacent-overload-signatures': 'error', // tslint:adjacent-overload-signatures
    '@typescript-eslint/prefer-for-of': 'error', // tslint:prefer-for-of
    '@typescript-eslint/unified-signatures': 'error', // tslint:unified-signatures
    '@typescript-eslint/no-explicit-any': 'error', // tslint:no-any

    'no-unused-labels': 'error', // tslint:label-position
    'no-caller': 'error', // tslint:no-arg
    'no-new-wrappers': 'error', // tslint:no-construct
    // 'no-redeclare': 'error', // tslint:no-duplicate-variable

    'no-invalid-this': 'off',
    '@typescript-eslint/no-invalid-this': ['error'],
    '@typescript-eslint/no-misused-new': 'error',

    // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-shadow.md#how-to-use
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': 'error',

    'no-throw-literal': 'error', // tslint:no-string-throw

    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        vars: 'all',
        args: 'none', // none - do not check arguments
        ignoreRestSiblings: false,
      },
    ], // tslint:no-unused-variable
    'no-unused-expressions': 'error', // tslint:no-unused-expression
    'no-var': 'error', // tslint:no-var-keyword
    eqeqeq: ['error', 'smart'], // tslint:triple-equals: [true, 'allow-null-check', 'allow-undefined-check'],

    // Rules mapped from `@loopback/tslint-config/tslint.build.json
    '@typescript-eslint/await-thenable': 'error', // tslint:await-promise: [true, 'PromiseLike', 'RequestPromise'],
    '@typescript-eslint/no-floating-promises': 'error',

    'no-void': 'error', // tslint:no-void-expression: [true, 'ignore-arrow-function-shorthand'],

    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/consistent-type-assertions': 'off',
    '@typescript-eslint/no-misused-promises': 'error',

    '@typescript-eslint/prefer-optional-chain': 'error',
    '@typescript-eslint/prefer-nullish-coalescing': [
      'error',
      {allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing: true}, // See https://github.com/typescript-eslint/typescript-eslint/pull/6174
    ],
    '@typescript-eslint/no-extra-non-null-assertion': 'error',

    // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/return-await.md#how-to-use
    '@typescript-eslint/return-await': 'error',
    // note we must disable the base rule as it can report incorrect errors
    'no-return-await': 'off',

    // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/naming-convention.md
    camelcase: 'off',
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'default',
        format: ['camelCase'],
      },

      {
        selector: 'variable',
        format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
      },

      {
        selector: 'variable',
        format: null,
        filter: '^_$',
      },

      // For mixin functions
      {
        selector: 'function',
        format: ['PascalCase'],
        filter: 'Mixin$',
      },

      {
        selector: 'parameter',
        format: ['camelCase'],
        leadingUnderscore: 'allow',
      },

      // For enum members
      {
        selector: 'enumMember',
        format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
        leadingUnderscore: 'allow',
      },

      // For properties
      {
        selector: 'property',
        format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
        leadingUnderscore: 'allow',
      },

      {
        selector: 'method',
        format: ['camelCase'],
        leadingUnderscore: 'allow',
      },

      // For static members
      {
        selector: 'memberLike',
        modifiers: ['static'],
        format: ['camelCase', 'UPPER_CASE'],
      },

      // For private members
      {
        selector: 'memberLike',
        modifiers: ['private'],
        format: ['camelCase'],
        leadingUnderscore: 'allow',
      },

      // For protected members
      {
        selector: 'memberLike',
        modifiers: ['protected'],
        format: ['camelCase'],
        leadingUnderscore: 'allow',
      },

      {
        selector: 'typeLike',
        format: ['PascalCase'],
      },

      {
        selector: 'objectLiteralProperty',
        format: null,
        // filter: '^([2-5]{1}[0-9]{2})$|[-/ ]',
        modifiers: ['requiresQuotes'],
      },

      // For module imports
      // see: https://github.com/loopbackio/loopback-next/issues/10288
      {
        selector: 'import',
        format: ['camelCase', 'PascalCase'],
      },

      // For Lodash module imports
      {
        selector: 'import',
        format: null,
        filter: '^_$',
      },
    ],
  },
  overrides: [
    {
      files: ['**/*.js'],
      rules: {
        '@typescript-eslint/prefer-optional-chain': 'off',
        '@typescript-eslint/prefer-nullish-coalescing': 'off',
      },
    },
  ],
};

/**
 * Detect tsconfig file
 */
function getProjectFile() {
  if (fs.existsSync('./tsconfig.build.json')) return './tsconfig.build.json';
  if (fs.existsSync('./tsconfig.json')) return './tsconfig.json';
  return undefined;
}
