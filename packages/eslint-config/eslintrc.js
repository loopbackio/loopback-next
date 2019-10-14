// Copyright IBM Corp. 2019. All Rights Reserved.
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
  // Use the typescript-eslint parser
  parser: '@typescript-eslint/parser',
  // Enable eslint and typescript-eslint
  plugins: ['eslint-plugin', '@typescript-eslint', 'mocha'],
  env: {
    es6: true,
    node: true,
    mocha: true,
  },
  parserOptions: {
    sourceType: 'module',
    /*
     * The `project` setting is required for `@typescript-eslint/await-thenable`
     * but it causes significant performance overhead (1m13s vs 13s)
     * See https://github.com/typescript-eslint/typescript-eslint/issues/389
     */
    project: getProjectFile(),
    // See https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/parser#configuration
    createDefaultProgram: true,
    ecmaFeatures: {
      ecmaVersion: 2017,
      jsx: false,
    },
    noWatch: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    /**
     * Use `prettier` to override default formatting related rules
     * See https://github.com/prettier/eslint-config-prettier
     */
    'prettier',
    'prettier/@typescript-eslint',
  ],
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

    // Avoid promise rewrapping
    // https://exploringjs.com/es2016-es2017/ch_async-functions.html#_returned-promises-are-not-wrapped
    'no-return-await': 'error',

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

    'no-invalid-this': 'error',
    '@typescript-eslint/no-misused-new': 'error',
    'no-shadow': 'error', // tslint:no-shadowed-variable
    'no-throw-literal': 'error', // tslint:no-string-throw

    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        vars: 'all',
        args: 'none', // none - do not check arguments
        /*
         * The following is a workaround to the issue that parameter decorators
         * are treated as `unused-vars`.
         *
         * See https://github.com/typescript-eslint/typescript-eslint/issues/571
         *
         * @example
         * ```ts
         * import {inject} from '@loopback/context';
         * class MyController {
         *   constructor(@inject('foo') foo: string) {}
         * }
         * ```
         */
        varsIgnorePattern: 'inject|(\\w+)Bindings',
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
  },
};

/**
 * Detect tsconfig file
 */
function getProjectFile() {
  if (fs.existsSync('./tsconfig.build.json')) return './tsconfig.build.json';
  if (fs.existsSync('./tsconfig.json')) return './tsconfig.json';
  return undefined;
}
