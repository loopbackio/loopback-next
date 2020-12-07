# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.7.5](https://github.com/strongloop/loopback-next/compare/@loopback/authentication-jwt@0.7.4...@loopback/authentication-jwt@0.7.5) (2020-12-07)

**Note:** Version bump only for package @loopback/authentication-jwt





## [0.7.4](https://github.com/strongloop/loopback-next/compare/@loopback/authentication-jwt@0.7.3...@loopback/authentication-jwt@0.7.4) (2020-11-18)

**Note:** Version bump only for package @loopback/authentication-jwt





## [0.7.3](https://github.com/strongloop/loopback-next/compare/@loopback/authentication-jwt@0.7.2...@loopback/authentication-jwt@0.7.3) (2020-11-05)

**Note:** Version bump only for package @loopback/authentication-jwt





## [0.7.2](https://github.com/strongloop/loopback-next/compare/@loopback/authentication-jwt@0.7.1...@loopback/authentication-jwt@0.7.2) (2020-10-07)


### Bug Fixes

* tidy up type inferences for OpenAPI SchemaObject ([013bb7e](https://github.com/strongloop/loopback-next/commit/013bb7e4c0f7499a7f77c152dea7caa14e19b7cc))





## [0.7.1](https://github.com/strongloop/loopback-next/compare/@loopback/authentication-jwt@0.7.0...@loopback/authentication-jwt@0.7.1) (2020-09-17)

**Note:** Version bump only for package @loopback/authentication-jwt





# [0.7.0](https://github.com/strongloop/loopback-next/compare/@loopback/authentication-jwt@0.6.0...@loopback/authentication-jwt@0.7.0) (2020-09-15)


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





# [0.6.0](https://github.com/strongloop/loopback-next/compare/@loopback/authentication-jwt@0.5.1...@loopback/authentication-jwt@0.6.0) (2020-08-27)


### Bug Fixes

* **authentication-jwt:** work around TypeScript 4.x complaint about optional properties ([2683303](https://github.com/strongloop/loopback-next/commit/26833038e697471a2eb576d3f8fd57ef10794398))


### Features

* **authentication-jwt:** implementation of refresh token ([7074182](https://github.com/strongloop/loopback-next/commit/70741829678b5a0dc9c277a12674725c8a2efb1d))





## [0.5.1](https://github.com/strongloop/loopback-next/compare/@loopback/authentication-jwt@0.5.0...@loopback/authentication-jwt@0.5.1) (2020-08-19)

**Note:** Version bump only for package @loopback/authentication-jwt





# [0.5.0](https://github.com/strongloop/loopback-next/compare/@loopback/authentication-jwt@0.4.4...@loopback/authentication-jwt@0.5.0) (2020-08-05)


### Bug Fixes

* **authentication-jwt:** move REST API Explorer to devDependencies ([0de229e](https://github.com/strongloop/loopback-next/commit/0de229eaf85e91c7dbbdab8aee4e3fd2d2a16886))


### Features

* **authentication-jwt:** add signup route ([d481157](https://github.com/strongloop/loopback-next/commit/d481157355d428b7cbc8f59b6a010a6585e9ad1a))





## [0.4.4](https://github.com/strongloop/loopback-next/compare/@loopback/authentication-jwt@0.4.3...@loopback/authentication-jwt@0.4.4) (2020-07-20)


### Bug Fixes

* **docs:** fix collapsible section ([0f6e76d](https://github.com/strongloop/loopback-next/commit/0f6e76dfe5c8e8d7c11e065c5ea74e51d3e2c8e7))





## [0.4.3](https://github.com/strongloop/loopback-next/compare/@loopback/authentication-jwt@0.4.2...@loopback/authentication-jwt@0.4.3) (2020-06-30)

**Note:** Version bump only for package @loopback/authentication-jwt





## [0.4.2](https://github.com/strongloop/loopback-next/compare/@loopback/authentication-jwt@0.4.1...@loopback/authentication-jwt@0.4.2) (2020-06-23)


### Bug Fixes

* set node version to >=10.16 to support events.once ([e39da1c](https://github.com/strongloop/loopback-next/commit/e39da1ca47728eafaf83c10ce35b09b03b6a4edc))





## [0.4.1](https://github.com/strongloop/loopback-next/compare/@loopback/authentication-jwt@0.4.0...@loopback/authentication-jwt@0.4.1) (2020-06-11)

**Note:** Version bump only for package @loopback/authentication-jwt





# [0.4.0](https://github.com/strongloop/loopback-next/compare/@loopback/authentication-jwt@0.3.1...@loopback/authentication-jwt@0.4.0) (2020-05-28)


### Bug Fixes

* **authentication-jwt:** correct the scheme name ([65b0d63](https://github.com/strongloop/loopback-next/commit/65b0d639613945e7c24fe4d1ba0caaf27bae1e2d))


### Features

* **authentication-jwt:** add jwt spec enhancer ([7ba645a](https://github.com/strongloop/loopback-next/commit/7ba645a3941638530c5f7feb2de4d23cff23fa92))
* **authentication-jwt:** unique index email for user ([befd345](https://github.com/strongloop/loopback-next/commit/befd34546c58369003a0b92328e01ced06b2939f))





## [0.3.1](https://github.com/strongloop/loopback-next/compare/@loopback/authentication-jwt@0.3.0...@loopback/authentication-jwt@0.3.1) (2020-05-20)

**Note:** Version bump only for package @loopback/authentication-jwt





# [0.3.0](https://github.com/strongloop/loopback-next/compare/@loopback/authentication-jwt@0.2.1...@loopback/authentication-jwt@0.3.0) (2020-05-19)


### Features

* upgrade to TypeScript 3.9.x ([3300e45](https://github.com/strongloop/loopback-next/commit/3300e4569ab8410bb1285f7a54d326e9d976476d))





## [0.2.1](https://github.com/strongloop/loopback-next/compare/@loopback/authentication-jwt@0.2.0...@loopback/authentication-jwt@0.2.1) (2020-05-07)

**Note:** Version bump only for package @loopback/authentication-jwt





# 0.2.0 (2020-04-29)


### Bug Fixes

* **authentication-jwt:** fix package.json and rename the package ([0973d18](https://github.com/strongloop/loopback-next/commit/0973d18ee4e94391367ee3510a9f0bc2eebaf4b7))


### Features

* add jwt auth extension ([94f8c2c](https://github.com/strongloop/loopback-next/commit/94f8c2cfe2a2cb5170f0ad5880597b5932612777))
* move datasource config from JSON to TS files ([6105456](https://github.com/strongloop/loopback-next/commit/6105456deb6d7acadc3e46867558311dce2d005c))





## [0.1.1](https://github.com/strongloop/loopback-next/compare/@loopback/extension-authentication-jwt@0.1.0...@loopback/extension-authentication-jwt@0.1.1) (2020-04-23)

**Note:** Version bump only for package @loopback/extension-authentication-jwt





# 0.1.0 (2020-04-22)


### Features

* add jwt auth extension ([94f8c2c](https://github.com/strongloop/loopback-next/commit/94f8c2cfe2a2cb5170f0ad5880597b5932612777))
