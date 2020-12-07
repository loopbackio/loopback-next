# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [3.2.0](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@3.1.1...@loopback/repository-json-schema@3.2.0) (2020-12-07)


### Features

* **filter:** introduce simpler syntax for inclusion ([2fe32ac](https://github.com/strongloop/loopback-next/commit/2fe32ac0f9c820ff1df242ea6e32c972a4dee383))





## [3.1.1](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@3.1.0...@loopback/repository-json-schema@3.1.1) (2020-11-18)

**Note:** Version bump only for package @loopback/repository-json-schema





# [3.1.0](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@3.0.2...@loopback/repository-json-schema@3.1.0) (2020-11-05)


### Features

* **filter:** allow use an array in filter.fields ([ec386c1](https://github.com/strongloop/loopback-next/commit/ec386c15bce904c770a9be51f21d4ff3592dd1af))





## [3.0.2](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@3.0.1...@loopback/repository-json-schema@3.0.2) (2020-10-07)

**Note:** Version bump only for package @loopback/repository-json-schema





## [3.0.1](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@3.0.0...@loopback/repository-json-schema@3.0.1) (2020-09-17)

**Note:** Version bump only for package @loopback/repository-json-schema





# [3.0.0](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@2.4.10...@loopback/repository-json-schema@3.0.0) (2020-09-15)


### Bug Fixes

* improve handling of missing design-time type metadata ([95b6a2b](https://github.com/strongloop/loopback-next/commit/95b6a2b7ce64e614720df43b905f77a53a54e438))


### Features

* move framework packages to `devDependencies` ([e2c61ce](https://github.com/strongloop/loopback-next/commit/e2c61ce79aa68d76f6e7138642034160b50063f0))


### BREAKING CHANGES

* components no longer install core framework packages as
their own dependencies, they use the framework packages provided by the
target application instead.

If you are getting `npm install` errors after upgrade, then make sure
your project lists all dependencies required by the extensions you are
using.

Signed-off-by: Miroslav Bajtoš <mbajtoss@gmail.com>





## [2.4.10](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@2.4.9...@loopback/repository-json-schema@2.4.10) (2020-08-27)


### Bug Fixes

* **repository-json-schema:** allows string-based order filter ([c10dca9](https://github.com/strongloop/loopback-next/commit/c10dca990f73d80c70752ae72fd1006bb356991d)), closes [#6140](https://github.com/strongloop/loopback-next/issues/6140)





## [2.4.9](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@2.4.8...@loopback/repository-json-schema@2.4.9) (2020-08-19)

**Note:** Version bump only for package @loopback/repository-json-schema





## [2.4.8](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@2.4.7...@loopback/repository-json-schema@2.4.8) (2020-08-05)

**Note:** Version bump only for package @loopback/repository-json-schema





## [2.4.7](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@2.4.6...@loopback/repository-json-schema@2.4.7) (2020-07-20)


### Bug Fixes

* nested scope filter ([b29d6d7](https://github.com/strongloop/loopback-next/commit/b29d6d7938b0d07e927b0939745b76cfff91272b))
* **repository-json-schema:** added type 'object' to model json schema ([5c5f9ef](https://github.com/strongloop/loopback-next/commit/5c5f9efcfdea7788503d74610e7ce64f31abc7cd)), closes [#3804](https://github.com/strongloop/loopback-next/issues/3804)





## [2.4.6](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@2.4.5...@loopback/repository-json-schema@2.4.6) (2020-06-30)

**Note:** Version bump only for package @loopback/repository-json-schema





## [2.4.5](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@2.4.4...@loopback/repository-json-schema@2.4.5) (2020-06-23)


### Bug Fixes

* set node version to >=10.16 to support events.once ([e39da1c](https://github.com/strongloop/loopback-next/commit/e39da1ca47728eafaf83c10ce35b09b03b6a4edc))





## [2.4.4](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@2.4.3...@loopback/repository-json-schema@2.4.4) (2020-06-11)

**Note:** Version bump only for package @loopback/repository-json-schema





## [2.4.3](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@2.4.2...@loopback/repository-json-schema@2.4.3) (2020-05-28)


### Bug Fixes

* array decorator ([08ba68d](https://github.com/strongloop/loopback-next/commit/08ba68d34d23919db23f3aaecc3dc97dc1d09763))





## [2.4.2](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@2.4.1...@loopback/repository-json-schema@2.4.2) (2020-05-20)

**Note:** Version bump only for package @loopback/repository-json-schema





## [2.4.1](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@2.4.0...@loopback/repository-json-schema@2.4.1) (2020-05-19)


### Bug Fixes

* **repository-json-schema:** honor excluded "include" property ([3888f60](https://github.com/strongloop/loopback-next/commit/3888f60357be7006fc3aff250d291f53c0ca355e))





# [2.4.0](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@2.3.0...@loopback/repository-json-schema@2.4.0) (2020-05-07)


### Features

* **repository-json-schema:** improve schema building for null/undefined types ([845914b](https://github.com/strongloop/loopback-next/commit/845914be5a3660edf4833bcccd7e7aa2f2cfb3f2))





# [2.3.0](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@2.2.1...@loopback/repository-json-schema@2.3.0) (2020-04-29)


### Bug Fixes

* **repository-json-schema:** avoid title inheritance ([723bc34](https://github.com/strongloop/loopback-next/commit/723bc3401753e4ba8f4e421e468c0bfca66582c8))


### Features

* populate x-typescript-type for openapi schema ([02a2633](https://github.com/strongloop/loopback-next/commit/02a26339e8a49b92148aa9c05179458a4bc85a70))





## [2.2.1](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@2.2.0...@loopback/repository-json-schema@2.2.1) (2020-04-23)

**Note:** Version bump only for package @loopback/repository-json-schema





# [2.2.0](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@2.1.1...@loopback/repository-json-schema@2.2.0) (2020-04-22)


### Bug Fixes

* omit title for relation schemas ([694a9eb](https://github.com/strongloop/loopback-next/commit/694a9eb7aec9b8d6ef691e59b20d84224713dccf))


### Features

* **repository-json-schema:** allow jsonSchema for model definitions ([05370bc](https://github.com/strongloop/loopback-next/commit/05370bcc4cc7707ffd018cd6fbfc925935b05a8d))
* update package.json and .travis.yml for builds ([cb2b8e6](https://github.com/strongloop/loopback-next/commit/cb2b8e6a18616dda7783c0193091039d4e608131))





## [2.1.1](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@2.1.0...@loopback/repository-json-schema@2.1.1) (2020-04-11)

**Note:** Version bump only for package @loopback/repository-json-schema





# [2.1.0](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@2.0.2...@loopback/repository-json-schema@2.1.0) (2020-04-08)


### Bug Fixes

* **repository-json-schema:** honor {partial: 'deep'} options for referenced types ([6685560](https://github.com/strongloop/loopback-next/commit/66855602cff3c2d58c68895e4aeb3da950d7f33f))


### Features

* support any type ([03ce221](https://github.com/strongloop/loopback-next/commit/03ce221bb41a2ecd296ba235fe342d488fa2d639))





## [2.0.2](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@2.0.1...@loopback/repository-json-schema@2.0.2) (2020-03-24)


### Bug Fixes

* **repository-json-schema:** fix schema generation for model inheritance ([5417ed5](https://github.com/strongloop/loopback-next/commit/5417ed5fdbf0508f1882186d9cbff64ecfb10699))





## [2.0.1](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@2.0.0...@loopback/repository-json-schema@2.0.1) (2020-03-17)

**Note:** Version bump only for package @loopback/repository-json-schema





# [2.0.0](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@1.12.2...@loopback/repository-json-schema@2.0.0) (2020-03-05)


### chore

* remove support for Node.js v8.x ([4281d9d](https://github.com/strongloop/loopback-next/commit/4281d9df50f0715d32879e1442a90b643ec8f542))


### Features

* improve filter schema to allow exclusion ([be73660](https://github.com/strongloop/loopback-next/commit/be736601dcf91b8b322470fc08c9ed42260fa60c))
* **repository-json-schema:** remove deprecated `MODEL_TYPE_KEYS` ([5bc2121](https://github.com/strongloop/loopback-next/commit/5bc21219ff3beb792c6d11ac12bfc1b58aee5c09))
* add `tslib` as dependency ([a6e0b4c](https://github.com/strongloop/loopback-next/commit/a6e0b4ce7b862764167cefedee14c1115b25e0a4)), closes [#4676](https://github.com/strongloop/loopback-next/issues/4676)


### BREAKING CHANGES

* **repository-json-schema:** The following constants are no longer available:
- `MODEL_TYPE_KEYS.ModelOnly`
- `MODEL_TYPE_KEYS.ModelWithRelations`

Please use the helper `buildModelCacheKey` to obtain the cache key
for a given set of schema options.

```diff
- MODEL_TYPE_KEYS.ModelOnly
+ buildModelCacheKey()

- MODEL_TYPE_KEYS.ModelWithRelations
+ buildModelCacheKey({includeRelations: true})
```

Signed-off-by: Miroslav Bajtoš <mbajtoss@gmail.com>
* Node.js v8.x is now end of life. Please upgrade to version
10 and above. See https://nodejs.org/en/about/releases.





## [1.12.2](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@1.12.1...@loopback/repository-json-schema@1.12.2) (2020-02-06)

**Note:** Version bump only for package @loopback/repository-json-schema





## [1.12.1](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@1.12.0...@loopback/repository-json-schema@1.12.1) (2020-02-05)

**Note:** Version bump only for package @loopback/repository-json-schema





# [1.12.0](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@1.11.4...@loopback/repository-json-schema@1.12.0) (2020-01-27)


### Features

* **repository-json-schema:** add filter title ([2d65971](https://github.com/strongloop/loopback-next/commit/2d6597133885c16c132221cef80893093fa3d289))
* **repository-json-schema:** add title to filter schemas ([6105883](https://github.com/strongloop/loopback-next/commit/6105883967ca5853cc8990f423d9febd1eb07101))





## [1.11.4](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@1.11.3...@loopback/repository-json-schema@1.11.4) (2020-01-07)

**Note:** Version bump only for package @loopback/repository-json-schema





## [1.11.3](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@1.11.2...@loopback/repository-json-schema@1.11.3) (2019-12-09)

**Note:** Version bump only for package @loopback/repository-json-schema





## [1.11.2](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@1.11.1...@loopback/repository-json-schema@1.11.2) (2019-11-25)

**Note:** Version bump only for package @loopback/repository-json-schema





## [1.11.1](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@1.11.0...@loopback/repository-json-schema@1.11.1) (2019-11-12)

**Note:** Version bump only for package @loopback/repository-json-schema





# [1.11.0](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@1.10.3...@loopback/repository-json-schema@1.11.0) (2019-10-24)


### Bug Fixes

* allow json schema with circular refs to be converted to OpenAPI schema ([cd5ca92](https://github.com/strongloop/loopback-next/commit/cd5ca92c368ae35bc10d8847b3b0d379f7196544))


### Features

* **openapi-v3:** copy first example from examples to schema ([0c7843a](https://github.com/strongloop/loopback-next/commit/0c7843abd82b391557d807e7bbd80e4c7b2ae8fd))
* improve debug logs for schema generators ([da88cdf](https://github.com/strongloop/loopback-next/commit/da88cdf9c75b0ca498b86f7cd5729f78a4b160f7))
* simplify model schema with excluded properties ([b554ac8](https://github.com/strongloop/loopback-next/commit/b554ac8a08a518f112d111ebabcac48279ada7f8))
* **repository-json-schema:** forbid additional properties in model data ([5fc8d53](https://github.com/strongloop/loopback-next/commit/5fc8d532c56c3dbb700c414df5b02730fb1c7764))





## [1.10.3](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@1.10.2...@loopback/repository-json-schema@1.10.3) (2019-10-07)

**Note:** Version bump only for package @loopback/repository-json-schema





## [1.10.2](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@1.10.1...@loopback/repository-json-schema@1.10.2) (2019-09-28)

**Note:** Version bump only for package @loopback/repository-json-schema





## [1.10.1](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@1.10.0...@loopback/repository-json-schema@1.10.1) (2019-09-27)


### Bug Fixes

* **repository-json-schema:** generate schema title compatible with validation in azure ([b518876](https://github.com/strongloop/loopback-next/commit/b518876))





# [1.10.0](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@1.9.7...@loopback/repository-json-schema@1.10.0) (2019-09-17)


### Features

* **repository-json-schema:** introduce new option "title" ([7664b3e](https://github.com/strongloop/loopback-next/commit/7664b3e))





## [1.9.7](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@1.9.6...@loopback/repository-json-schema@1.9.7) (2019-09-06)


### Bug Fixes

* **repository-json-schema:** allow recursive model definitions ([1221e0b](https://github.com/strongloop/loopback-next/commit/1221e0b))





## [1.9.6](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@1.9.5...@loopback/repository-json-schema@1.9.6) (2019-09-03)

**Note:** Version bump only for package @loopback/repository-json-schema





## [1.9.5](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@1.9.4...@loopback/repository-json-schema@1.9.5) (2019-08-19)

**Note:** Version bump only for package @loopback/repository-json-schema





## [1.9.4](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@1.9.3...@loopback/repository-json-schema@1.9.4) (2019-08-15)

**Note:** Version bump only for package @loopback/repository-json-schema





## [1.9.3](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@1.9.2...@loopback/repository-json-schema@1.9.3) (2019-08-15)


### Bug Fixes

* **repository-json-schema:** make exclude option reject properties ([35027c4](https://github.com/strongloop/loopback-next/commit/35027c4))





## [1.9.2](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@1.9.1...@loopback/repository-json-schema@1.9.2) (2019-07-31)


### Bug Fixes

* enforce JsonSchemaOptions type when building model schema ([9bbc932](https://github.com/strongloop/loopback-next/commit/9bbc932))





## [1.9.1](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@1.9.0...@loopback/repository-json-schema@1.9.1) (2019-07-26)

**Note:** Version bump only for package @loopback/repository-json-schema





# [1.9.0](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@1.8.0...@loopback/repository-json-schema@1.9.0) (2019-07-17)


### Features

* **repository-json-schema:** add an option to exclude properties from schema ([53ac940](https://github.com/strongloop/loopback-next/commit/53ac940))
* **repository-json-schema:** add an option to make properties optional ([946de02](https://github.com/strongloop/loopback-next/commit/946de02))





# [1.8.0](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@1.7.2...@loopback/repository-json-schema@1.8.0) (2019-06-28)


### Bug Fixes

* address violations of "no-floating-promises" rule ([0947531](https://github.com/strongloop/loopback-next/commit/0947531))


### Features

* **repository-json-schema:** add an option to emit partial schema ([14af423](https://github.com/strongloop/loopback-next/commit/14af423))





## [1.7.2](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@1.7.1...@loopback/repository-json-schema@1.7.2) (2019-06-21)

**Note:** Version bump only for package @loopback/repository-json-schema





## [1.7.1](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@1.7.0...@loopback/repository-json-schema@1.7.1) (2019-06-20)

**Note:** Version bump only for package @loopback/repository-json-schema





# [1.7.0](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@1.6.1...@loopback/repository-json-schema@1.7.0) (2019-06-17)


### Features

* **repository-json-schema:** enhance getJsonSchema to describe navigational properties ([7801f59](https://github.com/strongloop/loopback-next/commit/7801f59)), closes [#2630](https://github.com/strongloop/loopback-next/issues/2630)





## [1.6.1](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@1.6.0...@loopback/repository-json-schema@1.6.1) (2019-06-06)

**Note:** Version bump only for package @loopback/repository-json-schema





# [1.6.0](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@1.5.1...@loopback/repository-json-schema@1.6.0) (2019-06-03)


### Features

* replace tslint with eslint ([44185a7](https://github.com/strongloop/loopback-next/commit/44185a7))





## [1.5.1](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@1.5.0...@loopback/repository-json-schema@1.5.1) (2019-05-31)

**Note:** Version bump only for package @loopback/repository-json-schema





# [1.5.0](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@1.4.8...@loopback/repository-json-schema@1.5.0) (2019-05-30)


### Features

* helpers for building JSON/OpenAPI schema referencing shared definitions ([bf07ff9](https://github.com/strongloop/loopback-next/commit/bf07ff9))





## [1.4.8](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@1.4.7...@loopback/repository-json-schema@1.4.8) (2019-05-23)

**Note:** Version bump only for package @loopback/repository-json-schema





## [1.4.7](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@1.4.6...@loopback/repository-json-schema@1.4.7) (2019-05-14)

**Note:** Version bump only for package @loopback/repository-json-schema





## [1.4.6](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@1.4.5...@loopback/repository-json-schema@1.4.6) (2019-05-10)

**Note:** Version bump only for package @loopback/repository-json-schema





## [1.4.5](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@1.4.4...@loopback/repository-json-schema@1.4.5) (2019-05-09)

**Note:** Version bump only for package @loopback/repository-json-schema





## [1.4.4](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@1.4.3...@loopback/repository-json-schema@1.4.4) (2019-05-06)

**Note:** Version bump only for package @loopback/repository-json-schema





## [1.4.3](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@1.4.2...@loopback/repository-json-schema@1.4.3) (2019-04-26)


### Bug Fixes

* **repository-json-schema:** resolve the circular reference ([9b49773](https://github.com/strongloop/loopback-next/commit/9b49773))





## [1.4.2](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@1.4.1...@loopback/repository-json-schema@1.4.2) (2019-04-20)

**Note:** Version bump only for package @loopback/repository-json-schema





## [1.4.1](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@1.4.0...@loopback/repository-json-schema@1.4.1) (2019-04-11)

**Note:** Version bump only for package @loopback/repository-json-schema





# [1.4.0](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@1.3.7...@loopback/repository-json-schema@1.4.0) (2019-04-09)


### Features

* **repository-json-schema:** refactor metaToJsonProperty to accept custom jsonSchema ([d0014c6](https://github.com/strongloop/loopback-next/commit/d0014c6))





## [1.3.7](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@1.3.6...@loopback/repository-json-schema@1.3.7) (2019-04-05)

**Note:** Version bump only for package @loopback/repository-json-schema





## [1.3.6](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@1.3.5...@loopback/repository-json-schema@1.3.6) (2019-03-22)

**Note:** Version bump only for package @loopback/repository-json-schema





## [1.3.5](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@1.3.4...@loopback/repository-json-schema@1.3.5) (2019-03-22)

**Note:** Version bump only for package @loopback/repository-json-schema





## [1.3.4](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@1.3.3...@loopback/repository-json-schema@1.3.4) (2019-03-12)

**Note:** Version bump only for package @loopback/repository-json-schema





## [1.3.3](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@1.3.2...@loopback/repository-json-schema@1.3.3) (2019-03-01)

**Note:** Version bump only for package @loopback/repository-json-schema





## [1.3.2](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@1.3.1...@loopback/repository-json-schema@1.3.2) (2019-02-25)

**Note:** Version bump only for package @loopback/repository-json-schema





## [1.3.1](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@1.3.0...@loopback/repository-json-schema@1.3.1) (2019-02-08)

**Note:** Version bump only for package @loopback/repository-json-schema





# [1.3.0](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@1.2.7...@loopback/repository-json-schema@1.3.0) (2019-01-28)


### Features

* **repository-json-schema:** enumerate fields ([15ca819](https://github.com/strongloop/loopback-next/commit/15ca819))





## [1.2.7](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@1.2.6...@loopback/repository-json-schema@1.2.7) (2019-01-15)


### Bug Fixes

* **repository:** remove property.array() call from hasMany decorator ([56ab017](https://github.com/strongloop/loopback-next/commit/56ab017)), closes [#1944](https://github.com/strongloop/loopback-next/issues/1944)





## [1.2.6](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@1.2.5...@loopback/repository-json-schema@1.2.6) (2019-01-14)


### Bug Fixes

* rework tslint comments disabling "no-unused-variable" rule ([a18a3d7](https://github.com/strongloop/loopback-next/commit/a18a3d7))





## [1.2.5](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@1.2.4...@loopback/repository-json-schema@1.2.5) (2018-12-20)

**Note:** Version bump only for package @loopback/repository-json-schema





## [1.2.4](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@1.2.3...@loopback/repository-json-schema@1.2.4) (2018-12-13)

**Note:** Version bump only for package @loopback/repository-json-schema





## [1.2.3](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@1.2.2...@loopback/repository-json-schema@1.2.3) (2018-11-26)

**Note:** Version bump only for package @loopback/repository-json-schema





## [1.2.2](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@1.2.1...@loopback/repository-json-schema@1.2.2) (2018-11-17)

**Note:** Version bump only for package @loopback/repository-json-schema





## [1.2.1](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@1.2.0...@loopback/repository-json-schema@1.2.1) (2018-11-14)

**Note:** Version bump only for package @loopback/repository-json-schema





<a name="1.2.0"></a>
# [1.2.0](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@1.0.1...@loopback/repository-json-schema@1.2.0) (2018-11-08)


### Features

* **repository-json-schema:** add property description to JSON schema ([31c02f2](https://github.com/strongloop/loopback-next/commit/31c02f2))





<a name="1.0.1"></a>
## [1.0.1](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@1.0.0...@loopback/repository-json-schema@1.0.1) (2018-10-17)

**Note:** Version bump only for package @loopback/repository-json-schema





<a name="0.12.2"></a>
## [0.12.2](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@0.12.1...@loopback/repository-json-schema@0.12.2) (2018-10-08)

**Note:** Version bump only for package @loopback/repository-json-schema





<a name="0.12.1"></a>
## [0.12.1](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@0.12.0...@loopback/repository-json-schema@0.12.1) (2018-10-06)

**Note:** Version bump only for package @loopback/repository-json-schema





<a name="0.12.0"></a>
# [0.12.0](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@0.11.3...@loopback/repository-json-schema@0.12.0) (2018-10-05)


### Features

* **repository:** implement belongsTo relation ([df8c64c](https://github.com/strongloop/loopback-next/commit/df8c64c))





<a name="0.11.3"></a>
## [0.11.3](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@0.11.2...@loopback/repository-json-schema@0.11.3) (2018-10-03)

**Note:** Version bump only for package @loopback/repository-json-schema





<a name="0.11.2"></a>
## [0.11.2](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@0.11.1...@loopback/repository-json-schema@0.11.2) (2018-09-28)


### Bug Fixes

* **metadata:** remove the default type to work around a TS bug ([fc89a2c](https://github.com/strongloop/loopback-next/commit/fc89a2c))





<a name="0.11.1"></a>
## [0.11.1](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@0.11.0...@loopback/repository-json-schema@0.11.1) (2018-09-27)

**Note:** Version bump only for package @loopback/repository-json-schema





<a name="0.11.0"></a>
# [0.11.0](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@0.10.14...@loopback/repository-json-schema@0.11.0) (2018-09-25)


### Features

* builders for Filter and Where schemas ([ca8d96e](https://github.com/strongloop/loopback-next/commit/ca8d96e))
* support built-in JavaScript/Node schema types ([d65a17f](https://github.com/strongloop/loopback-next/commit/d65a17f))
* type resolver for property decorators ([49454aa](https://github.com/strongloop/loopback-next/commit/49454aa))





<a name="0.10.14"></a>
## [0.10.14](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@0.10.13...@loopback/repository-json-schema@0.10.14) (2018-09-21)

**Note:** Version bump only for package @loopback/repository-json-schema





<a name="0.10.13"></a>
## [0.10.13](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@0.10.12...@loopback/repository-json-schema@0.10.13) (2018-09-19)

**Note:** Version bump only for package @loopback/repository-json-schema





<a name="0.10.12"></a>
## [0.10.12](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@0.10.11...@loopback/repository-json-schema@0.10.12) (2018-09-14)

**Note:** Version bump only for package @loopback/repository-json-schema





<a name="0.10.11"></a>
## [0.10.11](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@0.10.10...@loopback/repository-json-schema@0.10.11) (2018-09-14)

**Note:** Version bump only for package @loopback/repository-json-schema





<a name="0.10.10"></a>
## [0.10.10](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@0.10.9...@loopback/repository-json-schema@0.10.10) (2018-09-14)

**Note:** Version bump only for package @loopback/repository-json-schema





<a name="0.10.9"></a>
## [0.10.9](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@0.10.8...@loopback/repository-json-schema@0.10.9) (2018-09-12)

**Note:** Version bump only for package @loopback/repository-json-schema





<a name="0.10.8"></a>
## [0.10.8](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@0.10.7...@loopback/repository-json-schema@0.10.8) (2018-09-10)

**Note:** Version bump only for package @loopback/repository-json-schema





<a name="0.10.7"></a>
## [0.10.7](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@0.10.6...@loopback/repository-json-schema@0.10.7) (2018-09-08)

**Note:** Version bump only for package @loopback/repository-json-schema





<a name="0.10.6"></a>
## [0.10.6](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@0.10.5...@loopback/repository-json-schema@0.10.6) (2018-08-25)


### Bug Fixes

* fix [#1643](https://github.com/strongloop/loopback-next/issues/1643): import MetadataAccessor direct from metadata to avoid TypeScript 3 compiler issue ([37d727a](https://github.com/strongloop/loopback-next/commit/37d727a))





<a name="0.10.5"></a>
## [0.10.5](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@0.10.4...@loopback/repository-json-schema@0.10.5) (2018-08-24)

**Note:** Version bump only for package @loopback/repository-json-schema





<a name="0.10.4"></a>
## [0.10.4](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@0.10.3...@loopback/repository-json-schema@0.10.4) (2018-08-15)


### Bug Fixes

* **repository:** change the way array property definition is built for the juggler ([2471c88](https://github.com/strongloop/loopback-next/commit/2471c88))




<a name="0.10.3"></a>
## [0.10.3](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@0.10.2...@loopback/repository-json-schema@0.10.3) (2018-08-08)




**Note:** Version bump only for package @loopback/repository-json-schema

<a name="0.10.2"></a>
## [0.10.2](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@0.10.1...@loopback/repository-json-schema@0.10.2) (2018-07-21)




**Note:** Version bump only for package @loopback/repository-json-schema

<a name="0.10.1"></a>
## [0.10.1](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@0.10.0...@loopback/repository-json-schema@0.10.1) (2018-07-20)




**Note:** Version bump only for package @loopback/repository-json-schema

<a name="0.10.0"></a>
# [0.10.0](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@0.9.16...@loopback/repository-json-schema@0.10.0) (2018-07-20)




**Note:** Version bump only for package @loopback/repository-json-schema

<a name="0.9.16"></a>
## [0.9.16](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@0.9.15...@loopback/repository-json-schema@0.9.16) (2018-07-13)




**Note:** Version bump only for package @loopback/repository-json-schema

<a name="0.9.15"></a>
## [0.9.15](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@0.9.14...@loopback/repository-json-schema@0.9.15) (2018-07-11)




**Note:** Version bump only for package @loopback/repository-json-schema

<a name="0.9.14"></a>
## [0.9.14](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@0.9.13...@loopback/repository-json-schema@0.9.14) (2018-07-10)




**Note:** Version bump only for package @loopback/repository-json-schema

<a name="0.9.13"></a>
## [0.9.13](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@0.9.12...@loopback/repository-json-schema@0.9.13) (2018-07-09)




**Note:** Version bump only for package @loopback/repository-json-schema

<a name="0.9.12"></a>
## [0.9.12](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@0.9.11...@loopback/repository-json-schema@0.9.12) (2018-06-28)




**Note:** Version bump only for package @loopback/repository-json-schema

<a name="0.9.11"></a>
## [0.9.11](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@0.9.10...@loopback/repository-json-schema@0.9.11) (2018-06-27)




**Note:** Version bump only for package @loopback/repository-json-schema

<a name="0.9.10"></a>
## [0.9.10](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@0.9.9...@loopback/repository-json-schema@0.9.10) (2018-06-20)




**Note:** Version bump only for package @loopback/repository-json-schema

<a name="0.9.9"></a>
## [0.9.9](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@0.9.8...@loopback/repository-json-schema@0.9.9) (2018-06-11)




**Note:** Version bump only for package @loopback/repository-json-schema

<a name="0.9.8"></a>
## [0.9.8](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@0.9.6...@loopback/repository-json-schema@0.9.8) (2018-06-09)




**Note:** Version bump only for package @loopback/repository-json-schema

<a name="0.9.7"></a>
## [0.9.7](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@0.9.6...@loopback/repository-json-schema@0.9.7) (2018-06-09)




**Note:** Version bump only for package @loopback/repository-json-schema

<a name="0.9.6"></a>
## [0.9.6](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@0.9.5...@loopback/repository-json-schema@0.9.6) (2018-06-08)




**Note:** Version bump only for package @loopback/repository-json-schema

<a name="0.9.5"></a>
## [0.9.5](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@0.9.4...@loopback/repository-json-schema@0.9.5) (2018-05-28)




**Note:** Version bump only for package @loopback/repository-json-schema

<a name="0.9.4"></a>
## [0.9.4](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@0.9.3...@loopback/repository-json-schema@0.9.4) (2018-05-20)




**Note:** Version bump only for package @loopback/repository-json-schema

<a name="0.9.3"></a>
## [0.9.3](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@0.9.2...@loopback/repository-json-schema@0.9.3) (2018-05-14)


### Bug Fixes

* change index.d.ts files to point to dist8 ([42ca42d](https://github.com/strongloop/loopback-next/commit/42ca42d))




<a name="0.9.2"></a>
## [0.9.2](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@0.9.1...@loopback/repository-json-schema@0.9.2) (2018-05-14)




**Note:** Version bump only for package @loopback/repository-json-schema

<a name="0.9.1"></a>
## [0.9.1](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@0.9.0...@loopback/repository-json-schema@0.9.1) (2018-05-08)




**Note:** Version bump only for package @loopback/repository-json-schema

<a name="0.9.0"></a>
# [0.9.0](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@0.7.0...@loopback/repository-json-schema@0.9.0) (2018-05-03)


### Features

* add helper package "dist-util" ([532f153](https://github.com/strongloop/loopback-next/commit/532f153))




<a name="0.8.0"></a>
# [0.8.0](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@0.7.0...@loopback/repository-json-schema@0.8.0) (2018-05-03)


### Features

* add helper package "dist-util" ([532f153](https://github.com/strongloop/loopback-next/commit/532f153))




<a name="0.7.0"></a>
# [0.7.0](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@0.6.1...@loopback/repository-json-schema@0.7.0) (2018-04-26)


### Features

* **repository-json-schema:** include problem type in err message ([f5ad2f1](https://github.com/strongloop/loopback-next/commit/f5ad2f1))




<a name="0.6.1"></a>
## [0.6.1](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@0.6.0...@loopback/repository-json-schema@0.6.1) (2018-04-25)




**Note:** Version bump only for package @loopback/repository-json-schema

<a name="0.6.0"></a>
# [0.6.0](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@0.5.0...@loopback/repository-json-schema@0.6.0) (2018-04-16)




**Note:** Version bump only for package @loopback/repository-json-schema

<a name="0.5.0"></a>
# [0.5.0](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@0.4.5...@loopback/repository-json-schema@0.5.0) (2018-04-12)


### Features

* **metadata:** add strongly-typed metadata accessors ([45f9f80](https://github.com/strongloop/loopback-next/commit/45f9f80))




<a name="0.4.5"></a>
## [0.4.5](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@0.4.4...@loopback/repository-json-schema@0.4.5) (2018-04-11)




**Note:** Version bump only for package @loopback/repository-json-schema

<a name="0.4.4"></a>
## [0.4.4](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@0.4.2...@loopback/repository-json-schema@0.4.4) (2018-04-11)


### Bug Fixes

* change file names to fit advocated naming convention ([0331df8](https://github.com/strongloop/loopback-next/commit/0331df8))




<a name="0.4.3"></a>
## [0.4.3](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@0.4.2...@loopback/repository-json-schema@0.4.3) (2018-04-06)




**Note:** Version bump only for package @loopback/repository-json-schema

<a name="0.4.2"></a>
## [0.4.2](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@0.4.1...@loopback/repository-json-schema@0.4.2) (2018-04-04)




**Note:** Version bump only for package @loopback/repository-json-schema

<a name="0.4.1"></a>
## [0.4.1](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@0.4.0...@loopback/repository-json-schema@0.4.1) (2018-04-02)




**Note:** Version bump only for package @loopback/repository-json-schema

<a name="0.4.0"></a>
# [0.4.0](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@0.3.1...@loopback/repository-json-schema@0.4.0) (2018-03-29)




**Note:** Version bump only for package @loopback/repository-json-schema

<a name="0.3.1"></a>
## [0.3.1](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@0.3.0...@loopback/repository-json-schema@0.3.1) (2018-03-23)




**Note:** Version bump only for package @loopback/repository-json-schema

<a name="0.3.0"></a>
# [0.3.0](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@0.2.4...@loopback/repository-json-schema@0.3.0) (2018-03-21)




**Note:** Version bump only for package @loopback/repository-json-schema

<a name="0.2.4"></a>
## [0.2.4](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@0.2.3...@loopback/repository-json-schema@0.2.4) (2018-03-14)




**Note:** Version bump only for package @loopback/repository-json-schema

<a name="0.2.3"></a>
## [0.2.3](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@0.2.2...@loopback/repository-json-schema@0.2.3) (2018-03-13)




**Note:** Version bump only for package @loopback/repository-json-schema

<a name="0.2.2"></a>
## [0.2.2](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@0.2.1...@loopback/repository-json-schema@0.2.2) (2018-03-08)


### Bug Fixes

* **repository-json-schema:** change model to be a class ([4104e13](https://github.com/strongloop/loopback-next/commit/4104e13))




<a name="0.2.1"></a>
## [0.2.1](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@0.2.0...@loopback/repository-json-schema@0.2.1) (2018-03-06)


### Bug Fixes

* fix typo of `additional` ([2fd7610](https://github.com/strongloop/loopback-next/commit/2fd7610))




<a name="0.2.0"></a>
# [0.2.0](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@0.1.2...@loopback/repository-json-schema@0.2.0) (2018-03-01)




**Note:** Version bump only for package @loopback/repository-json-schema

<a name="0.1.2"></a>
## [0.1.2](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@0.1.1...@loopback/repository-json-schema@0.1.2) (2018-03-01)




**Note:** Version bump only for package @loopback/repository-json-schema

<a name="0.1.1"></a>
## [0.1.1](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@0.1.0...@loopback/repository-json-schema@0.1.1) (2018-02-23)




**Note:** Version bump only for package @loopback/repository-json-schema

<a name="0.1.0"></a>
# [0.1.0](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@4.0.0-alpha.8...@loopback/repository-json-schema@0.1.0) (2018-02-21)




**Note:** Version bump only for package @loopback/repository-json-schema

<a name="4.0.0-alpha.8"></a>
# [4.0.0-alpha.8](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@4.0.0-alpha.7...@loopback/repository-json-schema@4.0.0-alpha.8) (2018-02-15)




**Note:** Version bump only for package @loopback/repository-json-schema

<a name="4.0.0-alpha.7"></a>
# [4.0.0-alpha.7](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@4.0.0-alpha.6...@loopback/repository-json-schema@4.0.0-alpha.7) (2018-02-07)


### Bug Fixes

* **build:** fix tslint config and slipped violations ([22f8e05](https://github.com/strongloop/loopback-next/commit/22f8e05))
* **repository-json-schema:** fix $ref typo ([#963](https://github.com/strongloop/loopback-next/issues/963)) ([a438729](https://github.com/strongloop/loopback-next/commit/a438729))


### build

* drop dist6 related targets ([#945](https://github.com/strongloop/loopback-next/issues/945)) ([a2368ce](https://github.com/strongloop/loopback-next/commit/a2368ce))


### BREAKING CHANGES

* Support for Node.js version lower than 8.0 has been dropped.
Please upgrade to the latest Node.js 8.x LTS version.

Co-Authored-by: Taranveer Virk <taranveer@virk.cc>




<a name="4.0.0-alpha.6"></a>
# [4.0.0-alpha.6](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@4.0.0-alpha.5...@loopback/repository-json-schema@4.0.0-alpha.6) (2018-02-04)




**Note:** Version bump only for package @loopback/repository-json-schema

<a name="4.0.0-alpha.5"></a>
# [4.0.0-alpha.5](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@4.0.0-alpha.4...@loopback/repository-json-schema@4.0.0-alpha.5) (2018-01-30)


### Features

* **repository-json-schema:** add in top-level metadata for json schema ([#907](https://github.com/strongloop/loopback-next/issues/907)) ([fe59e6b](https://github.com/strongloop/loopback-next/commit/fe59e6b))




<a name="4.0.0-alpha.4"></a>
# [4.0.0-alpha.4](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@4.0.0-alpha.3...@loopback/repository-json-schema@4.0.0-alpha.4) (2018-01-29)




**Note:** Version bump only for package @loopback/repository-json-schema

<a name="4.0.0-alpha.3"></a>
# [4.0.0-alpha.3](https://github.com/strongloop/loopback-next/compare/@loopback/repository-json-schema@4.0.0-alpha.2...@loopback/repository-json-schema@4.0.0-alpha.3) (2018-01-26)


### Bug Fixes

* mark the access to be public for publish ([612a426](https://github.com/strongloop/loopback-next/commit/612a426))




<a name="4.0.0-alpha.2"></a>
# 4.0.0-alpha.2 (2018-01-26)


### Bug Fixes

* make mocha self-contained with the source map support ([7c6d869](https://github.com/strongloop/loopback-next/commit/7c6d869))
