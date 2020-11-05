# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.5.3](https://github.com/strongloop/loopback-next/compare/@loopback/apiconnect@0.5.2...@loopback/apiconnect@0.5.3) (2020-11-05)

**Note:** Version bump only for package @loopback/apiconnect





## [0.5.2](https://github.com/strongloop/loopback-next/compare/@loopback/apiconnect@0.5.1...@loopback/apiconnect@0.5.2) (2020-10-07)

**Note:** Version bump only for package @loopback/apiconnect





## [0.5.1](https://github.com/strongloop/loopback-next/compare/@loopback/apiconnect@0.5.0...@loopback/apiconnect@0.5.1) (2020-09-17)

**Note:** Version bump only for package @loopback/apiconnect





# [0.5.0](https://github.com/strongloop/loopback-next/compare/@loopback/apiconnect@0.4.3...@loopback/apiconnect@0.5.0) (2020-09-15)


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





## [0.4.3](https://github.com/strongloop/loopback-next/compare/@loopback/apiconnect@0.4.2...@loopback/apiconnect@0.4.3) (2020-08-27)

**Note:** Version bump only for package @loopback/apiconnect





## [0.4.2](https://github.com/strongloop/loopback-next/compare/@loopback/apiconnect@0.4.1...@loopback/apiconnect@0.4.2) (2020-08-19)

**Note:** Version bump only for package @loopback/apiconnect





## [0.4.1](https://github.com/strongloop/loopback-next/compare/@loopback/apiconnect@0.4.0...@loopback/apiconnect@0.4.1) (2020-08-05)

**Note:** Version bump only for package @loopback/apiconnect





# [0.4.0](https://github.com/strongloop/loopback-next/compare/@loopback/apiconnect@0.3.7...@loopback/apiconnect@0.4.0) (2020-07-20)


### Features

* remove openapi-v3 from apiconnect dependencies ([4b99200](https://github.com/strongloop/loopback-next/commit/4b99200854da10ad99c1ab121a1d3e41af120fed))





## [0.3.7](https://github.com/strongloop/loopback-next/compare/@loopback/apiconnect@0.3.6...@loopback/apiconnect@0.3.7) (2020-06-30)

**Note:** Version bump only for package @loopback/apiconnect





## [0.3.6](https://github.com/strongloop/loopback-next/compare/@loopback/apiconnect@0.3.5...@loopback/apiconnect@0.3.6) (2020-06-23)


### Bug Fixes

* set node version to >=10.16 to support events.once ([e39da1c](https://github.com/strongloop/loopback-next/commit/e39da1ca47728eafaf83c10ce35b09b03b6a4edc))





## [0.3.5](https://github.com/strongloop/loopback-next/compare/@loopback/apiconnect@0.3.4...@loopback/apiconnect@0.3.5) (2020-06-11)

**Note:** Version bump only for package @loopback/apiconnect





## [0.3.4](https://github.com/strongloop/loopback-next/compare/@loopback/apiconnect@0.3.3...@loopback/apiconnect@0.3.4) (2020-05-28)

**Note:** Version bump only for package @loopback/apiconnect





## [0.3.3](https://github.com/strongloop/loopback-next/compare/@loopback/apiconnect@0.3.2...@loopback/apiconnect@0.3.3) (2020-05-20)

**Note:** Version bump only for package @loopback/apiconnect





## [0.3.2](https://github.com/strongloop/loopback-next/compare/@loopback/apiconnect@0.3.1...@loopback/apiconnect@0.3.2) (2020-05-19)

**Note:** Version bump only for package @loopback/apiconnect





## [0.3.1](https://github.com/strongloop/loopback-next/compare/@loopback/apiconnect@0.3.0...@loopback/apiconnect@0.3.1) (2020-05-07)

**Note:** Version bump only for package @loopback/apiconnect





# [0.3.0](https://github.com/strongloop/loopback-next/compare/@loopback/apiconnect@0.2.1...@loopback/apiconnect@0.3.0) (2020-04-29)


### Features

* **apiconnect:** add `x-ibm-name` to OpenAPI info object ([b6f11a5](https://github.com/strongloop/loopback-next/commit/b6f11a577084de9456c6bac879273f1b42ef81c6))





## [0.2.1](https://github.com/strongloop/loopback-next/compare/@loopback/apiconnect@0.2.0...@loopback/apiconnect@0.2.1) (2020-04-23)

**Note:** Version bump only for package @loopback/apiconnect





# [0.2.0](https://github.com/strongloop/loopback-next/compare/@loopback/apiconnect@0.1.3...@loopback/apiconnect@0.2.0) (2020-04-22)


### Features

* update package.json and .travis.yml for builds ([cb2b8e6](https://github.com/strongloop/loopback-next/commit/cb2b8e6a18616dda7783c0193091039d4e608131))
* **cli:** add `--apiconnect` option to enable ApiConnectComponent ([c2931d6](https://github.com/strongloop/loopback-next/commit/c2931d6cb8d5f4077c3e680885eee0eee929bd6d))





## [0.1.3](https://github.com/strongloop/loopback-next/compare/@loopback/apiconnect@0.1.2...@loopback/apiconnect@0.1.3) (2020-04-11)

**Note:** Version bump only for package @loopback/apiconnect





## [0.1.2](https://github.com/strongloop/loopback-next/compare/@loopback/apiconnect@0.1.1...@loopback/apiconnect@0.1.2) (2020-04-08)

**Note:** Version bump only for package @loopback/apiconnect





## [0.1.1](https://github.com/strongloop/loopback-next/compare/@loopback/apiconnect@0.1.0...@loopback/apiconnect@0.1.1) (2020-03-24)

**Note:** Version bump only for package @loopback/apiconnect





# 0.1.0 (2020-03-17)


### Features

* **apiconnect:** initial implemention of ApiConnectComponent ([ba722f8](https://github.com/strongloop/loopback-next/commit/ba722f8b4bffee2b43638979d4547e65c91fe2f2))
