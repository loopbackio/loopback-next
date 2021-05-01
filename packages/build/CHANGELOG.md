# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [6.3.0](https://github.com/strongloop/loopback-next/compare/@loopback/build@6.2.9...@loopback/build@6.3.0) (2021-03-18)


### Features

* update package-lock.json to v2 consistently ([dfc3fbd](https://github.com/strongloop/loopback-next/commit/dfc3fbdae0c9ca9f34c64154a471bef22d5ac6b7))
* upgrade to TypeScript 4.2.x ([05930bc](https://github.com/strongloop/loopback-next/commit/05930bc0cece3909dd66f75ad91eeaa2d365a480))





## [6.2.9](https://github.com/strongloop/loopback-next/compare/@loopback/build@6.2.8...@loopback/build@6.2.9) (2021-01-21)

**Note:** Version bump only for package @loopback/build





## [6.2.8](https://github.com/strongloop/loopback-next/compare/@loopback/build@6.2.7...@loopback/build@6.2.8) (2020-12-07)

**Note:** Version bump only for package @loopback/build





## [6.2.7](https://github.com/strongloop/loopback-next/compare/@loopback/build@6.2.6...@loopback/build@6.2.7) (2020-11-18)

**Note:** Version bump only for package @loopback/build





## [6.2.6](https://github.com/strongloop/loopback-next/compare/@loopback/build@6.2.5...@loopback/build@6.2.6) (2020-11-05)

**Note:** Version bump only for package @loopback/build





## [6.2.5](https://github.com/strongloop/loopback-next/compare/@loopback/build@6.2.4...@loopback/build@6.2.5) (2020-10-07)

**Note:** Version bump only for package @loopback/build





## [6.2.4](https://github.com/strongloop/loopback-next/compare/@loopback/build@6.2.3...@loopback/build@6.2.4) (2020-09-17)

**Note:** Version bump only for package @loopback/build





## [6.2.3](https://github.com/strongloop/loopback-next/compare/@loopback/build@6.2.2...@loopback/build@6.2.3) (2020-09-15)

**Note:** Version bump only for package @loopback/build





## [6.2.2](https://github.com/strongloop/loopback-next/compare/@loopback/build@6.2.1...@loopback/build@6.2.2) (2020-08-27)

**Note:** Version bump only for package @loopback/build





## [6.2.1](https://github.com/strongloop/loopback-next/compare/@loopback/build@6.2.0...@loopback/build@6.2.1) (2020-08-19)

**Note:** Version bump only for package @loopback/build





# [6.2.0](https://github.com/strongloop/loopback-next/compare/@loopback/build@6.1.1...@loopback/build@6.2.0) (2020-08-05)


### Bug Fixes

* **docs:** fix minor typo ([9b06ccc](https://github.com/strongloop/loopback-next/commit/9b06ccc7659799ba8fdbc26ebddc34715dc6a8d3))


### Features

* rework fail-on-console-logs to support parallel test execution ([ba580de](https://github.com/strongloop/loopback-next/commit/ba580de07ef6e9cd7448e6fc7f59201836228621))





## [6.1.1](https://github.com/strongloop/loopback-next/compare/@loopback/build@6.1.0...@loopback/build@6.1.1) (2020-07-20)

**Note:** Version bump only for package @loopback/build





# [6.1.0](https://github.com/strongloop/loopback-next/compare/@loopback/build@6.0.0...@loopback/build@6.1.0) (2020-06-30)


### Features

* **build:** add a helper to merge mocha config objects ([3ce9eef](https://github.com/strongloop/loopback-next/commit/3ce9eefdb3a286f2d2b2690ec471f00d8124efb9))





# [6.0.0](https://github.com/strongloop/loopback-next/compare/@loopback/build@5.4.3...@loopback/build@6.0.0) (2020-06-23)


### Bug Fixes

* set node version to >=10.16 to support events.once ([e39da1c](https://github.com/strongloop/loopback-next/commit/e39da1ca47728eafaf83c10ce35b09b03b6a4edc))


### Features

* **build:** upgrade to mocha 8.x ([c83270d](https://github.com/strongloop/loopback-next/commit/c83270dbdbe42e1e17fabc7b81c345df45e869d8))


### BREAKING CHANGES

* **build:** After have upgraded to `mocha` version 8, which no longer
supports `--opts` and `test/mocha.opts`. It may break your application
if it depends on earlier version of `@loopback/build` for `npm test`.

See a list of breaking changes of mocha 8.x at:
https://github.com/mochajs/mocha/releases/tag/v8.0.0





## [5.4.3](https://github.com/strongloop/loopback-next/compare/@loopback/build@5.4.2...@loopback/build@5.4.3) (2020-06-11)

**Note:** Version bump only for package @loopback/build





## [5.4.2](https://github.com/strongloop/loopback-next/compare/@loopback/build@5.4.1...@loopback/build@5.4.2) (2020-05-28)

**Note:** Version bump only for package @loopback/build





## [5.4.1](https://github.com/strongloop/loopback-next/compare/@loopback/build@5.4.0...@loopback/build@5.4.1) (2020-05-20)

**Note:** Version bump only for package @loopback/build





# [5.4.0](https://github.com/strongloop/loopback-next/compare/@loopback/build@5.3.1...@loopback/build@5.4.0) (2020-05-19)


### Bug Fixes

* **build:** recognize `lb-tsc` bool options with a value ([015df04](https://github.com/strongloop/loopback-next/commit/015df04cf2df3455b5eb8582e6097406ee00e58a))


### Features

* upgrade to TypeScript 3.9.x ([3300e45](https://github.com/strongloop/loopback-next/commit/3300e4569ab8410bb1285f7a54d326e9d976476d))





## [5.3.1](https://github.com/strongloop/loopback-next/compare/@loopback/build@5.3.0...@loopback/build@5.3.1) (2020-05-07)

**Note:** Version bump only for package @loopback/build





# [5.3.0](https://github.com/strongloop/loopback-next/compare/@loopback/build@5.2.0...@loopback/build@5.3.0) (2020-04-29)


### Features

* **build:** don't flag console logs when tests failed ([048e87e](https://github.com/strongloop/loopback-next/commit/048e87ec6bc705f73418adfed425b4db03c38aa8))





# [5.2.0](https://github.com/strongloop/loopback-next/compare/@loopback/build@5.1.0...@loopback/build@5.2.0) (2020-04-23)


### Features

* **build:** change the default compilation target to ES2018 (Node.js 10.x) ([a9df717](https://github.com/strongloop/loopback-next/commit/a9df717a86871c5dd220fa842dda31bd08b00cae))
* **build:** enable all ES2020 features in TypeScript `lib` config ([be6f31d](https://github.com/strongloop/loopback-next/commit/be6f31d10bb4b0ede27805c4ed08f752a675efd1))





# [5.1.0](https://github.com/strongloop/loopback-next/compare/@loopback/build@5.0.1...@loopback/build@5.1.0) (2020-04-22)


### Features

* **build:** update lb-tsc to support `-b` or `--build` ([d39b8d9](https://github.com/strongloop/loopback-next/commit/d39b8d9abdc3092ad99fc2885e7068816be27668))





## [5.0.1](https://github.com/strongloop/loopback-next/compare/@loopback/build@5.0.0...@loopback/build@5.0.1) (2020-04-08)

**Note:** Version bump only for package @loopback/build





# [5.0.0](https://github.com/strongloop/loopback-next/compare/@loopback/build@4.0.1...@loopback/build@5.0.0) (2020-03-24)


### Features

* update dependency prettier to v2 ([65bdee7](https://github.com/strongloop/loopback-next/commit/65bdee7b22ade4c7ba32499ce3939fa84b9c7c42))


### BREAKING CHANGES

* prettier@2.0.0 introduces breaking changes for certain rules.
See https://prettier.io/blog/2020/03/21/2.0.0.html for more details.

To reformat code using prettier, run `npm run prettier:fix`.





## [4.0.1](https://github.com/strongloop/loopback-next/compare/@loopback/build@4.0.0...@loopback/build@4.0.1) (2020-03-17)

**Note:** Version bump only for package @loopback/build





# [4.0.0](https://github.com/strongloop/loopback-next/compare/@loopback/build@3.1.1...@loopback/build@4.0.0) (2020-03-05)


### chore

* remove support for Node.js v8.x ([4281d9d](https://github.com/strongloop/loopback-next/commit/4281d9df50f0715d32879e1442a90b643ec8f542))


### Features

* **build:** add --lang flag to set LANG env var for lb-mocha ([a78bb84](https://github.com/strongloop/loopback-next/commit/a78bb846c43ed34f3fd9d8562ade037a1d29c2b9))
* **build:** enable importHelpers ([e44f084](https://github.com/strongloop/loopback-next/commit/e44f084b6c8df762c0563b3716f13135f652b082)), closes [#4676](https://github.com/strongloop/loopback-next/issues/4676)
* add `tslib` as dependency ([a6e0b4c](https://github.com/strongloop/loopback-next/commit/a6e0b4ce7b862764167cefedee14c1115b25e0a4)), closes [#4676](https://github.com/strongloop/loopback-next/issues/4676)


### BREAKING CHANGES

* **build:** enable importHelpers on the shared Typescript
configuration file which requires `tslib` to be installed on dependent
packages if the shared Typescript configuration is used.

To migrate, run `npm install tslib` on the dependent package before
updating to this version.
* Node.js v8.x is now end of life. Please upgrade to version
10 and above. See https://nodejs.org/en/about/releases.





## [3.1.1](https://github.com/strongloop/loopback-next/compare/@loopback/build@3.1.0...@loopback/build@3.1.1) (2020-02-05)

**Note:** Version bump only for package @loopback/build





# [3.1.0](https://github.com/strongloop/loopback-next/compare/@loopback/build@3.0.1...@loopback/build@3.1.0) (2020-01-27)


### Bug Fixes

* remove updated debug config for PR ([15e8d34](https://github.com/strongloop/loopback-next/commit/15e8d34ad628ecb5b8fafe02441c73362a873e8c))
* typos ([852f198](https://github.com/strongloop/loopback-next/commit/852f198ae7cb2c7d8801d7222cc574d04757404c))


### Features

* adds MultiMethodDecoratorFactory ([bf6c787](https://github.com/strongloop/loopback-next/commit/bf6c7872bb8ce492b43ab8f57a641dcbb341e96e))





## [3.0.1](https://github.com/strongloop/loopback-next/compare/@loopback/build@3.0.0...@loopback/build@3.0.1) (2020-01-07)

**Note:** Version bump only for package @loopback/build





# [3.0.0](https://github.com/strongloop/loopback-next/compare/@loopback/build@2.1.0...@loopback/build@3.0.0) (2019-12-09)


### Features

* **build:** enable esModuleInterop compiler option ([3090073](https://github.com/strongloop/loopback-next/commit/309007346b72fec3ee127db5032d5cb3aa191c5d))


### BREAKING CHANGES

* **build:** The flag impacts how `import` is handled by the TypeScript
compiler. The new behavior is:

- A namespace import (i.e. import * as foo from "foo") is now correctly flagged as uncallable. Calling it will result in an error.
- Default imports to CommonJS/AMD/UMD are now allowed (e.g. import fs from "fs"), and should work as expected.

For existing projects, namespace imports (import * as express from "express"; express();) will need to be converted to default imports (import express from "express"; express();).

See https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-7.html#support-for-import-d-from-cjs-from-commonjs-modules-with---esmoduleinterop





# [2.1.0](https://github.com/strongloop/loopback-next/compare/@loopback/build@2.0.16...@loopback/build@2.1.0) (2019-11-25)


### Features

* **build:** add an option to control resolution of CLI module from project dependencies ([0715a91](https://github.com/strongloop/loopback-next/commit/0715a91d0eef02c7e259cbd1b62a09010995c796))





## [2.0.16](https://github.com/strongloop/loopback-next/compare/@loopback/build@2.0.15...@loopback/build@2.0.16) (2019-11-12)

**Note:** Version bump only for package @loopback/build





## [2.0.15](https://github.com/strongloop/loopback-next/compare/@loopback/build@2.0.14...@loopback/build@2.0.15) (2019-10-24)

**Note:** Version bump only for package @loopback/build





## [2.0.14](https://github.com/strongloop/loopback-next/compare/@loopback/build@2.0.13...@loopback/build@2.0.14) (2019-10-07)

**Note:** Version bump only for package @loopback/build





## [2.0.13](https://github.com/strongloop/loopback-next/compare/@loopback/build@2.0.12...@loopback/build@2.0.13) (2019-09-28)

**Note:** Version bump only for package @loopback/build





## [2.0.12](https://github.com/strongloop/loopback-next/compare/@loopback/build@2.0.11...@loopback/build@2.0.12) (2019-09-27)

**Note:** Version bump only for package @loopback/build





## [2.0.11](https://github.com/strongloop/loopback-next/compare/@loopback/build@2.0.10...@loopback/build@2.0.11) (2019-09-17)

**Note:** Version bump only for package @loopback/build





## [2.0.10](https://github.com/strongloop/loopback-next/compare/@loopback/build@2.0.9...@loopback/build@2.0.10) (2019-09-06)

**Note:** Version bump only for package @loopback/build





## [2.0.9](https://github.com/strongloop/loopback-next/compare/@loopback/build@2.0.8...@loopback/build@2.0.9) (2019-09-03)

**Note:** Version bump only for package @loopback/build





## [2.0.8](https://github.com/strongloop/loopback-next/compare/@loopback/build@2.0.7...@loopback/build@2.0.8) (2019-08-19)

**Note:** Version bump only for package @loopback/build





## [2.0.7](https://github.com/strongloop/loopback-next/compare/@loopback/build@2.0.6...@loopback/build@2.0.7) (2019-08-15)

**Note:** Version bump only for package @loopback/build





## [2.0.6](https://github.com/strongloop/loopback-next/compare/@loopback/build@2.0.5...@loopback/build@2.0.6) (2019-07-31)

**Note:** Version bump only for package @loopback/build





## [2.0.5](https://github.com/strongloop/loopback-next/compare/@loopback/build@2.0.4...@loopback/build@2.0.5) (2019-07-26)

**Note:** Version bump only for package @loopback/build





## [2.0.4](https://github.com/strongloop/loopback-next/compare/@loopback/build@2.0.3...@loopback/build@2.0.4) (2019-07-17)

**Note:** Version bump only for package @loopback/build





## [2.0.3](https://github.com/strongloop/loopback-next/compare/@loopback/build@2.0.2...@loopback/build@2.0.3) (2019-06-28)

**Note:** Version bump only for package @loopback/build





## [2.0.2](https://github.com/strongloop/loopback-next/compare/@loopback/build@2.0.1...@loopback/build@2.0.2) (2019-06-21)

**Note:** Version bump only for package @loopback/build





## [2.0.1](https://github.com/strongloop/loopback-next/compare/@loopback/build@2.0.0...@loopback/build@2.0.1) (2019-06-20)

**Note:** Version bump only for package @loopback/build





# [2.0.0](https://github.com/strongloop/loopback-next/compare/@loopback/build@1.7.1...@loopback/build@2.0.0) (2019-06-17)


### Bug Fixes

* **build:** remove `lb-tslint` from README ([be89eb6](https://github.com/strongloop/loopback-next/commit/be89eb6))


### Features

* **build:** add support for dryRun to `--copy-resources` ([f8f078f](https://github.com/strongloop/loopback-next/commit/f8f078f))
* **build:** enable incremental compilation ([2120712](https://github.com/strongloop/loopback-next/commit/2120712))
* **build:** read outDir from tsconfig when copying resources ([4f947a3](https://github.com/strongloop/loopback-next/commit/4f947a3))
* **build:** remove lb-tslint ([e9e4bba](https://github.com/strongloop/loopback-next/commit/e9e4bba))
* **build:** remove strong-docs based `lb-apidocs` helper ([871457e](https://github.com/strongloop/loopback-next/commit/871457e))
* **build:** remove support for multi-dist compilation ([f6fcfe7](https://github.com/strongloop/loopback-next/commit/f6fcfe7))


### BREAKING CHANGES

* **build:** We are no longer choosing outDir for you, you have to
specify it explicitly. It is no longer possible to specify compilation target
via non-option argument like `lb-tsc es2017`.

    Migration guide:

    - Modify your `tsconfig.json` file and configure `dist` via `compilerOptions.outDir`

    - If you are using target different from `es2017`, then configure it via
  `compilerOptions.target`.

    - Remove `es2017` and `--outDir dist` from lb-tsc arguments.

    - Ensure that the output directory is listed in `lb-clean` arguments,
      e.g. call `lb-clean dist`.

    - When calling `lb-mocha`, replace `DIST` with the actual outDir value,
      typically `dist`.

* **build:** `lb-apidocs` helper is no longer available. Please switch
to Microsoft api-extractor and api-documenter.
* **build:** `lb-tslint` helper is no longer available. Please
install `tslint` directly as a dependency and invoke `tslint` instead
of `lb-tslint`.

    Alternatively, you can migrate from tslint to eslint and use the
    recently introduced helper `lb-eslint`.

## [1.7.1](https://github.com/strongloop/loopback-next/compare/@loopback/build@1.7.0...@loopback/build@1.7.1) (2019-06-06)

**Note:** Version bump only for package @loopback/build





# [1.7.0](https://github.com/strongloop/loopback-next/compare/@loopback/build@1.6.1...@loopback/build@1.7.0) (2019-06-03)


### Features

* replace tslint with eslint ([44185a7](https://github.com/strongloop/loopback-next/commit/44185a7))





## [1.6.1](https://github.com/strongloop/loopback-next/compare/@loopback/build@1.6.0...@loopback/build@1.6.1) (2019-05-31)

**Note:** Version bump only for package @loopback/build





# [1.6.0](https://github.com/strongloop/loopback-next/compare/@loopback/build@1.5.5...@loopback/build@1.6.0) (2019-05-30)


### Features

* **build:** add eslint scripts and default configs ([a6abe86](https://github.com/strongloop/loopback-next/commit/a6abe86))
* **tsdocs:** add integration with api-extractor/documenter ([c8d9572](https://github.com/strongloop/loopback-next/commit/c8d9572))





## [1.5.5](https://github.com/strongloop/loopback-next/compare/@loopback/build@1.5.4...@loopback/build@1.5.5) (2019-05-23)

**Note:** Version bump only for package @loopback/build





## [1.5.4](https://github.com/strongloop/loopback-next/compare/@loopback/build@1.5.3...@loopback/build@1.5.4) (2019-05-14)

**Note:** Version bump only for package @loopback/build





## [1.5.3](https://github.com/strongloop/loopback-next/compare/@loopback/build@1.5.2...@loopback/build@1.5.3) (2019-05-10)


### Bug Fixes

* **build:** honor tsconfig compilerOptions.rootDir to copy resources ([8a8857d](https://github.com/strongloop/loopback-next/commit/8a8857d))





## [1.5.2](https://github.com/strongloop/loopback-next/compare/@loopback/build@1.5.1...@loopback/build@1.5.2) (2019-05-09)

**Note:** Version bump only for package @loopback/build





## [1.5.1](https://github.com/strongloop/loopback-next/compare/@loopback/build@1.5.0...@loopback/build@1.5.1) (2019-05-06)

**Note:** Version bump only for package @loopback/build





# [1.5.0](https://github.com/strongloop/loopback-next/compare/@loopback/build@1.4.3...@loopback/build@1.5.0) (2019-04-20)


### Features

* **build:** add more TypeScript "strict" checks ([866aa2f](https://github.com/strongloop/loopback-next/commit/866aa2f))





## [1.4.3](https://github.com/strongloop/loopback-next/compare/@loopback/build@1.4.2...@loopback/build@1.4.3) (2019-04-11)

**Note:** Version bump only for package @loopback/build





## [1.4.2](https://github.com/strongloop/loopback-next/compare/@loopback/build@1.4.1...@loopback/build@1.4.2) (2019-04-09)

**Note:** Version bump only for package @loopback/build





## [1.4.1](https://github.com/strongloop/loopback-next/compare/@loopback/build@1.4.0...@loopback/build@1.4.1) (2019-04-05)

**Note:** Version bump only for package @loopback/build





# [1.4.0](https://github.com/strongloop/loopback-next/compare/@loopback/build@1.3.2...@loopback/build@1.4.0) (2019-03-22)


### Bug Fixes

* **build:** remove "dom" from the list of global libraries ([781cd1d](https://github.com/strongloop/loopback-next/commit/781cd1d))


### Features

* **build:** enable TSC option "skipLibCheck" ([66bb506](https://github.com/strongloop/loopback-next/commit/66bb506))





## [1.3.2](https://github.com/strongloop/loopback-next/compare/@loopback/build@1.3.1...@loopback/build@1.3.2) (2019-03-12)

**Note:** Version bump only for package @loopback/build





## [1.3.1](https://github.com/strongloop/loopback-next/compare/@loopback/build@1.3.0...@loopback/build@1.3.1) (2019-02-25)


### Bug Fixes

* update version of nyc ([f8db27c](https://github.com/strongloop/loopback-next/commit/f8db27c))





# [1.3.0](https://github.com/strongloop/loopback-next/compare/@loopback/build@1.2.1...@loopback/build@1.3.0) (2019-02-08)


### Features

* **build:** use `dist/__tests__` in code examples and tests ([a3da024](https://github.com/strongloop/loopback-next/commit/a3da024))





## [1.2.1](https://github.com/strongloop/loopback-next/compare/@loopback/build@1.2.0...@loopback/build@1.2.1) (2019-01-28)

**Note:** Version bump only for package @loopback/build





# [1.2.0](https://github.com/strongloop/loopback-next/compare/@loopback/build@1.1.0...@loopback/build@1.2.0) (2019-01-14)


### Bug Fixes

* **build:** fix path lookup in build helpers ([16311c5](https://github.com/strongloop/loopback-next/commit/16311c5))


### Features

* always include tslint and typescript in project dev-dependencies ([e0df285](https://github.com/strongloop/loopback-next/commit/e0df285))





# [1.1.0](https://github.com/strongloop/loopback-next/compare/@loopback/build@1.0.2...@loopback/build@1.1.0) (2018-12-20)


### Features

* move tslint config into a standalone package ([26f3543](https://github.com/strongloop/loopback-next/commit/26f3543))





## [1.0.2](https://github.com/strongloop/loopback-next/compare/@loopback/build@1.0.1...@loopback/build@1.0.2) (2018-12-13)

**Note:** Version bump only for package @loopback/build





<a name="1.0.1"></a>
## [1.0.1](https://github.com/strongloop/loopback-next/compare/@loopback/build@1.0.0...@loopback/build@1.0.1) (2018-11-08)


### Bug Fixes

* **cli:** exclude json files from tslint ([bd9f864](https://github.com/strongloop/loopback-next/commit/bd9f864))





<a name="0.8.0"></a>
# [0.8.0](https://github.com/strongloop/loopback-next/compare/@loopback/build@0.7.6...@loopback/build@0.8.0) (2018-10-08)


### Features

* use resolveJsonModule to load datasource config ([73e19ff](https://github.com/strongloop/loopback-next/commit/73e19ff))
* **build:** rename --ignore-resources to --copy-resources ([2958ace](https://github.com/strongloop/loopback-next/commit/2958ace))





<a name="0.7.6"></a>
## [0.7.6](https://github.com/strongloop/loopback-next/compare/@loopback/build@0.7.5...@loopback/build@0.7.6) (2018-10-05)


### Bug Fixes

* **build:** preserve `--outDir` path as relative to CWD ([0e72ab9](https://github.com/strongloop/loopback-next/commit/0e72ab9))





<a name="0.7.5"></a>
## [0.7.5](https://github.com/strongloop/loopback-next/compare/@loopback/build@0.7.4...@loopback/build@0.7.5) (2018-10-03)

**Note:** Version bump only for package @loopback/build





<a name="0.7.4"></a>
## [0.7.4](https://github.com/strongloop/loopback-next/compare/@loopback/build@0.7.3...@loopback/build@0.7.4) (2018-09-27)

**Note:** Version bump only for package @loopback/build





<a name="0.7.3"></a>
## [0.7.3](https://github.com/strongloop/loopback-next/compare/@loopback/build@0.7.2...@loopback/build@0.7.3) (2018-09-12)

**Note:** Version bump only for package @loopback/build





<a name="0.7.2"></a>
## [0.7.2](https://github.com/strongloop/loopback-next/compare/@loopback/build@0.7.1...@loopback/build@0.7.2) (2018-09-08)

**Note:** Version bump only for package @loopback/build





<a name="0.7.1"></a>
## [0.7.1](https://github.com/strongloop/loopback-next/compare/@loopback/build@0.7.0...@loopback/build@0.7.1) (2018-08-24)

**Note:** Version bump only for package @loopback/build





<a name="0.7.0"></a>
# [0.7.0](https://github.com/strongloop/loopback-next/compare/@loopback/build@0.6.14...@loopback/build@0.7.0) (2018-08-15)


### Features

* **repository:** add KVRepository impl using legacy juggler ([97a75dc](https://github.com/strongloop/loopback-next/commit/97a75dc))




<a name="0.6.14"></a>
## [0.6.14](https://github.com/strongloop/loopback-next/compare/@loopback/build@0.6.13...@loopback/build@0.6.14) (2018-08-08)




**Note:** Version bump only for package @loopback/build

<a name="0.6.13"></a>
## [0.6.13](https://github.com/strongloop/loopback-next/compare/@loopback/build@0.6.12...@loopback/build@0.6.13) (2018-07-21)




**Note:** Version bump only for package @loopback/build

<a name="0.6.12"></a>
## [0.6.12](https://github.com/strongloop/loopback-next/compare/@loopback/build@0.6.11...@loopback/build@0.6.12) (2018-07-20)




**Note:** Version bump only for package @loopback/build

<a name="0.6.11"></a>
## [0.6.11](https://github.com/strongloop/loopback-next/compare/@loopback/build@0.6.10...@loopback/build@0.6.11) (2018-06-28)




**Note:** Version bump only for package @loopback/build

<a name="0.6.10"></a>
## [0.6.10](https://github.com/strongloop/loopback-next/compare/@loopback/build@0.6.9...@loopback/build@0.6.10) (2018-06-27)


### Bug Fixes

* **docs:** upgrade to strong-docs@3.1.0 and fix links ([f91af8f](https://github.com/strongloop/loopback-next/commit/f91af8f))




<a name="0.6.9"></a>
## [0.6.9](https://github.com/strongloop/loopback-next/compare/@loopback/build@0.6.8...@loopback/build@0.6.9) (2018-06-20)




**Note:** Version bump only for package @loopback/build

<a name="0.6.8"></a>
## [0.6.8](https://github.com/strongloop/loopback-next/compare/@loopback/build@0.6.6...@loopback/build@0.6.8) (2018-06-09)




**Note:** Version bump only for package @loopback/build

<a name="0.6.7"></a>
## [0.6.7](https://github.com/strongloop/loopback-next/compare/@loopback/build@0.6.6...@loopback/build@0.6.7) (2018-06-09)




**Note:** Version bump only for package @loopback/build

<a name="0.6.6"></a>
## [0.6.6](https://github.com/strongloop/loopback-next/compare/@loopback/build@0.6.5...@loopback/build@0.6.6) (2018-06-08)


### Bug Fixes

* make the code compatible with TypeScript 2.9.x ([37aba50](https://github.com/strongloop/loopback-next/commit/37aba50))




<a name="0.6.5"></a>
## [0.6.5](https://github.com/strongloop/loopback-next/compare/@loopback/build@0.6.4...@loopback/build@0.6.5) (2018-05-20)




**Note:** Version bump only for package @loopback/build

<a name="0.6.4"></a>
## [0.6.4](https://github.com/strongloop/loopback-next/compare/@loopback/build@0.6.3...@loopback/build@0.6.4) (2018-05-14)




**Note:** Version bump only for package @loopback/build

<a name="0.6.3"></a>
## [0.6.3](https://github.com/strongloop/loopback-next/compare/@loopback/build@0.6.2...@loopback/build@0.6.3) (2018-05-08)




**Note:** Version bump only for package @loopback/build

<a name="0.6.2"></a>
## [0.6.2](https://github.com/strongloop/loopback-next/compare/@loopback/build@0.6.0...@loopback/build@0.6.2) (2018-05-03)




**Note:** Version bump only for package @loopback/build

<a name="0.6.1"></a>
## [0.6.1](https://github.com/strongloop/loopback-next/compare/@loopback/build@0.6.0...@loopback/build@0.6.1) (2018-05-03)




**Note:** Version bump only for package @loopback/build

<a name="0.6.0"></a>
# [0.6.0](https://github.com/strongloop/loopback-next/compare/@loopback/build@0.5.0...@loopback/build@0.6.0) (2018-04-25)


### Features

* **build:** add an option to copy non ts files to outDir ([49b9a82](https://github.com/strongloop/loopback-next/commit/49b9a82))




<a name="0.5.0"></a>
# [0.5.0](https://github.com/strongloop/loopback-next/compare/@loopback/build@0.4.3...@loopback/build@0.5.0) (2018-04-16)




**Note:** Version bump only for package @loopback/build

<a name="0.4.3"></a>
## [0.4.3](https://github.com/strongloop/loopback-next/compare/@loopback/build@0.4.1...@loopback/build@0.4.3) (2018-04-11)


### Bug Fixes

* change file names to fit advocated naming convention ([0331df8](https://github.com/strongloop/loopback-next/commit/0331df8))
* **build:** update build scripts ([2a3f560](https://github.com/strongloop/loopback-next/commit/2a3f560))




<a name="0.4.2"></a>
## [0.4.2](https://github.com/strongloop/loopback-next/compare/@loopback/build@0.4.1...@loopback/build@0.4.2) (2018-04-06)




**Note:** Version bump only for package @loopback/build

<a name="0.4.1"></a>
## [0.4.1](https://github.com/strongloop/loopback-next/compare/@loopback/build@0.4.0...@loopback/build@0.4.1) (2018-04-02)




**Note:** Version bump only for package @loopback/build

<a name="0.4.0"></a>
# [0.4.0](https://github.com/strongloop/loopback-next/compare/@loopback/build@0.3.3...@loopback/build@0.4.0) (2018-03-29)




**Note:** Version bump only for package @loopback/build

<a name="0.3.3"></a>
## [0.3.3](https://github.com/strongloop/loopback-next/compare/@loopback/build@0.3.2...@loopback/build@0.3.3) (2018-03-23)


### Bug Fixes

* **build:** fix select-dist script ([e91e810](https://github.com/strongloop/loopback-next/commit/e91e810))
* use rimraf to remove files with glob patterns ([50d847c](https://github.com/strongloop/loopback-next/commit/50d847c))
* **build:** use variable names to reflect the accepted args ([c9350b9](https://github.com/strongloop/loopback-next/commit/c9350b9))




<a name="0.3.2"></a>
## [0.3.2](https://github.com/strongloop/loopback-next/compare/@loopback/build@0.3.1...@loopback/build@0.3.2) (2018-03-14)




**Note:** Version bump only for package @loopback/build

<a name="0.3.1"></a>
## [0.3.1](https://github.com/strongloop/loopback-next/compare/@loopback/build@0.3.0...@loopback/build@0.3.1) (2018-03-13)


### Bug Fixes

* **build:** use options for `run` and disable stdout for tests ([0065eab](https://github.com/strongloop/loopback-next/commit/0065eab))




<a name="0.3.0"></a>
# [0.3.0](https://github.com/strongloop/loopback-next/compare/@loopback/build@0.2.0...@loopback/build@0.3.0) (2018-03-08)


### Bug Fixes

* clean up the app run test ([c0d3731](https://github.com/strongloop/loopback-next/commit/c0d3731))


### Features

* **build:** use options to control cli/shell run ([c4e8bce](https://github.com/strongloop/loopback-next/commit/c4e8bce))




<a name="0.2.0"></a>
# [0.2.0](https://github.com/strongloop/loopback-next/compare/@loopback/build@0.1.2...@loopback/build@0.2.0) (2018-03-01)




**Note:** Version bump only for package @loopback/build

<a name="0.1.2"></a>
## [0.1.2](https://github.com/strongloop/loopback-next/compare/@loopback/build@0.1.1...@loopback/build@0.1.2) (2018-03-01)


### Features

* **context:** add type as a generic parameter to `ctx.get()` and friends ([24b217d](https://github.com/strongloop/loopback-next/commit/24b217d))


### BREAKING CHANGES

* **context:** `ctx.get()` and `ctx.getSync()` require a type now.
See the example below for upgrade instructions:

```diff
- const c: MyController = await ctx.get('MyController');
+ const c = await ctx.get<MyController>('MyController');
```

`isPromise` was renamed to `isPromiseLike` and acts as a type guard
for `PromiseLike`, not `Promise`.  When upgrading affected code, you
need to determine whether the code was accepting any Promise
implementation (i.e. `PromiseLike`) or only native Promises. In the
former case, you should use `isPromiseLike` and potentially convert the
userland Promise instance to a native Promise via
`Promise.resolve(promiseLike)`. In the latter case, you can replace
`isPromise(p)` with `p instanceof Promise`.




<a name="0.1.1"></a>
## [0.1.1](https://github.com/strongloop/loopback-next/compare/@loopback/build@0.1.0...@loopback/build@0.1.1) (2018-02-23)




**Note:** Version bump only for package @loopback/build

<a name="0.1.0"></a>
# [0.1.0](https://github.com/strongloop/loopback-next/compare/@loopback/build@4.0.0-alpha.13...@loopback/build@0.1.0) (2018-02-21)




**Note:** Version bump only for package @loopback/build

<a name="4.0.0-alpha.13"></a>
# [4.0.0-alpha.13](https://github.com/strongloop/loopback-next/compare/@loopback/build@4.0.0-alpha.12...@loopback/build@4.0.0-alpha.13) (2018-02-04)




**Note:** Version bump only for package @loopback/build

<a name="4.0.0-alpha.12"></a>
# [4.0.0-alpha.12](https://github.com/strongloop/loopback-next/compare/@loopback/build@4.0.0-alpha.11...@loopback/build@4.0.0-alpha.12) (2018-01-30)


### Bug Fixes

* **build:** upgrade to strong-docs@1.7.1 ([fd02e1b](https://github.com/strongloop/loopback-next/commit/fd02e1b))




<a name="4.0.0-alpha.11"></a>
# [4.0.0-alpha.11](https://github.com/strongloop/loopback-next/compare/@loopback/build@4.0.0-alpha.10...@loopback/build@4.0.0-alpha.11) (2018-01-29)


### Bug Fixes

* remove typedoc/node_modules/.bin from local typescript dep ([877d6a5](https://github.com/strongloop/loopback-next/commit/877d6a5))




<a name="4.0.0-alpha.10"></a>
# [4.0.0-alpha.10](https://github.com/strongloop/loopback-next/compare/@loopback/build@4.0.0-alpha.9...@loopback/build@4.0.0-alpha.10) (2018-01-26)


### Bug Fixes

* apply source-maps to test errors ([76a7f56](https://github.com/strongloop/loopback-next/commit/76a7f56)), closes [#602](https://github.com/strongloop/loopback-next/issues/602)
* make mocha self-contained with the source map support ([7c6d869](https://github.com/strongloop/loopback-next/commit/7c6d869))




<a name="4.0.0-alpha.9"></a>
# [4.0.0-alpha.9](https://github.com/strongloop/loopback-next/compare/@loopback/build@4.0.0-alpha.8...@loopback/build@4.0.0-alpha.9) (2018-01-19)


### Bug Fixes

* **build:** move no-unused-variables to tslint.build.json ([15dd2db](https://github.com/strongloop/loopback-next/commit/15dd2db))




<a name="4.0.0-alpha.8"></a>
# [4.0.0-alpha.8](https://github.com/strongloop/loopback-next/compare/@loopback/build@4.0.0-alpha.7...@loopback/build@4.0.0-alpha.8) (2018-01-11)


### Bug Fixes

* fix build break and upgrade dependencies ([917da5d](https://github.com/strongloop/loopback-next/commit/917da5d))
* update git repo url ([444f06b](https://github.com/strongloop/loopback-next/commit/444f06b))




<a name="4.0.0-alpha.7"></a>
# [4.0.0-alpha.7](https://github.com/strongloop/loopback4-build/compare/@loopback/build@4.0.0-alpha.6...@loopback/build@4.0.0-alpha.7) (2017-12-11)


### Bug Fixes

* Fix node module names in source code headers ([0316f28](https://github.com/strongloop/loopback4-build/commit/0316f28))




<a name="4.0.0-alpha.6"></a>
# [4.0.0-alpha.6](https://github.com/strongloop/loopback4-build/compare/@loopback/build@4.0.0-alpha.5...@loopback/build@4.0.0-alpha.6) (2017-11-29)




**Note:** Version bump only for package @loopback/build

<a name="4.0.0-alpha.5"></a>
# [4.0.0-alpha.5](https://github.com/strongloop/loopback4-build/compare/@loopback/build@4.0.0-alpha.4...@loopback/build@4.0.0-alpha.5) (2017-11-09)




**Note:** Version bump only for package @loopback/build

<a name="4.0.0-alpha.4"></a>
# [4.0.0-alpha.4](https://github.com/strongloop/loopback4-build/compare/@loopback/build@4.0.0-alpha.3...@loopback/build@4.0.0-alpha.4) (2017-11-06)




**Note:** Version bump only for package @loopback/build

<a name="4.0.0-alpha.3"></a>
# [4.0.0-alpha.3](https://github.com/strongloop/loopback4-build/compare/@loopback/build@4.0.0-alpha.2...@loopback/build@4.0.0-alpha.3) (2017-10-31)




**Note:** Version bump only for package @loopback/build

<a name="4.0.0-alpha.2"></a>
# 4.0.0-alpha.2 (2017-10-31)


### Features

* Add build scripts as a separate package ([6eacee7](https://github.com/strongloop/loopback4-build/commit/6eacee7))
