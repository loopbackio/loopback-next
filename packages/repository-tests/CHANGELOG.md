# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.18.1](https://github.com/loopbackio/loopback-next/compare/@loopback/repository-tests@0.18.0...@loopback/repository-tests@0.18.1) (2021-06-10)

**Note:** Version bump only for package @loopback/repository-tests





# [0.18.0](https://github.com/loopbackio/loopback-next/compare/@loopback/repository-tests@0.17.1...@loopback/repository-tests@0.18.0) (2021-05-03)


### Features

* support node v16 ([ac99415](https://github.com/loopbackio/loopback-next/commit/ac994154543bde22b4482ba98813351656db1b55))





## [0.17.1](https://github.com/loopbackio/loopback-next/compare/@loopback/repository-tests@0.17.0...@loopback/repository-tests@0.17.1) (2021-04-06)

**Note:** Version bump only for package @loopback/repository-tests





# [0.17.0](https://github.com/loopbackio/loopback-next/compare/@loopback/repository-tests@0.16.1...@loopback/repository-tests@0.17.0) (2021-03-18)


### Features

* update package-lock.json to v2 consistently ([dfc3fbd](https://github.com/loopbackio/loopback-next/commit/dfc3fbdae0c9ca9f34c64154a471bef22d5ac6b7))





## [0.16.1](https://github.com/loopbackio/loopback-next/compare/@loopback/repository-tests@0.16.0...@loopback/repository-tests@0.16.1) (2021-02-09)

**Note:** Version bump only for package @loopback/repository-tests





# [0.16.0](https://github.com/loopbackio/loopback-next/compare/@loopback/repository-tests@0.15.0...@loopback/repository-tests@0.16.0) (2021-01-21)


### Features

* fix eslint violations ([062de9c](https://github.com/loopbackio/loopback-next/commit/062de9c5f908332f58f54ddf13798a22ca21f1e7))





# [0.15.0](https://github.com/loopbackio/loopback-next/compare/@loopback/repository-tests@0.14.2...@loopback/repository-tests@0.15.0) (2020-12-07)


### Features

* leverage simpler syntax for inclusion ([3bcc61c](https://github.com/loopbackio/loopback-next/commit/3bcc61c420672b81e4639e0e0fc7e92035e41219))
* **filter:** introduce simpler syntax for inclusion ([2fe32ac](https://github.com/loopbackio/loopback-next/commit/2fe32ac0f9c820ff1df242ea6e32c972a4dee383))





## [0.14.2](https://github.com/loopbackio/loopback-next/compare/@loopback/repository-tests@0.14.1...@loopback/repository-tests@0.14.2) (2020-11-18)

**Note:** Version bump only for package @loopback/repository-tests





## [0.14.1](https://github.com/loopbackio/loopback-next/compare/@loopback/repository-tests@0.14.0...@loopback/repository-tests@0.14.1) (2020-11-05)

**Note:** Version bump only for package @loopback/repository-tests





# [0.14.0](https://github.com/loopbackio/loopback-next/compare/@loopback/repository-tests@0.13.1...@loopback/repository-tests@0.14.0) (2020-10-07)


### Features

* **repository:** implement hasManyThrough resolver ([8e7767d](https://github.com/loopbackio/loopback-next/commit/8e7767df0a4679c8c70ad524e56aea9783def521))





## [0.13.1](https://github.com/loopbackio/loopback-next/compare/@loopback/repository-tests@0.13.0...@loopback/repository-tests@0.13.1) (2020-09-17)

**Note:** Version bump only for package @loopback/repository-tests





# [0.13.0](https://github.com/loopbackio/loopback-next/compare/@loopback/repository-tests@0.12.13...@loopback/repository-tests@0.13.0) (2020-09-15)


### Features

* move framework packages to `devDependencies` ([e2c61ce](https://github.com/loopbackio/loopback-next/commit/e2c61ce79aa68d76f6e7138642034160b50063f0))


### BREAKING CHANGES

* components no longer install core framework packages as
their own dependencies, they use the framework packages provided by the
target application instead.

If you are getting `npm install` errors after upgrade, then make sure
your project lists all dependencies required by the extensions you are
using.

Signed-off-by: Miroslav Bajtoš <mbajtoss@gmail.com>





## [0.12.13](https://github.com/loopbackio/loopback-next/compare/@loopback/repository-tests@0.12.12...@loopback/repository-tests@0.12.13) (2020-08-27)

**Note:** Version bump only for package @loopback/repository-tests





## [0.12.12](https://github.com/loopbackio/loopback-next/compare/@loopback/repository-tests@0.12.11...@loopback/repository-tests@0.12.12) (2020-08-19)


### Bug Fixes

* **repository-tests:** disconnect datasources after tests finish ([c574303](https://github.com/loopbackio/loopback-next/commit/c574303adabf8cc67f91c98ab59aa226a972bf83))





## [0.12.11](https://github.com/loopbackio/loopback-next/compare/@loopback/repository-tests@0.12.10...@loopback/repository-tests@0.12.11) (2020-08-05)

**Note:** Version bump only for package @loopback/repository-tests





## [0.12.10](https://github.com/loopbackio/loopback-next/compare/@loopback/repository-tests@0.12.9...@loopback/repository-tests@0.12.10) (2020-07-20)


### Bug Fixes

* **repository:** hasManyThrough can delete correct target n through based on filter ([c1ba91f](https://github.com/loopbackio/loopback-next/commit/c1ba91f2dcbc33dd1cee905d25f9719a71bc7919))





## [0.12.9](https://github.com/loopbackio/loopback-next/compare/@loopback/repository-tests@0.12.8...@loopback/repository-tests@0.12.9) (2020-06-30)

**Note:** Version bump only for package @loopback/repository-tests





## [0.12.8](https://github.com/loopbackio/loopback-next/compare/@loopback/repository-tests@0.12.7...@loopback/repository-tests@0.12.8) (2020-06-23)


### Bug Fixes

* set node version to >=10.16 to support events.once ([e39da1c](https://github.com/loopbackio/loopback-next/commit/e39da1ca47728eafaf83c10ce35b09b03b6a4edc))





## [0.12.7](https://github.com/loopbackio/loopback-next/compare/@loopback/repository-tests@0.12.6...@loopback/repository-tests@0.12.7) (2020-06-11)

**Note:** Version bump only for package @loopback/repository-tests





## [0.12.6](https://github.com/loopbackio/loopback-next/compare/@loopback/repository-tests@0.12.5...@loopback/repository-tests@0.12.6) (2020-05-28)

**Note:** Version bump only for package @loopback/repository-tests





## [0.12.5](https://github.com/loopbackio/loopback-next/compare/@loopback/repository-tests@0.12.4...@loopback/repository-tests@0.12.5) (2020-05-20)

**Note:** Version bump only for package @loopback/repository-tests





## [0.12.4](https://github.com/loopbackio/loopback-next/compare/@loopback/repository-tests@0.12.3...@loopback/repository-tests@0.12.4) (2020-05-19)

**Note:** Version bump only for package @loopback/repository-tests





## [0.12.3](https://github.com/loopbackio/loopback-next/compare/@loopback/repository-tests@0.12.2...@loopback/repository-tests@0.12.3) (2020-05-07)

**Note:** Version bump only for package @loopback/repository-tests





## [0.12.2](https://github.com/loopbackio/loopback-next/compare/@loopback/repository-tests@0.12.1...@loopback/repository-tests@0.12.2) (2020-04-29)

**Note:** Version bump only for package @loopback/repository-tests





## [0.12.1](https://github.com/loopbackio/loopback-next/compare/@loopback/repository-tests@0.12.0...@loopback/repository-tests@0.12.1) (2020-04-23)

**Note:** Version bump only for package @loopback/repository-tests





# [0.12.0](https://github.com/loopbackio/loopback-next/compare/@loopback/repository-tests@0.11.4...@loopback/repository-tests@0.12.0) (2020-04-22)


### Features

* update package.json and .travis.yml for builds ([cb2b8e6](https://github.com/loopbackio/loopback-next/commit/cb2b8e6a18616dda7783c0193091039d4e608131))





## [0.11.4](https://github.com/loopbackio/loopback-next/compare/@loopback/repository-tests@0.11.3...@loopback/repository-tests@0.11.4) (2020-04-11)

**Note:** Version bump only for package @loopback/repository-tests





## [0.11.3](https://github.com/loopbackio/loopback-next/compare/@loopback/repository-tests@0.11.2...@loopback/repository-tests@0.11.3) (2020-04-08)

**Note:** Version bump only for package @loopback/repository-tests





## [0.11.2](https://github.com/loopbackio/loopback-next/compare/@loopback/repository-tests@0.11.1...@loopback/repository-tests@0.11.2) (2020-03-24)

**Note:** Version bump only for package @loopback/repository-tests





## [0.11.1](https://github.com/loopbackio/loopback-next/compare/@loopback/repository-tests@0.11.0...@loopback/repository-tests@0.11.1) (2020-03-17)


### Bug Fixes

* filter null keys when including belongs-to relations in queries ([cccb37f](https://github.com/loopbackio/loopback-next/commit/cccb37f43f3ccaf950c23759315b4dde41da4e8b))





# [0.11.0](https://github.com/loopbackio/loopback-next/compare/@loopback/repository-tests@0.10.1...@loopback/repository-tests@0.11.0) (2020-03-05)


### chore

* remove support for Node.js v8.x ([4281d9d](https://github.com/loopbackio/loopback-next/commit/4281d9df50f0715d32879e1442a90b643ec8f542))


### Features

* add `tslib` as dependency ([a6e0b4c](https://github.com/loopbackio/loopback-next/commit/a6e0b4ce7b862764167cefedee14c1115b25e0a4)), closes [#4676](https://github.com/loopbackio/loopback-next/issues/4676)
* preserve custom type of auto-generated id property ([dc7ff7f](https://github.com/loopbackio/loopback-next/commit/dc7ff7f7829434de3436e9352b1d9cc43392db0e))


### BREAKING CHANGES

* Node.js v8.x is now end of life. Please upgrade to version
10 and above. See https://nodejs.org/en/about/releases.





## [0.10.1](https://github.com/loopbackio/loopback-next/compare/@loopback/repository-tests@0.10.0...@loopback/repository-tests@0.10.1) (2020-02-06)

**Note:** Version bump only for package @loopback/repository-tests





# [0.10.0](https://github.com/loopbackio/loopback-next/compare/@loopback/repository-tests@0.9.1...@loopback/repository-tests@0.10.0) (2020-02-05)


### Features

* leverage isactive for transaction ([fc94437](https://github.com/loopbackio/loopback-next/commit/fc9443787039d4a1db3008a0141f5693f95bfbd4))





## [0.9.1](https://github.com/loopbackio/loopback-next/compare/@loopback/repository-tests@0.9.0...@loopback/repository-tests@0.9.1) (2020-01-27)


### Bug Fixes

* **repository:** make the navigational property err msg more clear ([2d493bc](https://github.com/loopbackio/loopback-next/commit/2d493bc0387b9f595b82ee149fb83405f4073424))





# [0.9.0](https://github.com/loopbackio/loopback-next/compare/@loopback/repository-tests@0.8.0...@loopback/repository-tests@0.9.0) (2020-01-07)


### Bug Fixes

* **repository:** belongsto accessor should return undefined if foreign key is not included ([cbdba15](https://github.com/loopbackio/loopback-next/commit/cbdba1554fe103109a21e20c48cd3a0edcf8fffb))


### Features

* **repository:** allow custom keyFrom for hasmany/hasone ([58efff9](https://github.com/loopbackio/loopback-next/commit/58efff9e166fbe1fc820fe6168e18b5c7d9630ce))





# [0.8.0](https://github.com/loopbackio/loopback-next/compare/@loopback/repository-tests@0.7.0...@loopback/repository-tests@0.8.0) (2019-12-09)


### Features

* **repository:** enable inclusion with custom scope ([4a0d595](https://github.com/loopbackio/loopback-next/commit/4a0d595f65a2c80c89e2ca1263d235e4d23cd730))
* **repository:** rejects create/update operations for navigational properties ([01de327](https://github.com/loopbackio/loopback-next/commit/01de3275be7c6dd8e9c50ffeb64c23d6d7ec9e51))





# [0.7.0](https://github.com/loopbackio/loopback-next/compare/@loopback/repository-tests@0.6.1...@loopback/repository-tests@0.7.0) (2019-11-25)


### Features

* **repository-tests:** run repository-tests on cloudant ([a54c588](https://github.com/loopbackio/loopback-next/commit/a54c588e3f59b273c22d008bf591184f5339effe))





## [0.6.1](https://github.com/loopbackio/loopback-next/compare/@loopback/repository-tests@0.6.0...@loopback/repository-tests@0.6.1) (2019-11-12)

**Note:** Version bump only for package @loopback/repository-tests





# [0.6.0](https://github.com/loopbackio/loopback-next/compare/@loopback/repository-tests@0.5.2...@loopback/repository-tests@0.6.0) (2019-10-24)


### Features

* **test-repository-postgresql:** run repository tests for postgresql ([8d029c4](https://github.com/loopbackio/loopback-next/commit/8d029c46d97f5486f0a04e7f8c58e2d573b74900))





## [0.5.2](https://github.com/loopbackio/loopback-next/compare/@loopback/repository-tests@0.5.1...@loopback/repository-tests@0.5.2) (2019-10-07)

**Note:** Version bump only for package @loopback/repository-tests





## [0.5.1](https://github.com/loopbackio/loopback-next/compare/@loopback/repository-tests@0.5.0...@loopback/repository-tests@0.5.1) (2019-09-28)

**Note:** Version bump only for package @loopback/repository-tests





# [0.5.0](https://github.com/loopbackio/loopback-next/compare/@loopback/repository-tests@0.4.5...@loopback/repository-tests@0.5.0) (2019-09-27)


### Features

* **repository:** implement inclusion resolver for belongsTo relation ([fc3d5b6](https://github.com/loopbackio/loopback-next/commit/fc3d5b6))
* **repository:** implement inclusion resolver for hasOne relation ([8dfdf58](https://github.com/loopbackio/loopback-next/commit/8dfdf58))
* **repository:** implement inclusionResolver for hasMany ([4cf9a70](https://github.com/loopbackio/loopback-next/commit/4cf9a70))





## [0.4.5](https://github.com/loopbackio/loopback-next/compare/@loopback/repository-tests@0.4.4...@loopback/repository-tests@0.4.5) (2019-09-17)

**Note:** Version bump only for package @loopback/repository-tests





## [0.4.4](https://github.com/loopbackio/loopback-next/compare/@loopback/repository-tests@0.4.3...@loopback/repository-tests@0.4.4) (2019-09-06)

**Note:** Version bump only for package @loopback/repository-tests





## [0.4.3](https://github.com/loopbackio/loopback-next/compare/@loopback/repository-tests@0.4.2...@loopback/repository-tests@0.4.3) (2019-09-03)


### Bug Fixes

* **repository-tests:** unify the usage of MixedIdType for all tests ([0548651](https://github.com/loopbackio/loopback-next/commit/0548651))





## [0.4.2](https://github.com/loopbackio/loopback-next/compare/@loopback/repository-tests@0.4.1...@loopback/repository-tests@0.4.2) (2019-08-19)

**Note:** Version bump only for package @loopback/repository-tests





## [0.4.1](https://github.com/loopbackio/loopback-next/compare/@loopback/repository-tests@0.4.0...@loopback/repository-tests@0.4.1) (2019-08-15)

**Note:** Version bump only for package @loopback/repository-tests





# [0.4.0](https://github.com/loopbackio/loopback-next/compare/@loopback/repository-tests@0.3.1...@loopback/repository-tests@0.4.0) (2019-08-15)


### Features

* **repository:** add function findByForeignKeys ([f5eaf1d](https://github.com/loopbackio/loopback-next/commit/f5eaf1d))
* **repository:** expose beginTransaction() API ([0471315](https://github.com/loopbackio/loopback-next/commit/0471315))





## [0.3.1](https://github.com/loopbackio/loopback-next/compare/@loopback/repository-tests@0.3.0...@loopback/repository-tests@0.3.1) (2019-07-31)

**Note:** Version bump only for package @loopback/repository-tests





# [0.3.0](https://github.com/loopbackio/loopback-next/compare/@loopback/repository-tests@0.2.3...@loopback/repository-tests@0.3.0) (2019-07-26)


### Bug Fixes

* **repository-tests:** refactor import referencing `src` from a different package ([f9cd7e4](https://github.com/loopbackio/loopback-next/commit/f9cd7e4))


### Features

* **repository-tests:** rename CrudConnectorFeatures to CrudFeatures ([2d29b19](https://github.com/loopbackio/loopback-next/commit/2d29b19))
* **repository-tests:** test `replaceById`, verify plain data handling ([5791104](https://github.com/loopbackio/loopback-next/commit/5791104))





## [0.2.3](https://github.com/loopbackio/loopback-next/compare/@loopback/repository-tests@0.2.2...@loopback/repository-tests@0.2.3) (2019-07-17)

**Note:** Version bump only for package @loopback/repository-tests





## [0.2.2](https://github.com/loopbackio/loopback-next/compare/@loopback/repository-tests@0.2.1...@loopback/repository-tests@0.2.2) (2019-06-28)

**Note:** Version bump only for package @loopback/repository-tests





## [0.2.1](https://github.com/loopbackio/loopback-next/compare/@loopback/repository-tests@0.2.0...@loopback/repository-tests@0.2.1) (2019-06-21)

**Note:** Version bump only for package @loopback/repository-tests





# 0.2.0 (2019-06-20)


### Features

* shared Repository test suite ([e9dca4c](https://github.com/loopbackio/loopback-next/commit/e9dca4c))
