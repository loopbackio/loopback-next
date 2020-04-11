# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.0.4](https://github.com/strongloop/loopback-next/compare/@loopback/example-lb3-application@2.0.3...@loopback/example-lb3-application@2.0.4) (2020-04-11)

**Note:** Version bump only for package @loopback/example-lb3-application





## [2.0.3](https://github.com/strongloop/loopback-next/compare/@loopback/example-lb3-application@2.0.2...@loopback/example-lb3-application@2.0.3) (2020-04-08)

**Note:** Version bump only for package @loopback/example-lb3-application





## [2.0.2](https://github.com/strongloop/loopback-next/compare/@loopback/example-lb3-application@2.0.1...@loopback/example-lb3-application@2.0.2) (2020-03-24)


### Bug Fixes

* update package locks ([cd2f6fa](https://github.com/strongloop/loopback-next/commit/cd2f6fa7a732afe4a16f4ccf8316ff3142959fe8))





## [2.0.1](https://github.com/strongloop/loopback-next/compare/@loopback/example-lb3-application@2.0.0...@loopback/example-lb3-application@2.0.1) (2020-03-17)

**Note:** Version bump only for package @loopback/example-lb3-application





# [2.0.0](https://github.com/strongloop/loopback-next/compare/@loopback/example-lb3-application@1.1.26...@loopback/example-lb3-application@2.0.0) (2020-03-05)


### Bug Fixes

* remove ref for v4.loopback.io ([78f20c0](https://github.com/strongloop/loopback-next/commit/78f20c0ed4db5f3ce0d7b676449ba3b22526319e))


### chore

* remove support for Node.js v8.x ([4281d9d](https://github.com/strongloop/loopback-next/commit/4281d9df50f0715d32879e1442a90b643ec8f542))


### Code Refactoring

* **rest:** make getApiSpec() async ([fe3df1b](https://github.com/strongloop/loopback-next/commit/fe3df1b85904ee8b8a005fa6eddf150d28ad2a08))


### Features

* add `tslib` as dependency ([a6e0b4c](https://github.com/strongloop/loopback-next/commit/a6e0b4ce7b862764167cefedee14c1115b25e0a4)), closes [#4676](https://github.com/strongloop/loopback-next/issues/4676)


### BREAKING CHANGES

* **rest:** Api specifications are now emitted as a Promise instead
of a value object.  Calls to getApiSpec function must switch from
the old style to new style as follows:

1. Old style

```ts
function() {
  // ...
  const spec = restApp.restServer.getApiSpec();
  // ...
}
```

2. New style

```ts
async function() {
  // ...
  const spec = await restApp.restServer.getApiSpec();
  // ...
}
```
* Node.js v8.x is now end of life. Please upgrade to version
10 and above. See https://nodejs.org/en/about/releases.





## [1.1.26](https://github.com/strongloop/loopback-next/compare/@loopback/example-lb3-application@1.1.25...@loopback/example-lb3-application@1.1.26) (2020-02-06)

**Note:** Version bump only for package @loopback/example-lb3-application





## [1.1.25](https://github.com/strongloop/loopback-next/compare/@loopback/example-lb3-application@1.1.24...@loopback/example-lb3-application@1.1.25) (2020-02-05)


### Bug Fixes

* update clean script for examples to be compatible with `lb4 example` ([d9f5741](https://github.com/strongloop/loopback-next/commit/d9f574160f6edbf73a8f728cd3695ca69297148a))





## [1.1.24](https://github.com/strongloop/loopback-next/compare/@loopback/example-lb3-application@1.1.23...@loopback/example-lb3-application@1.1.24) (2020-01-27)

**Note:** Version bump only for package @loopback/example-lb3-application





## [1.1.23](https://github.com/strongloop/loopback-next/compare/@loopback/example-lb3-application@1.1.22...@loopback/example-lb3-application@1.1.23) (2020-01-07)

**Note:** Version bump only for package @loopback/example-lb3-application





## [1.1.22](https://github.com/strongloop/loopback-next/compare/@loopback/example-lb3-application@1.1.21...@loopback/example-lb3-application@1.1.22) (2020-01-07)


### Bug Fixes

* fixed formatting issues ([02f3a7d](https://github.com/strongloop/loopback-next/commit/02f3a7d859e82a381a495f41597f6a7e7b1f18bc))





## [1.1.21](https://github.com/strongloop/loopback-next/compare/@loopback/example-lb3-application@1.1.20...@loopback/example-lb3-application@1.1.21) (2019-12-09)

**Note:** Version bump only for package @loopback/example-lb3-application





## [1.1.20](https://github.com/strongloop/loopback-next/compare/@loopback/example-lb3-application@1.1.19...@loopback/example-lb3-application@1.1.20) (2019-11-25)

**Note:** Version bump only for package @loopback/example-lb3-application





## [1.1.19](https://github.com/strongloop/loopback-next/compare/@loopback/example-lb3-application@1.1.18...@loopback/example-lb3-application@1.1.19) (2019-11-12)

**Note:** Version bump only for package @loopback/example-lb3-application





## [1.1.18](https://github.com/strongloop/loopback-next/compare/@loopback/example-lb3-application@1.1.17...@loopback/example-lb3-application@1.1.18) (2019-10-24)

**Note:** Version bump only for package @loopback/example-lb3-application





## [1.1.17](https://github.com/strongloop/loopback-next/compare/@loopback/example-lb3-application@1.1.16...@loopback/example-lb3-application@1.1.17) (2019-10-07)

**Note:** Version bump only for package @loopback/example-lb3-application





## [1.1.16](https://github.com/strongloop/loopback-next/compare/@loopback/example-lb3-application@1.1.15...@loopback/example-lb3-application@1.1.16) (2019-09-28)

**Note:** Version bump only for package @loopback/example-lb3-application





## [1.1.15](https://github.com/strongloop/loopback-next/compare/@loopback/example-lb3-application@1.1.14...@loopback/example-lb3-application@1.1.15) (2019-09-27)


### Bug Fixes

* migrate LB3 models mounted on LB4 app ([7d36f6d](https://github.com/strongloop/loopback-next/commit/7d36f6d))





## [1.1.14](https://github.com/strongloop/loopback-next/compare/@loopback/example-lb3-application@1.1.13...@loopback/example-lb3-application@1.1.14) (2019-09-17)

**Note:** Version bump only for package @loopback/example-lb3-application





## [1.1.13](https://github.com/strongloop/loopback-next/compare/@loopback/example-lb3-application@1.1.12...@loopback/example-lb3-application@1.1.13) (2019-09-06)

**Note:** Version bump only for package @loopback/example-lb3-application





## [1.1.12](https://github.com/strongloop/loopback-next/compare/@loopback/example-lb3-application@1.1.11...@loopback/example-lb3-application@1.1.12) (2019-09-03)

**Note:** Version bump only for package @loopback/example-lb3-application





## [1.1.11](https://github.com/strongloop/loopback-next/compare/@loopback/example-lb3-application@1.1.10...@loopback/example-lb3-application@1.1.11) (2019-08-19)

**Note:** Version bump only for package @loopback/example-lb3-application





## [1.1.10](https://github.com/strongloop/loopback-next/compare/@loopback/example-lb3-application@1.1.9...@loopback/example-lb3-application@1.1.10) (2019-08-15)

**Note:** Version bump only for package @loopback/example-lb3-application





## [1.1.9](https://github.com/strongloop/loopback-next/compare/@loopback/example-lb3-application@1.1.8...@loopback/example-lb3-application@1.1.9) (2019-08-15)

**Note:** Version bump only for package @loopback/example-lb3-application





## [1.1.8](https://github.com/strongloop/loopback-next/compare/@loopback/example-lb3-application@1.1.7...@loopback/example-lb3-application@1.1.8) (2019-07-31)

**Note:** Version bump only for package @loopback/example-lb3-application





## [1.1.7](https://github.com/strongloop/loopback-next/compare/@loopback/example-lb3-application@1.1.6...@loopback/example-lb3-application@1.1.7) (2019-07-26)

**Note:** Version bump only for package @loopback/example-lb3-application





## [1.1.6](https://github.com/strongloop/loopback-next/compare/@loopback/example-lb3-application@1.1.5...@loopback/example-lb3-application@1.1.6) (2019-07-17)

**Note:** Version bump only for package @loopback/example-lb3-application





## [1.1.5](https://github.com/strongloop/loopback-next/compare/@loopback/example-lb3-application@1.1.4...@loopback/example-lb3-application@1.1.5) (2019-06-28)

**Note:** Version bump only for package @loopback/example-lb3-application





## [1.1.4](https://github.com/strongloop/loopback-next/compare/@loopback/example-lb3-application@1.1.3...@loopback/example-lb3-application@1.1.4) (2019-06-21)

**Note:** Version bump only for package @loopback/example-lb3-application





## [1.1.3](https://github.com/strongloop/loopback-next/compare/@loopback/example-lb3-application@1.1.2...@loopback/example-lb3-application@1.1.3) (2019-06-20)

**Note:** Version bump only for package @loopback/example-lb3-application





## [1.1.2](https://github.com/strongloop/loopback-next/compare/@loopback/example-lb3-application@1.1.1...@loopback/example-lb3-application@1.1.2) (2019-06-17)


### Bug Fixes

* mention required loopback-boot version for mounting a lb3 app ([d76ad45](https://github.com/strongloop/loopback-next/commit/d76ad45))
* remove forgotten references to tslint ([faa0a92](https://github.com/strongloop/loopback-next/commit/faa0a92))





## [1.1.1](https://github.com/strongloop/loopback-next/compare/@loopback/example-lb3-application@1.1.0...@loopback/example-lb3-application@1.1.1) (2019-06-06)

**Note:** Version bump only for package @loopback/example-lb3-application





# [1.1.0](https://github.com/strongloop/loopback-next/compare/@loopback/example-lb3-application@1.0.3...@loopback/example-lb3-application@1.1.0) (2019-06-03)


### Features

* replace tslint with eslint ([44185a7](https://github.com/strongloop/loopback-next/commit/44185a7))





## [1.0.3](https://github.com/strongloop/loopback-next/compare/@loopback/example-lb3-application@1.0.2...@loopback/example-lb3-application@1.0.3) (2019-05-31)

**Note:** Version bump only for package @loopback/example-lb3-application





## [1.0.2](https://github.com/strongloop/loopback-next/compare/@loopback/example-lb3-application@1.0.1...@loopback/example-lb3-application@1.0.2) (2019-05-30)

**Note:** Version bump only for package @loopback/example-lb3-application





## [1.0.1](https://github.com/strongloop/loopback-next/compare/@loopback/example-lb3-application@1.0.0...@loopback/example-lb3-application@1.0.1) (2019-05-23)


### Bug Fixes

* **example-lb3-application:** remove deprecation warning ([a24e7c0](https://github.com/strongloop/loopback-next/commit/a24e7c0))





# 1.0.0 (2019-05-14)


### Features

* add lb3 application ([bf60011](https://github.com/strongloop/loopback-next/commit/bf60011))
