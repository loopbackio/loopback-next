# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.0.4](https://github.com/strongloop/loopback-next/compare/@loopback/booter-lb3app@2.0.3...@loopback/booter-lb3app@2.0.4) (2020-04-11)

**Note:** Version bump only for package @loopback/booter-lb3app





## [2.0.3](https://github.com/strongloop/loopback-next/compare/@loopback/booter-lb3app@2.0.2...@loopback/booter-lb3app@2.0.3) (2020-04-08)

**Note:** Version bump only for package @loopback/booter-lb3app





## [2.0.2](https://github.com/strongloop/loopback-next/compare/@loopback/booter-lb3app@2.0.1...@loopback/booter-lb3app@2.0.2) (2020-03-24)


### Bug Fixes

* update package locks ([cd2f6fa](https://github.com/strongloop/loopback-next/commit/cd2f6fa7a732afe4a16f4ccf8316ff3142959fe8))





## [2.0.1](https://github.com/strongloop/loopback-next/compare/@loopback/booter-lb3app@2.0.0...@loopback/booter-lb3app@2.0.1) (2020-03-17)

**Note:** Version bump only for package @loopback/booter-lb3app





# [2.0.0](https://github.com/strongloop/loopback-next/compare/@loopback/booter-lb3app@1.3.12...@loopback/booter-lb3app@2.0.0) (2020-03-05)


### Bug Fixes

* **cli:** extract messages for generators ([2f572bd](https://github.com/strongloop/loopback-next/commit/2f572bd75883420e38bfaa780bc38445aec92e65))


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





## [1.3.12](https://github.com/strongloop/loopback-next/compare/@loopback/booter-lb3app@1.3.11...@loopback/booter-lb3app@1.3.12) (2020-02-06)

**Note:** Version bump only for package @loopback/booter-lb3app





## [1.3.11](https://github.com/strongloop/loopback-next/compare/@loopback/booter-lb3app@1.3.10...@loopback/booter-lb3app@1.3.11) (2020-02-05)

**Note:** Version bump only for package @loopback/booter-lb3app





## [1.3.10](https://github.com/strongloop/loopback-next/compare/@loopback/booter-lb3app@1.3.9...@loopback/booter-lb3app@1.3.10) (2020-01-27)

**Note:** Version bump only for package @loopback/booter-lb3app





## [1.3.9](https://github.com/strongloop/loopback-next/compare/@loopback/booter-lb3app@1.3.8...@loopback/booter-lb3app@1.3.9) (2020-01-07)

**Note:** Version bump only for package @loopback/booter-lb3app





## [1.3.8](https://github.com/strongloop/loopback-next/compare/@loopback/booter-lb3app@1.3.7...@loopback/booter-lb3app@1.3.8) (2020-01-07)

**Note:** Version bump only for package @loopback/booter-lb3app





## [1.3.7](https://github.com/strongloop/loopback-next/compare/@loopback/booter-lb3app@1.3.6...@loopback/booter-lb3app@1.3.7) (2019-12-09)

**Note:** Version bump only for package @loopback/booter-lb3app





## [1.3.6](https://github.com/strongloop/loopback-next/compare/@loopback/booter-lb3app@1.3.5...@loopback/booter-lb3app@1.3.6) (2019-11-25)

**Note:** Version bump only for package @loopback/booter-lb3app





## [1.3.5](https://github.com/strongloop/loopback-next/compare/@loopback/booter-lb3app@1.3.4...@loopback/booter-lb3app@1.3.5) (2019-11-12)

**Note:** Version bump only for package @loopback/booter-lb3app





## [1.3.4](https://github.com/strongloop/loopback-next/compare/@loopback/booter-lb3app@1.3.3...@loopback/booter-lb3app@1.3.4) (2019-10-24)

**Note:** Version bump only for package @loopback/booter-lb3app





## [1.3.3](https://github.com/strongloop/loopback-next/compare/@loopback/booter-lb3app@1.3.2...@loopback/booter-lb3app@1.3.3) (2019-10-07)

**Note:** Version bump only for package @loopback/booter-lb3app





## [1.3.2](https://github.com/strongloop/loopback-next/compare/@loopback/booter-lb3app@1.3.1...@loopback/booter-lb3app@1.3.2) (2019-09-28)

**Note:** Version bump only for package @loopback/booter-lb3app





## [1.3.1](https://github.com/strongloop/loopback-next/compare/@loopback/booter-lb3app@1.3.0...@loopback/booter-lb3app@1.3.1) (2019-09-27)


### Bug Fixes

* migrate LB3 models mounted on LB4 app ([7d36f6d](https://github.com/strongloop/loopback-next/commit/7d36f6d))





# [1.3.0](https://github.com/strongloop/loopback-next/compare/@loopback/booter-lb3app@1.2.13...@loopback/booter-lb3app@1.3.0) (2019-09-17)


### Features

* **booter-lb3app:** add specTransformer ([8a51aa1](https://github.com/strongloop/loopback-next/commit/8a51aa1))





## [1.2.13](https://github.com/strongloop/loopback-next/compare/@loopback/booter-lb3app@1.2.12...@loopback/booter-lb3app@1.2.13) (2019-09-06)

**Note:** Version bump only for package @loopback/booter-lb3app





## [1.2.12](https://github.com/strongloop/loopback-next/compare/@loopback/booter-lb3app@1.2.11...@loopback/booter-lb3app@1.2.12) (2019-09-03)

**Note:** Version bump only for package @loopback/booter-lb3app





## [1.2.11](https://github.com/strongloop/loopback-next/compare/@loopback/booter-lb3app@1.2.10...@loopback/booter-lb3app@1.2.11) (2019-08-19)

**Note:** Version bump only for package @loopback/booter-lb3app





## [1.2.10](https://github.com/strongloop/loopback-next/compare/@loopback/booter-lb3app@1.2.9...@loopback/booter-lb3app@1.2.10) (2019-08-15)

**Note:** Version bump only for package @loopback/booter-lb3app





## [1.2.9](https://github.com/strongloop/loopback-next/compare/@loopback/booter-lb3app@1.2.8...@loopback/booter-lb3app@1.2.9) (2019-08-15)

**Note:** Version bump only for package @loopback/booter-lb3app





## [1.2.8](https://github.com/strongloop/loopback-next/compare/@loopback/booter-lb3app@1.2.7...@loopback/booter-lb3app@1.2.8) (2019-07-31)

**Note:** Version bump only for package @loopback/booter-lb3app





## [1.2.7](https://github.com/strongloop/loopback-next/compare/@loopback/booter-lb3app@1.2.6...@loopback/booter-lb3app@1.2.7) (2019-07-26)

**Note:** Version bump only for package @loopback/booter-lb3app





## [1.2.6](https://github.com/strongloop/loopback-next/compare/@loopback/booter-lb3app@1.2.5...@loopback/booter-lb3app@1.2.6) (2019-07-17)


### Bug Fixes

* **booter-lb3app:** stringify and parse lb3 spec before converting it ([30727a5](https://github.com/strongloop/loopback-next/commit/30727a5))





## [1.2.5](https://github.com/strongloop/loopback-next/compare/@loopback/booter-lb3app@1.2.4...@loopback/booter-lb3app@1.2.5) (2019-06-28)

**Note:** Version bump only for package @loopback/booter-lb3app





## [1.2.4](https://github.com/strongloop/loopback-next/compare/@loopback/booter-lb3app@1.2.3...@loopback/booter-lb3app@1.2.4) (2019-06-21)

**Note:** Version bump only for package @loopback/booter-lb3app





## [1.2.3](https://github.com/strongloop/loopback-next/compare/@loopback/booter-lb3app@1.2.2...@loopback/booter-lb3app@1.2.3) (2019-06-20)

**Note:** Version bump only for package @loopback/booter-lb3app





## [1.2.2](https://github.com/strongloop/loopback-next/compare/@loopback/booter-lb3app@1.2.1...@loopback/booter-lb3app@1.2.2) (2019-06-17)


### Bug Fixes

* mention required loopback-boot version for mounting a lb3 app ([d76ad45](https://github.com/strongloop/loopback-next/commit/d76ad45))





## [1.2.1](https://github.com/strongloop/loopback-next/compare/@loopback/booter-lb3app@1.2.0...@loopback/booter-lb3app@1.2.1) (2019-06-06)

**Note:** Version bump only for package @loopback/booter-lb3app





# [1.2.0](https://github.com/strongloop/loopback-next/compare/@loopback/booter-lb3app@1.1.6...@loopback/booter-lb3app@1.2.0) (2019-06-03)


### Features

* replace tslint with eslint ([44185a7](https://github.com/strongloop/loopback-next/commit/44185a7))





## [1.1.6](https://github.com/strongloop/loopback-next/compare/@loopback/booter-lb3app@1.1.5...@loopback/booter-lb3app@1.1.6) (2019-05-31)

**Note:** Version bump only for package @loopback/booter-lb3app





## [1.1.5](https://github.com/strongloop/loopback-next/compare/@loopback/booter-lb3app@1.1.4...@loopback/booter-lb3app@1.1.5) (2019-05-30)

**Note:** Version bump only for package @loopback/booter-lb3app





## [1.1.4](https://github.com/strongloop/loopback-next/compare/@loopback/booter-lb3app@1.1.3...@loopback/booter-lb3app@1.1.4) (2019-05-23)

**Note:** Version bump only for package @loopback/booter-lb3app





## [1.1.3](https://github.com/strongloop/loopback-next/compare/@loopback/booter-lb3app@1.1.2...@loopback/booter-lb3app@1.1.3) (2019-05-14)

**Note:** Version bump only for package @loopback/booter-lb3app





## [1.1.2](https://github.com/strongloop/loopback-next/compare/@loopback/booter-lb3app@1.1.1...@loopback/booter-lb3app@1.1.2) (2019-05-10)

**Note:** Version bump only for package @loopback/booter-lb3app





## [1.1.1](https://github.com/strongloop/loopback-next/compare/@loopback/booter-lb3app@1.1.0...@loopback/booter-lb3app@1.1.1) (2019-05-09)

**Note:** Version bump only for package @loopback/booter-lb3app





# [1.1.0](https://github.com/strongloop/loopback-next/compare/@loopback/booter-lb3app@1.0.0...@loopback/booter-lb3app@1.1.0) (2019-05-06)


### Features

* **booter-lb3app:** enable operation-scoped model schemas ([ff014fc](https://github.com/strongloop/loopback-next/commit/ff014fc))





# 1.0.0 (2019-04-26)


### Bug Fixes

* **booter-lb3app:** export component instead of booter ([b730320](https://github.com/strongloop/loopback-next/commit/b730320))


### Features

* add booter-lb3app package ([993a97f](https://github.com/strongloop/loopback-next/commit/993a97f))
