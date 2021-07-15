# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.8.2](https://github.com/loopbackio/loopback-next/compare/@loopback/health@0.8.1...@loopback/health@0.8.2) (2021-07-15)

**Note:** Version bump only for package @loopback/health





## [0.8.1](https://github.com/loopbackio/loopback-next/compare/@loopback/health@0.8.0...@loopback/health@0.8.1) (2021-06-10)

**Note:** Version bump only for package @loopback/health





# [0.8.0](https://github.com/loopbackio/loopback-next/compare/@loopback/health@0.7.1...@loopback/health@0.8.0) (2021-05-03)


### Features

* support node v16 ([ac99415](https://github.com/loopbackio/loopback-next/commit/ac994154543bde22b4482ba98813351656db1b55))





## [0.7.1](https://github.com/loopbackio/loopback-next/compare/@loopback/health@0.7.0...@loopback/health@0.7.1) (2021-04-06)

**Note:** Version bump only for package @loopback/health





# [0.7.0](https://github.com/loopbackio/loopback-next/compare/@loopback/health@0.6.4...@loopback/health@0.7.0) (2021-03-18)


### Features

* update package-lock.json to v2 consistently ([dfc3fbd](https://github.com/loopbackio/loopback-next/commit/dfc3fbdae0c9ca9f34c64154a471bef22d5ac6b7))





## [0.6.4](https://github.com/loopbackio/loopback-next/compare/@loopback/health@0.6.3...@loopback/health@0.6.4) (2021-02-09)

**Note:** Version bump only for package @loopback/health





## [0.6.3](https://github.com/loopbackio/loopback-next/compare/@loopback/health@0.6.2...@loopback/health@0.6.3) (2021-01-21)

**Note:** Version bump only for package @loopback/health





## [0.6.2](https://github.com/loopbackio/loopback-next/compare/@loopback/health@0.6.1...@loopback/health@0.6.2) (2020-12-07)

**Note:** Version bump only for package @loopback/health





## [0.6.1](https://github.com/loopbackio/loopback-next/compare/@loopback/health@0.6.0...@loopback/health@0.6.1) (2020-11-18)

**Note:** Version bump only for package @loopback/health





# [0.6.0](https://github.com/loopbackio/loopback-next/compare/@loopback/health@0.5.2...@loopback/health@0.6.0) (2020-11-05)


### Bug Fixes

* **health:** fix http status code for health endpoints ([fdca8c0](https://github.com/loopbackio/loopback-next/commit/fdca8c0857ed76ae725b4634b33a2e43dffb1063))


### Features

* **health:** add option to enable/disable openapi spec ([7227ab7](https://github.com/loopbackio/loopback-next/commit/7227ab736e7f661d8b5f3227b4c78cc5ca5d6da6))





## [0.5.2](https://github.com/loopbackio/loopback-next/compare/@loopback/health@0.5.1...@loopback/health@0.5.2) (2020-10-07)

**Note:** Version bump only for package @loopback/health





## [0.5.1](https://github.com/loopbackio/loopback-next/compare/@loopback/health@0.5.0...@loopback/health@0.5.1) (2020-09-17)

**Note:** Version bump only for package @loopback/health





# 0.5.0 (2020-09-15)


### Bug Fixes

* **extension-health:** unregister signal listener to avoid potential memory leak ([731c987](https://github.com/loopbackio/loopback-next/commit/731c987fd0e82946115379f6b38d51ac1e64e877))
* set node version to >=10.16 to support events.once ([e39da1c](https://github.com/loopbackio/loopback-next/commit/e39da1ca47728eafaf83c10ce35b09b03b6a4edc))


### chore

* remove support for Node.js v8.x ([4281d9d](https://github.com/loopbackio/loopback-next/commit/4281d9df50f0715d32879e1442a90b643ec8f542))


### Features

* add `tslib` as dependency ([a6e0b4c](https://github.com/loopbackio/loopback-next/commit/a6e0b4ce7b862764167cefedee14c1115b25e0a4)), closes [#4676](https://github.com/loopbackio/loopback-next/issues/4676)
* move framework packages to `peerDependencies` ([d8f72e4](https://github.com/loopbackio/loopback-next/commit/d8f72e4e9085aa132bfac3e930f3960042816f2a))
* update package.json and .travis.yml for builds ([cb2b8e6](https://github.com/loopbackio/loopback-next/commit/cb2b8e6a18616dda7783c0193091039d4e608131))
* **extension-health:** add a component to run health checks ([5e2fec8](https://github.com/loopbackio/loopback-next/commit/5e2fec8705d8e3af757c2785aa4f8fdb8ba3705b))


### BREAKING CHANGES

* Extensions no longer install framework packages as
their own dependencies, they use the framework packages provided by the
target application instead.

If you are getting `npm install` errors after upgrade, then make sure
your project lists all dependencies required by the extensions you are
using.

Signed-off-by: Miroslav Bajtoš <mbajtoss@gmail.com>
* Node.js v8.x is now end of life. Please upgrade to version
10 and above. See https://nodejs.org/en/about/releases.





## [0.4.13](https://github.com/loopbackio/loopback-next/compare/@loopback/extension-health@0.4.12...@loopback/extension-health@0.4.13) (2020-08-27)

**Note:** Version bump only for package @loopback/extension-health





## [0.4.12](https://github.com/loopbackio/loopback-next/compare/@loopback/extension-health@0.4.11...@loopback/extension-health@0.4.12) (2020-08-19)

**Note:** Version bump only for package @loopback/extension-health





## [0.4.11](https://github.com/loopbackio/loopback-next/compare/@loopback/extension-health@0.4.10...@loopback/extension-health@0.4.11) (2020-08-05)

**Note:** Version bump only for package @loopback/extension-health





## [0.4.10](https://github.com/loopbackio/loopback-next/compare/@loopback/extension-health@0.4.9...@loopback/extension-health@0.4.10) (2020-07-20)

**Note:** Version bump only for package @loopback/extension-health





## [0.4.9](https://github.com/loopbackio/loopback-next/compare/@loopback/extension-health@0.4.8...@loopback/extension-health@0.4.9) (2020-06-30)

**Note:** Version bump only for package @loopback/extension-health





## [0.4.8](https://github.com/loopbackio/loopback-next/compare/@loopback/extension-health@0.4.7...@loopback/extension-health@0.4.8) (2020-06-23)


### Bug Fixes

* set node version to >=10.16 to support events.once ([e39da1c](https://github.com/loopbackio/loopback-next/commit/e39da1ca47728eafaf83c10ce35b09b03b6a4edc))





## [0.4.7](https://github.com/loopbackio/loopback-next/compare/@loopback/extension-health@0.4.6...@loopback/extension-health@0.4.7) (2020-06-11)

**Note:** Version bump only for package @loopback/extension-health





## [0.4.6](https://github.com/loopbackio/loopback-next/compare/@loopback/extension-health@0.4.5...@loopback/extension-health@0.4.6) (2020-05-28)

**Note:** Version bump only for package @loopback/extension-health





## [0.4.5](https://github.com/loopbackio/loopback-next/compare/@loopback/extension-health@0.4.4...@loopback/extension-health@0.4.5) (2020-05-20)

**Note:** Version bump only for package @loopback/extension-health





## [0.4.4](https://github.com/loopbackio/loopback-next/compare/@loopback/extension-health@0.4.3...@loopback/extension-health@0.4.4) (2020-05-19)

**Note:** Version bump only for package @loopback/extension-health





## [0.4.3](https://github.com/loopbackio/loopback-next/compare/@loopback/extension-health@0.4.2...@loopback/extension-health@0.4.3) (2020-05-07)

**Note:** Version bump only for package @loopback/extension-health





## [0.4.2](https://github.com/loopbackio/loopback-next/compare/@loopback/extension-health@0.4.1...@loopback/extension-health@0.4.2) (2020-04-29)

**Note:** Version bump only for package @loopback/extension-health





## [0.4.1](https://github.com/loopbackio/loopback-next/compare/@loopback/extension-health@0.4.0...@loopback/extension-health@0.4.1) (2020-04-23)

**Note:** Version bump only for package @loopback/extension-health





# [0.4.0](https://github.com/loopbackio/loopback-next/compare/@loopback/extension-health@0.3.4...@loopback/extension-health@0.4.0) (2020-04-22)


### Features

* update package.json and .travis.yml for builds ([cb2b8e6](https://github.com/loopbackio/loopback-next/commit/cb2b8e6a18616dda7783c0193091039d4e608131))





## [0.3.4](https://github.com/loopbackio/loopback-next/compare/@loopback/extension-health@0.3.3...@loopback/extension-health@0.3.4) (2020-04-11)

**Note:** Version bump only for package @loopback/extension-health





## [0.3.3](https://github.com/loopbackio/loopback-next/compare/@loopback/extension-health@0.3.2...@loopback/extension-health@0.3.3) (2020-04-08)

**Note:** Version bump only for package @loopback/extension-health





## [0.3.2](https://github.com/loopbackio/loopback-next/compare/@loopback/extension-health@0.3.1...@loopback/extension-health@0.3.2) (2020-03-24)

**Note:** Version bump only for package @loopback/extension-health





## [0.3.1](https://github.com/loopbackio/loopback-next/compare/@loopback/extension-health@0.3.0...@loopback/extension-health@0.3.1) (2020-03-17)

**Note:** Version bump only for package @loopback/extension-health





# [0.3.0](https://github.com/loopbackio/loopback-next/compare/@loopback/extension-health@0.2.17...@loopback/extension-health@0.3.0) (2020-03-05)


### chore

* remove support for Node.js v8.x ([4281d9d](https://github.com/loopbackio/loopback-next/commit/4281d9df50f0715d32879e1442a90b643ec8f542))


### Features

* add `tslib` as dependency ([a6e0b4c](https://github.com/loopbackio/loopback-next/commit/a6e0b4ce7b862764167cefedee14c1115b25e0a4)), closes [#4676](https://github.com/loopbackio/loopback-next/issues/4676)


### BREAKING CHANGES

* Node.js v8.x is now end of life. Please upgrade to version
10 and above. See https://nodejs.org/en/about/releases.





## [0.2.17](https://github.com/loopbackio/loopback-next/compare/@loopback/extension-health@0.2.16...@loopback/extension-health@0.2.17) (2020-02-06)

**Note:** Version bump only for package @loopback/extension-health





## [0.2.16](https://github.com/loopbackio/loopback-next/compare/@loopback/extension-health@0.2.15...@loopback/extension-health@0.2.16) (2020-02-05)

**Note:** Version bump only for package @loopback/extension-health





## [0.2.15](https://github.com/loopbackio/loopback-next/compare/@loopback/extension-health@0.2.14...@loopback/extension-health@0.2.15) (2020-01-27)

**Note:** Version bump only for package @loopback/extension-health





## [0.2.14](https://github.com/loopbackio/loopback-next/compare/@loopback/extension-health@0.2.13...@loopback/extension-health@0.2.14) (2020-01-07)

**Note:** Version bump only for package @loopback/extension-health





## [0.2.13](https://github.com/loopbackio/loopback-next/compare/@loopback/extension-health@0.2.12...@loopback/extension-health@0.2.13) (2019-12-09)

**Note:** Version bump only for package @loopback/extension-health





## [0.2.12](https://github.com/loopbackio/loopback-next/compare/@loopback/extension-health@0.2.11...@loopback/extension-health@0.2.12) (2019-11-25)

**Note:** Version bump only for package @loopback/extension-health





## [0.2.11](https://github.com/loopbackio/loopback-next/compare/@loopback/extension-health@0.2.10...@loopback/extension-health@0.2.11) (2019-11-12)

**Note:** Version bump only for package @loopback/extension-health





## [0.2.10](https://github.com/loopbackio/loopback-next/compare/@loopback/extension-health@0.2.9...@loopback/extension-health@0.2.10) (2019-10-24)

**Note:** Version bump only for package @loopback/extension-health





## [0.2.9](https://github.com/loopbackio/loopback-next/compare/@loopback/extension-health@0.2.8...@loopback/extension-health@0.2.9) (2019-10-07)

**Note:** Version bump only for package @loopback/extension-health





## [0.2.8](https://github.com/loopbackio/loopback-next/compare/@loopback/extension-health@0.2.7...@loopback/extension-health@0.2.8) (2019-09-28)

**Note:** Version bump only for package @loopback/extension-health





## [0.2.7](https://github.com/loopbackio/loopback-next/compare/@loopback/extension-health@0.2.6...@loopback/extension-health@0.2.7) (2019-09-27)

**Note:** Version bump only for package @loopback/extension-health





## [0.2.6](https://github.com/loopbackio/loopback-next/compare/@loopback/extension-health@0.2.5...@loopback/extension-health@0.2.6) (2019-09-17)

**Note:** Version bump only for package @loopback/extension-health





## [0.2.5](https://github.com/loopbackio/loopback-next/compare/@loopback/extension-health@0.2.4...@loopback/extension-health@0.2.5) (2019-09-06)

**Note:** Version bump only for package @loopback/extension-health





## [0.2.4](https://github.com/loopbackio/loopback-next/compare/@loopback/extension-health@0.2.3...@loopback/extension-health@0.2.4) (2019-09-03)

**Note:** Version bump only for package @loopback/extension-health





## [0.2.3](https://github.com/loopbackio/loopback-next/compare/@loopback/extension-health@0.2.2...@loopback/extension-health@0.2.3) (2019-08-19)

**Note:** Version bump only for package @loopback/extension-health





## [0.2.2](https://github.com/loopbackio/loopback-next/compare/@loopback/extension-health@0.2.1...@loopback/extension-health@0.2.2) (2019-08-15)

**Note:** Version bump only for package @loopback/extension-health





## [0.2.1](https://github.com/loopbackio/loopback-next/compare/@loopback/extension-health@0.2.0...@loopback/extension-health@0.2.1) (2019-08-15)

**Note:** Version bump only for package @loopback/extension-health





# 0.2.0 (2019-07-31)


### Features

* **extension-health:** add a component to run health checks ([5e2fec8](https://github.com/loopbackio/loopback-next/commit/5e2fec8))
