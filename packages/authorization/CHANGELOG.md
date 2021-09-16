# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.9.3](https://github.com/loopbackio/loopback-next/compare/@loopback/authorization@0.9.2...@loopback/authorization@0.9.3) (2021-09-16)

**Note:** Version bump only for package @loopback/authorization





## [0.9.2](https://github.com/loopbackio/loopback-next/compare/@loopback/authorization@0.9.1...@loopback/authorization@0.9.2) (2021-07-15)

**Note:** Version bump only for package @loopback/authorization





## [0.9.1](https://github.com/loopbackio/loopback-next/compare/@loopback/authorization@0.9.0...@loopback/authorization@0.9.1) (2021-06-10)

**Note:** Version bump only for package @loopback/authorization





# [0.9.0](https://github.com/loopbackio/loopback-next/compare/@loopback/authorization@0.8.1...@loopback/authorization@0.9.0) (2021-05-03)


### Features

* support node v16 ([ac99415](https://github.com/loopbackio/loopback-next/commit/ac994154543bde22b4482ba98813351656db1b55))





## [0.8.1](https://github.com/loopbackio/loopback-next/compare/@loopback/authorization@0.8.0...@loopback/authorization@0.8.1) (2021-04-06)

**Note:** Version bump only for package @loopback/authorization





# [0.8.0](https://github.com/loopbackio/loopback-next/compare/@loopback/authorization@0.7.7...@loopback/authorization@0.8.0) (2021-03-18)


### Features

* update package-lock.json to v2 consistently ([dfc3fbd](https://github.com/loopbackio/loopback-next/commit/dfc3fbdae0c9ca9f34c64154a471bef22d5ac6b7))





## [0.7.7](https://github.com/loopbackio/loopback-next/compare/@loopback/authorization@0.7.6...@loopback/authorization@0.7.7) (2021-02-09)


### Bug Fixes

* **authorization:** allow `[@authorize](https://github.com/authorize).skip` and other metadata for subclasses ([f54979e](https://github.com/loopbackio/loopback-next/commit/f54979e0eef95b4bf7094548dac32649c33307cf))





## [0.7.6](https://github.com/loopbackio/loopback-next/compare/@loopback/authorization@0.7.5...@loopback/authorization@0.7.6) (2021-01-21)

**Note:** Version bump only for package @loopback/authorization





## [0.7.5](https://github.com/loopbackio/loopback-next/compare/@loopback/authorization@0.7.4...@loopback/authorization@0.7.5) (2020-12-07)

**Note:** Version bump only for package @loopback/authorization





## [0.7.4](https://github.com/loopbackio/loopback-next/compare/@loopback/authorization@0.7.3...@loopback/authorization@0.7.4) (2020-11-18)

**Note:** Version bump only for package @loopback/authorization





## [0.7.3](https://github.com/loopbackio/loopback-next/compare/@loopback/authorization@0.7.2...@loopback/authorization@0.7.3) (2020-11-05)

**Note:** Version bump only for package @loopback/authorization





## [0.7.2](https://github.com/loopbackio/loopback-next/compare/@loopback/authorization@0.7.1...@loopback/authorization@0.7.2) (2020-10-07)

**Note:** Version bump only for package @loopback/authorization





## [0.7.1](https://github.com/loopbackio/loopback-next/compare/@loopback/authorization@0.7.0...@loopback/authorization@0.7.1) (2020-09-17)

**Note:** Version bump only for package @loopback/authorization





# [0.7.0](https://github.com/loopbackio/loopback-next/compare/@loopback/authorization@0.6.6...@loopback/authorization@0.7.0) (2020-09-15)


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





## [0.6.6](https://github.com/loopbackio/loopback-next/compare/@loopback/authorization@0.6.5...@loopback/authorization@0.6.6) (2020-08-27)

**Note:** Version bump only for package @loopback/authorization





## [0.6.5](https://github.com/loopbackio/loopback-next/compare/@loopback/authorization@0.6.4...@loopback/authorization@0.6.5) (2020-08-19)

**Note:** Version bump only for package @loopback/authorization





## [0.6.4](https://github.com/loopbackio/loopback-next/compare/@loopback/authorization@0.6.3...@loopback/authorization@0.6.4) (2020-08-05)

**Note:** Version bump only for package @loopback/authorization





## [0.6.3](https://github.com/loopbackio/loopback-next/compare/@loopback/authorization@0.6.2...@loopback/authorization@0.6.3) (2020-07-20)

**Note:** Version bump only for package @loopback/authorization





## [0.6.2](https://github.com/loopbackio/loopback-next/compare/@loopback/authorization@0.6.1...@loopback/authorization@0.6.2) (2020-06-30)

**Note:** Version bump only for package @loopback/authorization





## [0.6.1](https://github.com/loopbackio/loopback-next/compare/@loopback/authorization@0.6.0...@loopback/authorization@0.6.1) (2020-06-23)


### Bug Fixes

* set node version to >=10.16 to support events.once ([e39da1c](https://github.com/loopbackio/loopback-next/commit/e39da1ca47728eafaf83c10ce35b09b03b6a4edc))





# [0.6.0](https://github.com/loopbackio/loopback-next/compare/@loopback/authorization@0.5.11...@loopback/authorization@0.6.0) (2020-06-11)


### Bug Fixes

* **authorization:** set default HTTP status code for authorization error to 403 as per RFC 7231 ([0eb124b](https://github.com/loopbackio/loopback-next/commit/0eb124b068ece35e0129bcdfa1bd551250fe5303))


### BREAKING CHANGES

* **authorization:** We now use http status code `403` instead of `401` to report authorization denied. The default status code can be set via `defaultStatusCodeForDeny` for the authorization options.





## [0.5.11](https://github.com/loopbackio/loopback-next/compare/@loopback/authorization@0.5.10...@loopback/authorization@0.5.11) (2020-05-28)

**Note:** Version bump only for package @loopback/authorization





## [0.5.10](https://github.com/loopbackio/loopback-next/compare/@loopback/authorization@0.5.9...@loopback/authorization@0.5.10) (2020-05-20)

**Note:** Version bump only for package @loopback/authorization





## [0.5.9](https://github.com/loopbackio/loopback-next/compare/@loopback/authorization@0.5.8...@loopback/authorization@0.5.9) (2020-05-19)

**Note:** Version bump only for package @loopback/authorization





## [0.5.8](https://github.com/loopbackio/loopback-next/compare/@loopback/authorization@0.5.7...@loopback/authorization@0.5.8) (2020-05-07)

**Note:** Version bump only for package @loopback/authorization





## [0.5.7](https://github.com/loopbackio/loopback-next/compare/@loopback/authorization@0.5.6...@loopback/authorization@0.5.7) (2020-04-29)

**Note:** Version bump only for package @loopback/authorization





## [0.5.6](https://github.com/loopbackio/loopback-next/compare/@loopback/authorization@0.5.5...@loopback/authorization@0.5.6) (2020-04-23)

**Note:** Version bump only for package @loopback/authorization





## [0.5.5](https://github.com/loopbackio/loopback-next/compare/@loopback/authorization@0.5.4...@loopback/authorization@0.5.5) (2020-04-22)

**Note:** Version bump only for package @loopback/authorization





## [0.5.4](https://github.com/loopbackio/loopback-next/compare/@loopback/authorization@0.5.3...@loopback/authorization@0.5.4) (2020-04-11)

**Note:** Version bump only for package @loopback/authorization





## [0.5.3](https://github.com/loopbackio/loopback-next/compare/@loopback/authorization@0.5.2...@loopback/authorization@0.5.3) (2020-04-08)

**Note:** Version bump only for package @loopback/authorization





## [0.5.2](https://github.com/loopbackio/loopback-next/compare/@loopback/authorization@0.5.1...@loopback/authorization@0.5.2) (2020-03-24)

**Note:** Version bump only for package @loopback/authorization





## [0.5.1](https://github.com/loopbackio/loopback-next/compare/@loopback/authorization@0.5.0...@loopback/authorization@0.5.1) (2020-03-17)

**Note:** Version bump only for package @loopback/authorization





# [0.5.0](https://github.com/loopbackio/loopback-next/compare/@loopback/authorization@0.4.10...@loopback/authorization@0.5.0) (2020-03-05)


### Bug Fixes

* **authorization:** fix sample code in README ([d2f1662](https://github.com/loopbackio/loopback-next/commit/d2f1662a1d372f435794985310985177387974a2))


### chore

* remove support for Node.js v8.x ([4281d9d](https://github.com/loopbackio/loopback-next/commit/4281d9df50f0715d32879e1442a90b643ec8f542))


### Features

* add `tslib` as dependency ([a6e0b4c](https://github.com/loopbackio/loopback-next/commit/a6e0b4ce7b862764167cefedee14c1115b25e0a4)), closes [#4676](https://github.com/loopbackio/loopback-next/issues/4676)


### BREAKING CHANGES

* Node.js v8.x is now end of life. Please upgrade to version
10 and above. See https://nodejs.org/en/about/releases.





## [0.4.10](https://github.com/loopbackio/loopback-next/compare/@loopback/authorization@0.4.9...@loopback/authorization@0.4.10) (2020-02-06)

**Note:** Version bump only for package @loopback/authorization





## [0.4.9](https://github.com/loopbackio/loopback-next/compare/@loopback/authorization@0.4.8...@loopback/authorization@0.4.9) (2020-02-05)


### Bug Fixes

* **authorization:** make sure an authorizer is only invoked once per request ([b29bbeb](https://github.com/loopbackio/loopback-next/commit/b29bbeb35c0c34784aae683fe03003a3b239cb87))





## [0.4.8](https://github.com/loopbackio/loopback-next/compare/@loopback/authorization@0.4.7...@loopback/authorization@0.4.8) (2020-01-27)


### Bug Fixes

* update authorization doc ([52a6d71](https://github.com/loopbackio/loopback-next/commit/52a6d71c078f98de19c421587e7fe97e812414c8))





## [0.4.7](https://github.com/loopbackio/loopback-next/compare/@loopback/authorization@0.4.6...@loopback/authorization@0.4.7) (2020-01-07)

**Note:** Version bump only for package @loopback/authorization





## [0.4.6](https://github.com/loopbackio/loopback-next/compare/@loopback/authorization@0.4.5...@loopback/authorization@0.4.6) (2019-12-09)

**Note:** Version bump only for package @loopback/authorization





## [0.4.5](https://github.com/loopbackio/loopback-next/compare/@loopback/authorization@0.4.4...@loopback/authorization@0.4.5) (2019-11-25)

**Note:** Version bump only for package @loopback/authorization





## [0.4.4](https://github.com/loopbackio/loopback-next/compare/@loopback/authorization@0.4.3...@loopback/authorization@0.4.4) (2019-11-12)

**Note:** Version bump only for package @loopback/authorization





## [0.4.3](https://github.com/loopbackio/loopback-next/compare/@loopback/authorization@0.4.2...@loopback/authorization@0.4.3) (2019-10-24)

**Note:** Version bump only for package @loopback/authorization





## [0.4.2](https://github.com/loopbackio/loopback-next/compare/@loopback/authorization@0.4.1...@loopback/authorization@0.4.2) (2019-10-07)

**Note:** Version bump only for package @loopback/authorization





## [0.4.1](https://github.com/loopbackio/loopback-next/compare/@loopback/authorization@0.4.0...@loopback/authorization@0.4.1) (2019-09-28)

**Note:** Version bump only for package @loopback/authorization





# [0.4.0](https://github.com/loopbackio/loopback-next/compare/@loopback/authorization@0.3.0...@loopback/authorization@0.4.0) (2019-09-27)


### Bug Fixes

* user profile to principal ([1c9709a](https://github.com/loopbackio/loopback-next/commit/1c9709a))


### Features

* **authorization:** add `authorize.skip` to skip authorization ([757ee16](https://github.com/loopbackio/loopback-next/commit/757ee16))





# [0.3.0](https://github.com/loopbackio/loopback-next/compare/@loopback/authorization@0.2.2...@loopback/authorization@0.3.0) (2019-09-17)


### Features

* **authorization:** add support for default authorization metadata ([7034bb0](https://github.com/loopbackio/loopback-next/commit/7034bb0))





## [0.2.2](https://github.com/loopbackio/loopback-next/compare/@loopback/authorization@0.2.1...@loopback/authorization@0.2.2) (2019-09-06)

**Note:** Version bump only for package @loopback/authorization





## [0.2.1](https://github.com/loopbackio/loopback-next/compare/@loopback/authorization@0.2.0...@loopback/authorization@0.2.1) (2019-09-03)

**Note:** Version bump only for package @loopback/authorization





# [0.2.0](https://github.com/loopbackio/loopback-next/compare/@loopback/authorization@0.1.2...@loopback/authorization@0.2.0) (2019-08-19)


### Features

* **authorization:** add options to improve decision making ([ce59488](https://github.com/loopbackio/loopback-next/commit/ce59488))





## [0.1.2](https://github.com/loopbackio/loopback-next/compare/@loopback/authorization@0.1.1...@loopback/authorization@0.1.2) (2019-08-15)

**Note:** Version bump only for package @loopback/authorization





## [0.1.1](https://github.com/loopbackio/loopback-next/compare/@loopback/authorization@0.1.0...@loopback/authorization@0.1.1) (2019-08-15)

**Note:** Version bump only for package @loopback/authorization





# 0.1.0 (2019-08-15)


### Features

* **authorization:** add an acceptance to demonstrate casbin integration ([26bd1e7](https://github.com/loopbackio/loopback-next/commit/26bd1e7))
* **authorization:** allows [@authorize](https://github.com/authorize) decorator to be applied at class level ([6f34d7f](https://github.com/loopbackio/loopback-next/commit/6f34d7f))
* add authorization component ([ce0b2da](https://github.com/loopbackio/loopback-next/commit/ce0b2da))
