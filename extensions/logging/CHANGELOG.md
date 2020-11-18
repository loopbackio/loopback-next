# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.4.4](https://github.com/strongloop/loopback-next/compare/@loopback/logging@0.4.3...@loopback/logging@0.4.4) (2020-11-18)

**Note:** Version bump only for package @loopback/logging





## [0.4.3](https://github.com/strongloop/loopback-next/compare/@loopback/logging@0.4.2...@loopback/logging@0.4.3) (2020-11-05)

**Note:** Version bump only for package @loopback/logging





## [0.4.2](https://github.com/strongloop/loopback-next/compare/@loopback/logging@0.4.1...@loopback/logging@0.4.2) (2020-10-07)

**Note:** Version bump only for package @loopback/logging





## [0.4.1](https://github.com/strongloop/loopback-next/compare/@loopback/logging@0.4.0...@loopback/logging@0.4.1) (2020-09-17)

**Note:** Version bump only for package @loopback/logging





# 0.4.0 (2020-09-15)


### Bug Fixes

* **extension-logging:** fix typing for winston Logger ([b451daf](https://github.com/strongloop/loopback-next/commit/b451daf33c9040a505073b0b1366863d153498f8))
* set node version to >=10.16 to support events.once ([e39da1c](https://github.com/strongloop/loopback-next/commit/e39da1ca47728eafaf83c10ce35b09b03b6a4edc))


### chore

* remove support for Node.js v8.x ([4281d9d](https://github.com/strongloop/loopback-next/commit/4281d9df50f0715d32879e1442a90b643ec8f542))


### Features

* add `tslib` as dependency ([a6e0b4c](https://github.com/strongloop/loopback-next/commit/a6e0b4ce7b862764167cefedee14c1115b25e0a4)), closes [#4676](https://github.com/strongloop/loopback-next/issues/4676)
* move framework packages to `peerDependencies` ([d8f72e4](https://github.com/strongloop/loopback-next/commit/d8f72e4e9085aa132bfac3e930f3960042816f2a))
* update package.json and .travis.yml for builds ([cb2b8e6](https://github.com/strongloop/loopback-next/commit/cb2b8e6a18616dda7783c0193091039d4e608131))
* **extension-logging:** add documentation to README ([7f8ac64](https://github.com/strongloop/loopback-next/commit/7f8ac64f64a8cc22cdf5c439db9a228d8972df7b))
* **extension-logging:** add fluentd docker for testing ([3dc949e](https://github.com/strongloop/loopback-next/commit/3dc949ef0264fc627ded897560a0b42f881373d5))
* **extension-logging:** add http access and method invocation logging ([b3b3f3f](https://github.com/strongloop/loopback-next/commit/b3b3f3f075740092d64f9411e9b6a7893916bf06))
* **extension-logging:** add integration with winston and fluentd logging ([f3321fe](https://github.com/strongloop/loopback-next/commit/f3321fe8c9b4e9f440c5c8084ca850625e1b12ee))


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





## [0.3.13](https://github.com/strongloop/loopback-next/compare/@loopback/extension-logging@0.3.12...@loopback/extension-logging@0.3.13) (2020-08-27)

**Note:** Version bump only for package @loopback/extension-logging





## [0.3.12](https://github.com/strongloop/loopback-next/compare/@loopback/extension-logging@0.3.11...@loopback/extension-logging@0.3.12) (2020-08-19)

**Note:** Version bump only for package @loopback/extension-logging





## [0.3.11](https://github.com/strongloop/loopback-next/compare/@loopback/extension-logging@0.3.10...@loopback/extension-logging@0.3.11) (2020-08-05)

**Note:** Version bump only for package @loopback/extension-logging





## [0.3.10](https://github.com/strongloop/loopback-next/compare/@loopback/extension-logging@0.3.9...@loopback/extension-logging@0.3.10) (2020-07-20)

**Note:** Version bump only for package @loopback/extension-logging





## [0.3.9](https://github.com/strongloop/loopback-next/compare/@loopback/extension-logging@0.3.8...@loopback/extension-logging@0.3.9) (2020-06-30)

**Note:** Version bump only for package @loopback/extension-logging





## [0.3.8](https://github.com/strongloop/loopback-next/compare/@loopback/extension-logging@0.3.7...@loopback/extension-logging@0.3.8) (2020-06-23)


### Bug Fixes

* **extension-logging:** fix typing for winston Logger ([b451daf](https://github.com/strongloop/loopback-next/commit/b451daf33c9040a505073b0b1366863d153498f8))
* set node version to >=10.16 to support events.once ([e39da1c](https://github.com/strongloop/loopback-next/commit/e39da1ca47728eafaf83c10ce35b09b03b6a4edc))





## [0.3.7](https://github.com/strongloop/loopback-next/compare/@loopback/extension-logging@0.3.6...@loopback/extension-logging@0.3.7) (2020-06-11)

**Note:** Version bump only for package @loopback/extension-logging





## [0.3.6](https://github.com/strongloop/loopback-next/compare/@loopback/extension-logging@0.3.5...@loopback/extension-logging@0.3.6) (2020-05-28)

**Note:** Version bump only for package @loopback/extension-logging





## [0.3.5](https://github.com/strongloop/loopback-next/compare/@loopback/extension-logging@0.3.4...@loopback/extension-logging@0.3.5) (2020-05-20)

**Note:** Version bump only for package @loopback/extension-logging





## [0.3.4](https://github.com/strongloop/loopback-next/compare/@loopback/extension-logging@0.3.3...@loopback/extension-logging@0.3.4) (2020-05-19)

**Note:** Version bump only for package @loopback/extension-logging





## [0.3.3](https://github.com/strongloop/loopback-next/compare/@loopback/extension-logging@0.3.2...@loopback/extension-logging@0.3.3) (2020-05-07)

**Note:** Version bump only for package @loopback/extension-logging





## [0.3.2](https://github.com/strongloop/loopback-next/compare/@loopback/extension-logging@0.3.1...@loopback/extension-logging@0.3.2) (2020-04-29)

**Note:** Version bump only for package @loopback/extension-logging





## [0.3.1](https://github.com/strongloop/loopback-next/compare/@loopback/extension-logging@0.3.0...@loopback/extension-logging@0.3.1) (2020-04-23)

**Note:** Version bump only for package @loopback/extension-logging





# [0.3.0](https://github.com/strongloop/loopback-next/compare/@loopback/extension-logging@0.2.4...@loopback/extension-logging@0.3.0) (2020-04-22)


### Features

* update package.json and .travis.yml for builds ([cb2b8e6](https://github.com/strongloop/loopback-next/commit/cb2b8e6a18616dda7783c0193091039d4e608131))





## [0.2.4](https://github.com/strongloop/loopback-next/compare/@loopback/extension-logging@0.2.3...@loopback/extension-logging@0.2.4) (2020-04-11)

**Note:** Version bump only for package @loopback/extension-logging





## [0.2.3](https://github.com/strongloop/loopback-next/compare/@loopback/extension-logging@0.2.2...@loopback/extension-logging@0.2.3) (2020-04-08)

**Note:** Version bump only for package @loopback/extension-logging





## [0.2.2](https://github.com/strongloop/loopback-next/compare/@loopback/extension-logging@0.2.1...@loopback/extension-logging@0.2.2) (2020-03-24)

**Note:** Version bump only for package @loopback/extension-logging





## [0.2.1](https://github.com/strongloop/loopback-next/compare/@loopback/extension-logging@0.2.0...@loopback/extension-logging@0.2.1) (2020-03-17)

**Note:** Version bump only for package @loopback/extension-logging





# [0.2.0](https://github.com/strongloop/loopback-next/compare/@loopback/extension-logging@0.1.0...@loopback/extension-logging@0.2.0) (2020-03-05)


### chore

* remove support for Node.js v8.x ([4281d9d](https://github.com/strongloop/loopback-next/commit/4281d9df50f0715d32879e1442a90b643ec8f542))


### Features

* add `tslib` as dependency ([a6e0b4c](https://github.com/strongloop/loopback-next/commit/a6e0b4ce7b862764167cefedee14c1115b25e0a4)), closes [#4676](https://github.com/strongloop/loopback-next/issues/4676)


### BREAKING CHANGES

* Node.js v8.x is now end of life. Please upgrade to version
10 and above. See https://nodejs.org/en/about/releases.





# 0.1.0 (2020-02-06)


### Features

* **extension-logging:** add documentation to README ([7f8ac64](https://github.com/strongloop/loopback-next/commit/7f8ac64f64a8cc22cdf5c439db9a228d8972df7b))
* **extension-logging:** add fluentd docker for testing ([3dc949e](https://github.com/strongloop/loopback-next/commit/3dc949ef0264fc627ded897560a0b42f881373d5))
* **extension-logging:** add http access and method invocation logging ([b3b3f3f](https://github.com/strongloop/loopback-next/commit/b3b3f3f075740092d64f9411e9b6a7893916bf06))
* **extension-logging:** add integration with winston and fluentd logging ([f3321fe](https://github.com/strongloop/loopback-next/commit/f3321fe8c9b4e9f440c5c8084ca850625e1b12ee))
