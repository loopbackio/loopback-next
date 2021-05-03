# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.8.0](https://github.com/strongloop/loopback-next/compare/@loopback/metrics@0.7.1...@loopback/metrics@0.8.0) (2021-05-03)


### Features

* support node v16 ([ac99415](https://github.com/strongloop/loopback-next/commit/ac994154543bde22b4482ba98813351656db1b55))





## [0.7.1](https://github.com/strongloop/loopback-next/compare/@loopback/metrics@0.7.0...@loopback/metrics@0.7.1) (2021-04-06)

**Note:** Version bump only for package @loopback/metrics





# [0.7.0](https://github.com/strongloop/loopback-next/compare/@loopback/metrics@0.6.1...@loopback/metrics@0.7.0) (2021-03-18)


### Bug Fixes

* **metrics:** update to be compatible with prom-client 13.x ([967f018](https://github.com/strongloop/loopback-next/commit/967f018744a4eb07c5a6c2c827bea956e0488f7b))


### Features

* update package-lock.json to v2 consistently ([dfc3fbd](https://github.com/strongloop/loopback-next/commit/dfc3fbdae0c9ca9f34c64154a471bef22d5ac6b7))





## [0.6.1](https://github.com/strongloop/loopback-next/compare/@loopback/metrics@0.6.0...@loopback/metrics@0.6.1) (2021-02-09)

**Note:** Version bump only for package @loopback/metrics





# [0.6.0](https://github.com/strongloop/loopback-next/compare/@loopback/metrics@0.5.2...@loopback/metrics@0.6.0) (2021-01-21)


### Bug Fixes

* **metrics:** fix error thrown by interceptor if invoked by proxy ([2fd2da2](https://github.com/strongloop/loopback-next/commit/2fd2da2a5664651675a7510910a674706d04d5f8))
* **metrics:** use path pattern instead of raw path in path labels ([80a07bc](https://github.com/strongloop/loopback-next/commit/80a07bcb624fd60a72b7537d285723de3a7c04f8))


### Features

* **metrics:** add new Pushgateway options ([6d73fff](https://github.com/strongloop/loopback-next/commit/6d73fff0e19eb1d5646878d77c38463422607c22))
* **metrics:** add option to configure static default labels ([8bce9e8](https://github.com/strongloop/loopback-next/commit/8bce9e81c916051633486dff2f4aa1af643ca15c))
* **metrics:** additional method invocation labels ([cb3b9a5](https://github.com/strongloop/loopback-next/commit/cb3b9a58683a5cd9c707e77b6896eb5bb4de4db2))





## [0.5.2](https://github.com/strongloop/loopback-next/compare/@loopback/metrics@0.5.1...@loopback/metrics@0.5.2) (2020-12-07)

**Note:** Version bump only for package @loopback/metrics





## [0.5.1](https://github.com/strongloop/loopback-next/compare/@loopback/metrics@0.5.0...@loopback/metrics@0.5.1) (2020-11-18)

**Note:** Version bump only for package @loopback/metrics





# [0.5.0](https://github.com/strongloop/loopback-next/compare/@loopback/metrics@0.4.2...@loopback/metrics@0.5.0) (2020-11-05)


### Bug Fixes

* **metrics:** only add required artifacts to application ([27f36b0](https://github.com/strongloop/loopback-next/commit/27f36b04ff7bf4429725f6a87c15f61068ca7e72))


### Features

* **metrics:** add option to enable/disable openapi spec ([478f99a](https://github.com/strongloop/loopback-next/commit/478f99a0fc66bc6dd758087ce74077e9096ec978))





## [0.4.2](https://github.com/strongloop/loopback-next/compare/@loopback/metrics@0.4.1...@loopback/metrics@0.4.2) (2020-10-07)

**Note:** Version bump only for package @loopback/metrics





## [0.4.1](https://github.com/strongloop/loopback-next/compare/@loopback/metrics@0.4.0...@loopback/metrics@0.4.1) (2020-09-17)

**Note:** Version bump only for package @loopback/metrics





# 0.4.0 (2020-09-15)


### Bug Fixes

* **docs:** fix collapsible section ([0f6e76d](https://github.com/strongloop/loopback-next/commit/0f6e76dfe5c8e8d7c11e065c5ea74e51d3e2c8e7))
* set node version to >=10.16 to support events.once ([e39da1c](https://github.com/strongloop/loopback-next/commit/e39da1ca47728eafaf83c10ce35b09b03b6a4edc))
* **docs:** replace emoji markup with an emoji glyph ([8455526](https://github.com/strongloop/loopback-next/commit/84555262865292764cefe98aef685d655fc797be))


### chore

* remove support for Node.js v8.x ([4281d9d](https://github.com/strongloop/loopback-next/commit/4281d9df50f0715d32879e1442a90b643ec8f542))


### Features

* add `tslib` as dependency ([a6e0b4c](https://github.com/strongloop/loopback-next/commit/a6e0b4ce7b862764167cefedee14c1115b25e0a4)), closes [#4676](https://github.com/strongloop/loopback-next/issues/4676)
* move framework packages to `peerDependencies` ([d8f72e4](https://github.com/strongloop/loopback-next/commit/d8f72e4e9085aa132bfac3e930f3960042816f2a))
* update package.json and .travis.yml for builds ([cb2b8e6](https://github.com/strongloop/loopback-next/commit/cb2b8e6a18616dda7783c0193091039d4e608131))
* **extension-metrics:** add metrics extension for prometheus ([7e485f6](https://github.com/strongloop/loopback-next/commit/7e485f630594d94dc567abe4a1f7a1adfa66f8ec))


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





## [0.3.13](https://github.com/strongloop/loopback-next/compare/@loopback/extension-metrics@0.3.12...@loopback/extension-metrics@0.3.13) (2020-08-27)

**Note:** Version bump only for package @loopback/extension-metrics





## [0.3.12](https://github.com/strongloop/loopback-next/compare/@loopback/extension-metrics@0.3.11...@loopback/extension-metrics@0.3.12) (2020-08-19)

**Note:** Version bump only for package @loopback/extension-metrics





## [0.3.11](https://github.com/strongloop/loopback-next/compare/@loopback/extension-metrics@0.3.10...@loopback/extension-metrics@0.3.11) (2020-08-05)

**Note:** Version bump only for package @loopback/extension-metrics





## [0.3.10](https://github.com/strongloop/loopback-next/compare/@loopback/extension-metrics@0.3.9...@loopback/extension-metrics@0.3.10) (2020-07-20)


### Bug Fixes

* **docs:** fix collapsible section ([0f6e76d](https://github.com/strongloop/loopback-next/commit/0f6e76dfe5c8e8d7c11e065c5ea74e51d3e2c8e7))





## [0.3.9](https://github.com/strongloop/loopback-next/compare/@loopback/extension-metrics@0.3.8...@loopback/extension-metrics@0.3.9) (2020-06-30)

**Note:** Version bump only for package @loopback/extension-metrics





## [0.3.8](https://github.com/strongloop/loopback-next/compare/@loopback/extension-metrics@0.3.7...@loopback/extension-metrics@0.3.8) (2020-06-23)


### Bug Fixes

* set node version to >=10.16 to support events.once ([e39da1c](https://github.com/strongloop/loopback-next/commit/e39da1ca47728eafaf83c10ce35b09b03b6a4edc))





## [0.3.7](https://github.com/strongloop/loopback-next/compare/@loopback/extension-metrics@0.3.6...@loopback/extension-metrics@0.3.7) (2020-06-11)

**Note:** Version bump only for package @loopback/extension-metrics





## [0.3.6](https://github.com/strongloop/loopback-next/compare/@loopback/extension-metrics@0.3.5...@loopback/extension-metrics@0.3.6) (2020-05-28)

**Note:** Version bump only for package @loopback/extension-metrics





## [0.3.5](https://github.com/strongloop/loopback-next/compare/@loopback/extension-metrics@0.3.4...@loopback/extension-metrics@0.3.5) (2020-05-20)

**Note:** Version bump only for package @loopback/extension-metrics





## [0.3.4](https://github.com/strongloop/loopback-next/compare/@loopback/extension-metrics@0.3.3...@loopback/extension-metrics@0.3.4) (2020-05-19)

**Note:** Version bump only for package @loopback/extension-metrics





## [0.3.3](https://github.com/strongloop/loopback-next/compare/@loopback/extension-metrics@0.3.2...@loopback/extension-metrics@0.3.3) (2020-05-07)

**Note:** Version bump only for package @loopback/extension-metrics





## [0.3.2](https://github.com/strongloop/loopback-next/compare/@loopback/extension-metrics@0.3.1...@loopback/extension-metrics@0.3.2) (2020-04-29)

**Note:** Version bump only for package @loopback/extension-metrics





## [0.3.1](https://github.com/strongloop/loopback-next/compare/@loopback/extension-metrics@0.3.0...@loopback/extension-metrics@0.3.1) (2020-04-23)

**Note:** Version bump only for package @loopback/extension-metrics





# [0.3.0](https://github.com/strongloop/loopback-next/compare/@loopback/extension-metrics@0.2.4...@loopback/extension-metrics@0.3.0) (2020-04-22)


### Features

* update package.json and .travis.yml for builds ([cb2b8e6](https://github.com/strongloop/loopback-next/commit/cb2b8e6a18616dda7783c0193091039d4e608131))





## [0.2.4](https://github.com/strongloop/loopback-next/compare/@loopback/extension-metrics@0.2.3...@loopback/extension-metrics@0.2.4) (2020-04-11)

**Note:** Version bump only for package @loopback/extension-metrics





## [0.2.3](https://github.com/strongloop/loopback-next/compare/@loopback/extension-metrics@0.2.2...@loopback/extension-metrics@0.2.3) (2020-04-08)

**Note:** Version bump only for package @loopback/extension-metrics





## [0.2.2](https://github.com/strongloop/loopback-next/compare/@loopback/extension-metrics@0.2.1...@loopback/extension-metrics@0.2.2) (2020-03-24)

**Note:** Version bump only for package @loopback/extension-metrics





## [0.2.1](https://github.com/strongloop/loopback-next/compare/@loopback/extension-metrics@0.2.0...@loopback/extension-metrics@0.2.1) (2020-03-17)

**Note:** Version bump only for package @loopback/extension-metrics





# [0.2.0](https://github.com/strongloop/loopback-next/compare/@loopback/extension-metrics@0.1.6...@loopback/extension-metrics@0.2.0) (2020-03-05)


### chore

* remove support for Node.js v8.x ([4281d9d](https://github.com/strongloop/loopback-next/commit/4281d9df50f0715d32879e1442a90b643ec8f542))


### Features

* add `tslib` as dependency ([a6e0b4c](https://github.com/strongloop/loopback-next/commit/a6e0b4ce7b862764167cefedee14c1115b25e0a4)), closes [#4676](https://github.com/strongloop/loopback-next/issues/4676)


### BREAKING CHANGES

* Node.js v8.x is now end of life. Please upgrade to version
10 and above. See https://nodejs.org/en/about/releases.





## [0.1.6](https://github.com/strongloop/loopback-next/compare/@loopback/extension-metrics@0.1.5...@loopback/extension-metrics@0.1.6) (2020-02-06)

**Note:** Version bump only for package @loopback/extension-metrics





## [0.1.5](https://github.com/strongloop/loopback-next/compare/@loopback/extension-metrics@0.1.4...@loopback/extension-metrics@0.1.5) (2020-02-05)

**Note:** Version bump only for package @loopback/extension-metrics





## [0.1.4](https://github.com/strongloop/loopback-next/compare/@loopback/extension-metrics@0.1.3...@loopback/extension-metrics@0.1.4) (2020-01-27)

**Note:** Version bump only for package @loopback/extension-metrics





## [0.1.3](https://github.com/strongloop/loopback-next/compare/@loopback/extension-metrics@0.1.2...@loopback/extension-metrics@0.1.3) (2020-01-07)


### Bug Fixes

* **docs:** replace emoji markup with an emoji glyph ([8455526](https://github.com/strongloop/loopback-next/commit/84555262865292764cefe98aef685d655fc797be))





## [0.1.2](https://github.com/strongloop/loopback-next/compare/@loopback/extension-metrics@0.1.1...@loopback/extension-metrics@0.1.2) (2019-12-09)

**Note:** Version bump only for package @loopback/extension-metrics





## [0.1.1](https://github.com/strongloop/loopback-next/compare/@loopback/extension-metrics@0.1.0...@loopback/extension-metrics@0.1.1) (2019-11-25)

**Note:** Version bump only for package @loopback/extension-metrics





# 0.1.0 (2019-11-12)


### Features

* **extension-metrics:** add metrics extension for prometheus ([7e485f6](https://github.com/strongloop/loopback-next/commit/7e485f630594d94dc567abe4a1f7a1adfa66f8ec))
