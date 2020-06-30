# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.1.1](https://github.com/strongloop/loopback-next/compare/@loopback/example-access-control-migration@2.1.0...@loopback/example-access-control-migration@2.1.1) (2020-06-30)

**Note:** Version bump only for package @loopback/example-access-control-migration





# [2.1.0](https://github.com/strongloop/loopback-next/compare/@loopback/example-access-control-migration@2.0.0...@loopback/example-access-control-migration@2.1.0) (2020-06-23)


### Bug Fixes

* set node version to >=10.16 to support events.once ([e39da1c](https://github.com/strongloop/loopback-next/commit/e39da1ca47728eafaf83c10ce35b09b03b6a4edc))


### Features

* update sequence.ts to invoke middleware ([e2ff6b2](https://github.com/strongloop/loopback-next/commit/e2ff6b22367e919926d0f41f6d939d988c654c00))





# [2.0.0](https://github.com/strongloop/loopback-next/compare/@loopback/example-access-control-migration@1.4.0...@loopback/example-access-control-migration@2.0.0) (2020-06-11)


### Bug Fixes

* **authorization:** set default HTTP status code for authorization error to 403 as per RFC 7231 ([0eb124b](https://github.com/strongloop/loopback-next/commit/0eb124b068ece35e0129bcdfa1bd551250fe5303))


### BREAKING CHANGES

* **authorization:** We now use http status code `403` instead of `401` to report authorization denied. The default status code can be set via `defaultStatusCodeForDeny` for the authorization options.





# [1.4.0](https://github.com/strongloop/loopback-next/compare/@loopback/example-access-control-migration@1.3.1...@loopback/example-access-control-migration@1.4.0) (2020-05-28)


### Features

* add `npm run openapi-spec` to export the openapi spec ([dca78e1](https://github.com/strongloop/loopback-next/commit/dca78e1ba3241ed2a0e7067e00cc1afd001f0335))





## [1.3.1](https://github.com/strongloop/loopback-next/compare/@loopback/example-access-control-migration@1.3.0...@loopback/example-access-control-migration@1.3.1) (2020-05-20)

**Note:** Version bump only for package @loopback/example-access-control-migration





# [1.3.0](https://github.com/strongloop/loopback-next/compare/@loopback/example-access-control-migration@1.2.1...@loopback/example-access-control-migration@1.3.0) (2020-05-19)


### Features

* upgrade to TypeScript 3.9.x ([3300e45](https://github.com/strongloop/loopback-next/commit/3300e4569ab8410bb1285f7a54d326e9d976476d))





## [1.2.1](https://github.com/strongloop/loopback-next/compare/@loopback/example-access-control-migration@1.2.0...@loopback/example-access-control-migration@1.2.1) (2020-05-07)

**Note:** Version bump only for package @loopback/example-access-control-migration





# [1.2.0](https://github.com/strongloop/loopback-next/compare/@loopback/example-access-control-migration@1.1.6...@loopback/example-access-control-migration@1.2.0) (2020-04-29)


### Features

* move datasource config from JSON to TS files ([6105456](https://github.com/strongloop/loopback-next/commit/6105456deb6d7acadc3e46867558311dce2d005c))





## [1.1.6](https://github.com/strongloop/loopback-next/compare/@loopback/example-access-control-migration@1.1.5...@loopback/example-access-control-migration@1.1.6) (2020-04-23)

**Note:** Version bump only for package @loopback/example-access-control-migration





## [1.1.5](https://github.com/strongloop/loopback-next/compare/@loopback/example-access-control-migration@1.1.4...@loopback/example-access-control-migration@1.1.5) (2020-04-22)

**Note:** Version bump only for package @loopback/example-access-control-migration





## [1.1.4](https://github.com/strongloop/loopback-next/compare/@loopback/example-access-control-migration@1.1.3...@loopback/example-access-control-migration@1.1.4) (2020-04-11)

**Note:** Version bump only for package @loopback/example-access-control-migration





## [1.1.3](https://github.com/strongloop/loopback-next/compare/@loopback/example-access-control-migration@1.1.2...@loopback/example-access-control-migration@1.1.3) (2020-04-08)

**Note:** Version bump only for package @loopback/example-access-control-migration





## [1.1.2](https://github.com/strongloop/loopback-next/compare/@loopback/example-access-control-migration@1.1.1...@loopback/example-access-control-migration@1.1.2) (2020-03-24)


### Bug Fixes

* **docs:** update example list ([9cc7b18](https://github.com/strongloop/loopback-next/commit/9cc7b182add211d84a20db5f63fe0997ab010eda))
* update package locks ([cd2f6fa](https://github.com/strongloop/loopback-next/commit/cd2f6fa7a732afe4a16f4ccf8316ff3142959fe8))





## [1.1.1](https://github.com/strongloop/loopback-next/compare/@loopback/example-access-control-migration@1.1.0...@loopback/example-access-control-migration@1.1.1) (2020-03-17)

**Note:** Version bump only for package @loopback/example-access-control-migration





# 1.1.0 (2020-03-05)


### Bug Fixes

* remove ref for v4.loopback.io ([78f20c0](https://github.com/strongloop/loopback-next/commit/78f20c0ed4db5f3ce0d7b676449ba3b22526319e))


### Features

* add access control migration app ([54e88dc](https://github.com/strongloop/loopback-next/commit/54e88dc00215b1d7ab8f852f3eb15cd9d04d71a1))
