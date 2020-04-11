# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.11.4](https://github.com/strongloop/loopback-next/compare/@loopback/repository-tests@0.11.3...@loopback/repository-tests@0.11.4) (2020-04-11)

**Note:** Version bump only for package @loopback/repository-tests





## [0.11.3](https://github.com/strongloop/loopback-next/compare/@loopback/repository-tests@0.11.2...@loopback/repository-tests@0.11.3) (2020-04-08)

**Note:** Version bump only for package @loopback/repository-tests





## [0.11.2](https://github.com/strongloop/loopback-next/compare/@loopback/repository-tests@0.11.1...@loopback/repository-tests@0.11.2) (2020-03-24)

**Note:** Version bump only for package @loopback/repository-tests





## [0.11.1](https://github.com/strongloop/loopback-next/compare/@loopback/repository-tests@0.11.0...@loopback/repository-tests@0.11.1) (2020-03-17)


### Bug Fixes

* filter null keys when including belongs-to relations in queries ([cccb37f](https://github.com/strongloop/loopback-next/commit/cccb37f43f3ccaf950c23759315b4dde41da4e8b))





# [0.11.0](https://github.com/strongloop/loopback-next/compare/@loopback/repository-tests@0.10.1...@loopback/repository-tests@0.11.0) (2020-03-05)


### chore

* remove support for Node.js v8.x ([4281d9d](https://github.com/strongloop/loopback-next/commit/4281d9df50f0715d32879e1442a90b643ec8f542))


### Features

* add `tslib` as dependency ([a6e0b4c](https://github.com/strongloop/loopback-next/commit/a6e0b4ce7b862764167cefedee14c1115b25e0a4)), closes [#4676](https://github.com/strongloop/loopback-next/issues/4676)
* preserve custom type of auto-generated id property ([dc7ff7f](https://github.com/strongloop/loopback-next/commit/dc7ff7f7829434de3436e9352b1d9cc43392db0e))


### BREAKING CHANGES

* Node.js v8.x is now end of life. Please upgrade to version
10 and above. See https://nodejs.org/en/about/releases.





## [0.10.1](https://github.com/strongloop/loopback-next/compare/@loopback/repository-tests@0.10.0...@loopback/repository-tests@0.10.1) (2020-02-06)

**Note:** Version bump only for package @loopback/repository-tests





# [0.10.0](https://github.com/strongloop/loopback-next/compare/@loopback/repository-tests@0.9.1...@loopback/repository-tests@0.10.0) (2020-02-05)


### Features

* leverage isactive for transaction ([fc94437](https://github.com/strongloop/loopback-next/commit/fc9443787039d4a1db3008a0141f5693f95bfbd4))





## [0.9.1](https://github.com/strongloop/loopback-next/compare/@loopback/repository-tests@0.9.0...@loopback/repository-tests@0.9.1) (2020-01-27)


### Bug Fixes

* **repository:** make the navigational property err msg more clear ([2d493bc](https://github.com/strongloop/loopback-next/commit/2d493bc0387b9f595b82ee149fb83405f4073424))





# [0.9.0](https://github.com/strongloop/loopback-next/compare/@loopback/repository-tests@0.8.0...@loopback/repository-tests@0.9.0) (2020-01-07)


### Bug Fixes

* **repository:** belongsto accessor should return undefined if foreign key is not included ([cbdba15](https://github.com/strongloop/loopback-next/commit/cbdba1554fe103109a21e20c48cd3a0edcf8fffb))


### Features

* **repository:** allow custom keyFrom for hasmany/hasone ([58efff9](https://github.com/strongloop/loopback-next/commit/58efff9e166fbe1fc820fe6168e18b5c7d9630ce))





# [0.8.0](https://github.com/strongloop/loopback-next/compare/@loopback/repository-tests@0.7.0...@loopback/repository-tests@0.8.0) (2019-12-09)


### Features

* **repository:** enable inclusion with custom scope ([4a0d595](https://github.com/strongloop/loopback-next/commit/4a0d595f65a2c80c89e2ca1263d235e4d23cd730))
* **repository:** rejects create/update operations for navigational properties ([01de327](https://github.com/strongloop/loopback-next/commit/01de3275be7c6dd8e9c50ffeb64c23d6d7ec9e51))





# [0.7.0](https://github.com/strongloop/loopback-next/compare/@loopback/repository-tests@0.6.1...@loopback/repository-tests@0.7.0) (2019-11-25)


### Features

* **repository-tests:** run repository-tests on cloudant ([a54c588](https://github.com/strongloop/loopback-next/commit/a54c588e3f59b273c22d008bf591184f5339effe))





## [0.6.1](https://github.com/strongloop/loopback-next/compare/@loopback/repository-tests@0.6.0...@loopback/repository-tests@0.6.1) (2019-11-12)

**Note:** Version bump only for package @loopback/repository-tests





# [0.6.0](https://github.com/strongloop/loopback-next/compare/@loopback/repository-tests@0.5.2...@loopback/repository-tests@0.6.0) (2019-10-24)


### Features

* **test-repository-postgresql:** run repository tests for postgresql ([8d029c4](https://github.com/strongloop/loopback-next/commit/8d029c46d97f5486f0a04e7f8c58e2d573b74900))





## [0.5.2](https://github.com/strongloop/loopback-next/compare/@loopback/repository-tests@0.5.1...@loopback/repository-tests@0.5.2) (2019-10-07)

**Note:** Version bump only for package @loopback/repository-tests





## [0.5.1](https://github.com/strongloop/loopback-next/compare/@loopback/repository-tests@0.5.0...@loopback/repository-tests@0.5.1) (2019-09-28)

**Note:** Version bump only for package @loopback/repository-tests





# [0.5.0](https://github.com/strongloop/loopback-next/compare/@loopback/repository-tests@0.4.5...@loopback/repository-tests@0.5.0) (2019-09-27)


### Features

* **repository:** implement inclusion resolver for belongsTo relation ([fc3d5b6](https://github.com/strongloop/loopback-next/commit/fc3d5b6))
* **repository:** implement inclusion resolver for hasOne relation ([8dfdf58](https://github.com/strongloop/loopback-next/commit/8dfdf58))
* **repository:** implement inclusionResolver for hasMany ([4cf9a70](https://github.com/strongloop/loopback-next/commit/4cf9a70))





## [0.4.5](https://github.com/strongloop/loopback-next/compare/@loopback/repository-tests@0.4.4...@loopback/repository-tests@0.4.5) (2019-09-17)

**Note:** Version bump only for package @loopback/repository-tests





## [0.4.4](https://github.com/strongloop/loopback-next/compare/@loopback/repository-tests@0.4.3...@loopback/repository-tests@0.4.4) (2019-09-06)

**Note:** Version bump only for package @loopback/repository-tests





## [0.4.3](https://github.com/strongloop/loopback-next/compare/@loopback/repository-tests@0.4.2...@loopback/repository-tests@0.4.3) (2019-09-03)


### Bug Fixes

* **repository-tests:** unify the usage of MixedIdType for all tests ([0548651](https://github.com/strongloop/loopback-next/commit/0548651))





## [0.4.2](https://github.com/strongloop/loopback-next/compare/@loopback/repository-tests@0.4.1...@loopback/repository-tests@0.4.2) (2019-08-19)

**Note:** Version bump only for package @loopback/repository-tests





## [0.4.1](https://github.com/strongloop/loopback-next/compare/@loopback/repository-tests@0.4.0...@loopback/repository-tests@0.4.1) (2019-08-15)

**Note:** Version bump only for package @loopback/repository-tests





# [0.4.0](https://github.com/strongloop/loopback-next/compare/@loopback/repository-tests@0.3.1...@loopback/repository-tests@0.4.0) (2019-08-15)


### Features

* **repository:** add function findByForeignKeys ([f5eaf1d](https://github.com/strongloop/loopback-next/commit/f5eaf1d))
* **repository:** expose beginTransaction() API ([0471315](https://github.com/strongloop/loopback-next/commit/0471315))





## [0.3.1](https://github.com/strongloop/loopback-next/compare/@loopback/repository-tests@0.3.0...@loopback/repository-tests@0.3.1) (2019-07-31)

**Note:** Version bump only for package @loopback/repository-tests





# [0.3.0](https://github.com/strongloop/loopback-next/compare/@loopback/repository-tests@0.2.3...@loopback/repository-tests@0.3.0) (2019-07-26)


### Bug Fixes

* **repository-tests:** refactor import referencing `src` from a different package ([f9cd7e4](https://github.com/strongloop/loopback-next/commit/f9cd7e4))


### Features

* **repository-tests:** rename CrudConnectorFeatures to CrudFeatures ([2d29b19](https://github.com/strongloop/loopback-next/commit/2d29b19))
* **repository-tests:** test `replaceById`, verify plain data handling ([5791104](https://github.com/strongloop/loopback-next/commit/5791104))





## [0.2.3](https://github.com/strongloop/loopback-next/compare/@loopback/repository-tests@0.2.2...@loopback/repository-tests@0.2.3) (2019-07-17)

**Note:** Version bump only for package @loopback/repository-tests





## [0.2.2](https://github.com/strongloop/loopback-next/compare/@loopback/repository-tests@0.2.1...@loopback/repository-tests@0.2.2) (2019-06-28)

**Note:** Version bump only for package @loopback/repository-tests





## [0.2.1](https://github.com/strongloop/loopback-next/compare/@loopback/repository-tests@0.2.0...@loopback/repository-tests@0.2.1) (2019-06-21)

**Note:** Version bump only for package @loopback/repository-tests





# 0.2.0 (2019-06-20)


### Features

* shared Repository test suite ([e9dca4c](https://github.com/strongloop/loopback-next/commit/e9dca4c))
