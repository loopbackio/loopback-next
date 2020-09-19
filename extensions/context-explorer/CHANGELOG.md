# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.2.1](https://github.com/strongloop/loopback-next/compare/@loopback/context-explorer@0.2.0...@loopback/context-explorer@0.2.1) (2020-09-17)

**Note:** Version bump only for package @loopback/context-explorer





# [0.2.0](https://github.com/strongloop/loopback-next/compare/@loopback/context-explorer@0.1.13...@loopback/context-explorer@0.2.0) (2020-09-15)


### Features

* move framework packages to `peerDependencies` ([d8f72e4](https://github.com/strongloop/loopback-next/commit/d8f72e4e9085aa132bfac3e930f3960042816f2a))


### BREAKING CHANGES

* Extensions no longer install framework packages as
their own dependencies, they use the framework packages provided by the
target application instead.

If you are getting `npm install` errors after upgrade, then make sure
your project lists all dependencies required by the extensions you are
using.

Signed-off-by: Miroslav Bajtoš <mbajtoss@gmail.com>





## [0.1.13](https://github.com/strongloop/loopback-next/compare/@loopback/context-explorer@0.1.12...@loopback/context-explorer@0.1.13) (2020-08-27)

**Note:** Version bump only for package @loopback/context-explorer





## [0.1.12](https://github.com/strongloop/loopback-next/compare/@loopback/context-explorer@0.1.11...@loopback/context-explorer@0.1.12) (2020-08-19)

**Note:** Version bump only for package @loopback/context-explorer





## [0.1.11](https://github.com/strongloop/loopback-next/compare/@loopback/context-explorer@0.1.10...@loopback/context-explorer@0.1.11) (2020-08-05)

**Note:** Version bump only for package @loopback/context-explorer





## [0.1.10](https://github.com/strongloop/loopback-next/compare/@loopback/context-explorer@0.1.9...@loopback/context-explorer@0.1.10) (2020-07-20)

**Note:** Version bump only for package @loopback/context-explorer





## [0.1.9](https://github.com/strongloop/loopback-next/compare/@loopback/context-explorer@0.1.8...@loopback/context-explorer@0.1.9) (2020-06-30)

**Note:** Version bump only for package @loopback/context-explorer





## [0.1.8](https://github.com/strongloop/loopback-next/compare/@loopback/context-explorer@0.1.7...@loopback/context-explorer@0.1.8) (2020-06-23)


### Bug Fixes

* set node version to >=10.16 to support events.once ([e39da1c](https://github.com/strongloop/loopback-next/commit/e39da1ca47728eafaf83c10ce35b09b03b6a4edc))





## [0.1.7](https://github.com/strongloop/loopback-next/compare/@loopback/context-explorer@0.1.6...@loopback/context-explorer@0.1.7) (2020-06-11)

**Note:** Version bump only for package @loopback/context-explorer





## [0.1.6](https://github.com/strongloop/loopback-next/compare/@loopback/context-explorer@0.1.5...@loopback/context-explorer@0.1.6) (2020-05-28)

**Note:** Version bump only for package @loopback/context-explorer





## [0.1.5](https://github.com/strongloop/loopback-next/compare/@loopback/context-explorer@0.1.4...@loopback/context-explorer@0.1.5) (2020-05-20)

**Note:** Version bump only for package @loopback/context-explorer





## [0.1.4](https://github.com/strongloop/loopback-next/compare/@loopback/context-explorer@0.1.3...@loopback/context-explorer@0.1.4) (2020-05-19)

**Note:** Version bump only for package @loopback/context-explorer





## [0.1.3](https://github.com/strongloop/loopback-next/compare/@loopback/context-explorer@0.1.2...@loopback/context-explorer@0.1.3) (2020-05-07)

**Note:** Version bump only for package @loopback/context-explorer





## [0.1.2](https://github.com/strongloop/loopback-next/compare/@loopback/context-explorer@0.1.1...@loopback/context-explorer@0.1.2) (2020-04-29)

**Note:** Version bump only for package @loopback/context-explorer





## [0.1.1](https://github.com/strongloop/loopback-next/compare/@loopback/context-explorer@0.1.0...@loopback/context-explorer@0.1.1) (2020-04-23)

**Note:** Version bump only for package @loopback/context-explorer





# 0.1.0 (2020-04-22)


### Features

* update package.json and .travis.yml for builds ([cb2b8e6](https://github.com/strongloop/loopback-next/commit/cb2b8e6a18616dda7783c0193091039d4e608131))
* **context-explorer:** add a component for context explorer ([f1c3557](https://github.com/strongloop/loopback-next/commit/f1c35574e346be72dec87b3d5fecabf9a7e37212))
