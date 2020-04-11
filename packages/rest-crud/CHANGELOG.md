# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.7.4](https://github.com/strongloop/loopback-next/compare/@loopback/rest-crud@0.7.3...@loopback/rest-crud@0.7.4) (2020-04-11)

**Note:** Version bump only for package @loopback/rest-crud





## [0.7.3](https://github.com/strongloop/loopback-next/compare/@loopback/rest-crud@0.7.2...@loopback/rest-crud@0.7.3) (2020-04-08)

**Note:** Version bump only for package @loopback/rest-crud





## [0.7.2](https://github.com/strongloop/loopback-next/compare/@loopback/rest-crud@0.7.1...@loopback/rest-crud@0.7.2) (2020-03-24)

**Note:** Version bump only for package @loopback/rest-crud





## [0.7.1](https://github.com/strongloop/loopback-next/compare/@loopback/rest-crud@0.7.0...@loopback/rest-crud@0.7.1) (2020-03-17)

**Note:** Version bump only for package @loopback/rest-crud





# [0.7.0](https://github.com/strongloop/loopback-next/compare/@loopback/rest-crud@0.6.6...@loopback/rest-crud@0.7.0) (2020-03-05)


### chore

* remove support for Node.js v8.x ([4281d9d](https://github.com/strongloop/loopback-next/commit/4281d9df50f0715d32879e1442a90b643ec8f542))


### Code Refactoring

* **rest:** make getApiSpec() async ([fe3df1b](https://github.com/strongloop/loopback-next/commit/fe3df1b85904ee8b8a005fa6eddf150d28ad2a08))


### Features

* add `tslib` as dependency ([a6e0b4c](https://github.com/strongloop/loopback-next/commit/a6e0b4ce7b862764167cefedee14c1115b25e0a4)), closes [#4676](https://github.com/strongloop/loopback-next/issues/4676)
* use [@param](https://github.com/param).filter and [@param](https://github.com/param).where decorators ([896ef74](https://github.com/strongloop/loopback-next/commit/896ef7485376b3aedcca01a40f828bf1ed9470ae))
* **rest-crud:** add CrudRestApiBuilder ([bc5d56f](https://github.com/strongloop/loopback-next/commit/bc5d56fd4f10759756cd0ef6fbc922c02b5a9894))


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





## [0.6.6](https://github.com/strongloop/loopback-next/compare/@loopback/rest-crud@0.6.5...@loopback/rest-crud@0.6.6) (2020-02-06)

**Note:** Version bump only for package @loopback/rest-crud





## [0.6.5](https://github.com/strongloop/loopback-next/compare/@loopback/rest-crud@0.6.4...@loopback/rest-crud@0.6.5) (2020-02-05)

**Note:** Version bump only for package @loopback/rest-crud





## [0.6.4](https://github.com/strongloop/loopback-next/compare/@loopback/rest-crud@0.6.3...@loopback/rest-crud@0.6.4) (2020-01-27)

**Note:** Version bump only for package @loopback/rest-crud





## [0.6.3](https://github.com/strongloop/loopback-next/compare/@loopback/rest-crud@0.6.2...@loopback/rest-crud@0.6.3) (2020-01-07)

**Note:** Version bump only for package @loopback/rest-crud





## [0.6.2](https://github.com/strongloop/loopback-next/compare/@loopback/rest-crud@0.6.1...@loopback/rest-crud@0.6.2) (2019-12-09)

**Note:** Version bump only for package @loopback/rest-crud





## [0.6.1](https://github.com/strongloop/loopback-next/compare/@loopback/rest-crud@0.6.0...@loopback/rest-crud@0.6.1) (2019-11-25)

**Note:** Version bump only for package @loopback/rest-crud





# [0.6.0](https://github.com/strongloop/loopback-next/compare/@loopback/rest-crud@0.5.0...@loopback/rest-crud@0.6.0) (2019-11-12)


### Features

* add defineCrudRepositoryClass ([8e3e21d](https://github.com/strongloop/loopback-next/commit/8e3e21d41c7df7a52e9420da09d09881c97cb771))





# [0.5.0](https://github.com/strongloop/loopback-next/compare/@loopback/rest-crud@0.4.0...@loopback/rest-crud@0.5.0) (2019-10-24)


### Features

* simplify model schema with excluded properties ([b554ac8](https://github.com/strongloop/loopback-next/commit/b554ac8a08a518f112d111ebabcac48279ada7f8))





# [0.4.0](https://github.com/strongloop/loopback-next/compare/@loopback/rest-crud@0.3.2...@loopback/rest-crud@0.4.0) (2019-10-07)


### Features

* generate controller based on Model name ([04a3318](https://github.com/strongloop/loopback-next/commit/04a3318))





## [0.3.2](https://github.com/strongloop/loopback-next/compare/@loopback/rest-crud@0.3.1...@loopback/rest-crud@0.3.2) (2019-09-28)

**Note:** Version bump only for package @loopback/rest-crud





## [0.3.1](https://github.com/strongloop/loopback-next/compare/@loopback/rest-crud@0.3.0...@loopback/rest-crud@0.3.1) (2019-09-27)

**Note:** Version bump only for package @loopback/rest-crud





# [0.3.0](https://github.com/strongloop/loopback-next/compare/@loopback/rest-crud@0.2.0...@loopback/rest-crud@0.3.0) (2019-09-17)


### Features

* use descriptive title to describe schema of POST (create) request bodies ([8f49a45](https://github.com/strongloop/loopback-next/commit/8f49a45))





# [0.2.0](https://github.com/strongloop/loopback-next/compare/@loopback/rest-crud@0.1.0...@loopback/rest-crud@0.2.0) (2019-09-06)


### Features

* **rest-crud:** add "replaceById" endpoint ([06d0967](https://github.com/strongloop/loopback-next/commit/06d0967))





# 0.1.0 (2019-09-03)


### Bug Fixes

* **rest-crud:** fix pkg name in license headers ([6ad0bb5](https://github.com/strongloop/loopback-next/commit/6ad0bb5))


### Features

* **rest-crud:** initial implementation ([4374160](https://github.com/strongloop/loopback-next/commit/4374160))
