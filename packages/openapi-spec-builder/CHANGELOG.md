# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [4.0.1](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@4.0.0...@loopback/openapi-spec-builder@4.0.1) (2022-01-11)

**Note:** Version bump only for package @loopback/openapi-spec-builder





# [4.0.0](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@3.2.4...@loopback/openapi-spec-builder@4.0.0) (2021-11-18)


### Features

* drop support for Node.js v10 ([9bcbbb3](https://github.com/loopbackio/loopback-next/commit/9bcbbb358ec3eabc3033d4e7e1c22b524a7069b3))
* support Node.js v17 ([8d86c03](https://github.com/loopbackio/loopback-next/commit/8d86c03cb7047e2b1f18d05870628ef5783e71b2))
* upgrade to TypeScript 4.5.2 ([72ece91](https://github.com/loopbackio/loopback-next/commit/72ece91289ecfdfd8747bb9888ad75db73e8ff4b))


### BREAKING CHANGES

* drop support for Node.js v10

Co-authored-by: Francisco Buceta <frbuceta@gmail.com>
Signed-off-by: Rifa Achrinza <25147899+achrinza@users.noreply.github.com>





## [3.2.4](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@3.2.3...@loopback/openapi-spec-builder@3.2.4) (2021-10-18)

**Note:** Version bump only for package @loopback/openapi-spec-builder





## [3.2.3](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@3.2.2...@loopback/openapi-spec-builder@3.2.3) (2021-09-16)

**Note:** Version bump only for package @loopback/openapi-spec-builder





## [3.2.2](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@3.2.1...@loopback/openapi-spec-builder@3.2.2) (2021-07-15)

**Note:** Version bump only for package @loopback/openapi-spec-builder





## [3.2.1](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@3.2.0...@loopback/openapi-spec-builder@3.2.1) (2021-06-10)

**Note:** Version bump only for package @loopback/openapi-spec-builder





# [3.2.0](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@3.1.1...@loopback/openapi-spec-builder@3.2.0) (2021-05-03)


### Features

* support node v16 ([ac99415](https://github.com/loopbackio/loopback-next/commit/ac994154543bde22b4482ba98813351656db1b55))





## [3.1.1](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@3.1.0...@loopback/openapi-spec-builder@3.1.1) (2021-04-06)

**Note:** Version bump only for package @loopback/openapi-spec-builder





# [3.1.0](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@3.0.5...@loopback/openapi-spec-builder@3.1.0) (2021-03-18)


### Features

* update package-lock.json to v2 consistently ([dfc3fbd](https://github.com/loopbackio/loopback-next/commit/dfc3fbdae0c9ca9f34c64154a471bef22d5ac6b7))





## [3.0.5](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@3.0.4...@loopback/openapi-spec-builder@3.0.5) (2021-02-09)

**Note:** Version bump only for package @loopback/openapi-spec-builder





## [3.0.4](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@3.0.3...@loopback/openapi-spec-builder@3.0.4) (2021-01-21)

**Note:** Version bump only for package @loopback/openapi-spec-builder





## [3.0.3](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@3.0.2...@loopback/openapi-spec-builder@3.0.3) (2020-12-07)

**Note:** Version bump only for package @loopback/openapi-spec-builder





## [3.0.2](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@3.0.1...@loopback/openapi-spec-builder@3.0.2) (2020-11-18)

**Note:** Version bump only for package @loopback/openapi-spec-builder





## [3.0.1](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@3.0.0...@loopback/openapi-spec-builder@3.0.1) (2020-11-05)

**Note:** Version bump only for package @loopback/openapi-spec-builder





# [3.0.0](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@2.1.15...@loopback/openapi-spec-builder@3.0.0) (2020-10-07)


### Features

* update dependency openapi3-ts to v2 ([aabd6e6](https://github.com/loopbackio/loopback-next/commit/aabd6e62a11d5e10ff2256ec664a923041e27ce0))


### BREAKING CHANGES

* openapi3-ts@2.x has a stricter typing for `type` and `format`
properties as union types with a known list of values.

We now either have to explicitly type the schema as `SchemaObject`
or cast the `type` to `SchemaObject['type'], for example:

```ts
import {SchemaObject} from '@loopback/openapi-v3';

const schemaDef1 = {
  type: 'number' as const; // cast the type to be 'number' from 'string'
};

// Use the explicit `SchemaObject` to enforce inference
const schemaDef2: SchemaObject = {
  type: 'number' as const;
};
```

It also applies to OpenAPI parameter objects:

```ts
import {ParameterObject} from '@loopback/openapi-v3';

const paramDef1 = {
  type: 'number' as const, // cast the type to be 'number' from 'string'
  name: 'limit',
  in: 'query',
}

// Use the explicit `ParameterObject` to enforce inference
const paramDef2: ParameterObject = {
  type: 'number',
  name: 'limit',
  in: 'query',
}
```

Signed-off-by: Renovate Bot <bot@renovateapp.com>





## [2.1.15](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@2.1.14...@loopback/openapi-spec-builder@2.1.15) (2020-09-17)

**Note:** Version bump only for package @loopback/openapi-spec-builder





## [2.1.14](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@2.1.13...@loopback/openapi-spec-builder@2.1.14) (2020-09-15)

**Note:** Version bump only for package @loopback/openapi-spec-builder





## [2.1.13](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@2.1.12...@loopback/openapi-spec-builder@2.1.13) (2020-08-27)

**Note:** Version bump only for package @loopback/openapi-spec-builder





## [2.1.12](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@2.1.11...@loopback/openapi-spec-builder@2.1.12) (2020-08-19)

**Note:** Version bump only for package @loopback/openapi-spec-builder





## [2.1.11](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@2.1.10...@loopback/openapi-spec-builder@2.1.11) (2020-08-05)

**Note:** Version bump only for package @loopback/openapi-spec-builder





## [2.1.10](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@2.1.9...@loopback/openapi-spec-builder@2.1.10) (2020-07-20)

**Note:** Version bump only for package @loopback/openapi-spec-builder





## [2.1.9](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@2.1.8...@loopback/openapi-spec-builder@2.1.9) (2020-06-30)

**Note:** Version bump only for package @loopback/openapi-spec-builder





## [2.1.8](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@2.1.7...@loopback/openapi-spec-builder@2.1.8) (2020-06-23)


### Bug Fixes

* set node version to >=10.16 to support events.once ([e39da1c](https://github.com/loopbackio/loopback-next/commit/e39da1ca47728eafaf83c10ce35b09b03b6a4edc))





## [2.1.7](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@2.1.6...@loopback/openapi-spec-builder@2.1.7) (2020-06-11)

**Note:** Version bump only for package @loopback/openapi-spec-builder





## [2.1.6](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@2.1.5...@loopback/openapi-spec-builder@2.1.6) (2020-05-28)

**Note:** Version bump only for package @loopback/openapi-spec-builder





## [2.1.5](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@2.1.4...@loopback/openapi-spec-builder@2.1.5) (2020-05-20)

**Note:** Version bump only for package @loopback/openapi-spec-builder





## [2.1.4](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@2.1.3...@loopback/openapi-spec-builder@2.1.4) (2020-05-19)

**Note:** Version bump only for package @loopback/openapi-spec-builder





## [2.1.3](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@2.1.2...@loopback/openapi-spec-builder@2.1.3) (2020-05-07)

**Note:** Version bump only for package @loopback/openapi-spec-builder





## [2.1.2](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@2.1.1...@loopback/openapi-spec-builder@2.1.2) (2020-04-29)

**Note:** Version bump only for package @loopback/openapi-spec-builder





## [2.1.1](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@2.1.0...@loopback/openapi-spec-builder@2.1.1) (2020-04-23)

**Note:** Version bump only for package @loopback/openapi-spec-builder





# [2.1.0](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@2.0.4...@loopback/openapi-spec-builder@2.1.0) (2020-04-22)


### Features

* update package.json and .travis.yml for builds ([cb2b8e6](https://github.com/loopbackio/loopback-next/commit/cb2b8e6a18616dda7783c0193091039d4e608131))





## [2.0.4](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@2.0.3...@loopback/openapi-spec-builder@2.0.4) (2020-04-11)

**Note:** Version bump only for package @loopback/openapi-spec-builder





## [2.0.3](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@2.0.2...@loopback/openapi-spec-builder@2.0.3) (2020-04-08)

**Note:** Version bump only for package @loopback/openapi-spec-builder





## [2.0.2](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@2.0.1...@loopback/openapi-spec-builder@2.0.2) (2020-03-24)

**Note:** Version bump only for package @loopback/openapi-spec-builder





## [2.0.1](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@2.0.0...@loopback/openapi-spec-builder@2.0.1) (2020-03-17)

**Note:** Version bump only for package @loopback/openapi-spec-builder





# [2.0.0](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@1.3.1...@loopback/openapi-spec-builder@2.0.0) (2020-03-05)


### chore

* remove support for Node.js v8.x ([4281d9d](https://github.com/loopbackio/loopback-next/commit/4281d9df50f0715d32879e1442a90b643ec8f542))


### Features

* add `tslib` as dependency ([a6e0b4c](https://github.com/loopbackio/loopback-next/commit/a6e0b4ce7b862764167cefedee14c1115b25e0a4)), closes [#4676](https://github.com/loopbackio/loopback-next/issues/4676)


### BREAKING CHANGES

* Node.js v8.x is now end of life. Please upgrade to version
10 and above. See https://nodejs.org/en/about/releases.





## [1.3.1](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@1.3.0...@loopback/openapi-spec-builder@1.3.1) (2020-02-05)

**Note:** Version bump only for package @loopback/openapi-spec-builder





# [1.3.0](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@1.2.21...@loopback/openapi-spec-builder@1.3.0) (2020-01-27)


### Features

* **openapi-spec-builder:** add components ([6f89655](https://github.com/loopbackio/loopback-next/commit/6f89655d093f93ffe9630205a48b237df5195ea0))





## [1.2.21](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@1.2.20...@loopback/openapi-spec-builder@1.2.21) (2020-01-07)

**Note:** Version bump only for package @loopback/openapi-spec-builder





## [1.2.20](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@1.2.19...@loopback/openapi-spec-builder@1.2.20) (2019-12-09)

**Note:** Version bump only for package @loopback/openapi-spec-builder





## [1.2.19](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@1.2.18...@loopback/openapi-spec-builder@1.2.19) (2019-11-25)

**Note:** Version bump only for package @loopback/openapi-spec-builder





## [1.2.18](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@1.2.17...@loopback/openapi-spec-builder@1.2.18) (2019-11-12)

**Note:** Version bump only for package @loopback/openapi-spec-builder





## [1.2.17](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@1.2.16...@loopback/openapi-spec-builder@1.2.17) (2019-10-24)

**Note:** Version bump only for package @loopback/openapi-spec-builder





## [1.2.16](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@1.2.15...@loopback/openapi-spec-builder@1.2.16) (2019-10-07)

**Note:** Version bump only for package @loopback/openapi-spec-builder





## [1.2.15](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@1.2.14...@loopback/openapi-spec-builder@1.2.15) (2019-09-28)

**Note:** Version bump only for package @loopback/openapi-spec-builder





## [1.2.14](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@1.2.13...@loopback/openapi-spec-builder@1.2.14) (2019-09-27)

**Note:** Version bump only for package @loopback/openapi-spec-builder





## [1.2.13](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@1.2.12...@loopback/openapi-spec-builder@1.2.13) (2019-09-17)

**Note:** Version bump only for package @loopback/openapi-spec-builder





## [1.2.12](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@1.2.11...@loopback/openapi-spec-builder@1.2.12) (2019-09-06)

**Note:** Version bump only for package @loopback/openapi-spec-builder





## [1.2.11](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@1.2.10...@loopback/openapi-spec-builder@1.2.11) (2019-09-03)

**Note:** Version bump only for package @loopback/openapi-spec-builder





## [1.2.10](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@1.2.9...@loopback/openapi-spec-builder@1.2.10) (2019-08-19)

**Note:** Version bump only for package @loopback/openapi-spec-builder





## [1.2.9](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@1.2.8...@loopback/openapi-spec-builder@1.2.9) (2019-08-15)

**Note:** Version bump only for package @loopback/openapi-spec-builder





## [1.2.8](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@1.2.7...@loopback/openapi-spec-builder@1.2.8) (2019-07-31)

**Note:** Version bump only for package @loopback/openapi-spec-builder





## [1.2.7](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@1.2.6...@loopback/openapi-spec-builder@1.2.7) (2019-07-26)

**Note:** Version bump only for package @loopback/openapi-spec-builder





## [1.2.6](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@1.2.5...@loopback/openapi-spec-builder@1.2.6) (2019-07-17)

**Note:** Version bump only for package @loopback/openapi-spec-builder





## [1.2.5](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@1.2.4...@loopback/openapi-spec-builder@1.2.5) (2019-06-28)

**Note:** Version bump only for package @loopback/openapi-spec-builder





## [1.2.4](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@1.2.3...@loopback/openapi-spec-builder@1.2.4) (2019-06-21)

**Note:** Version bump only for package @loopback/openapi-spec-builder





## [1.2.3](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@1.2.2...@loopback/openapi-spec-builder@1.2.3) (2019-06-20)

**Note:** Version bump only for package @loopback/openapi-spec-builder





## [1.2.2](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@1.2.1...@loopback/openapi-spec-builder@1.2.2) (2019-06-17)

**Note:** Version bump only for package @loopback/openapi-spec-builder





## [1.2.1](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@1.2.0...@loopback/openapi-spec-builder@1.2.1) (2019-06-06)

**Note:** Version bump only for package @loopback/openapi-spec-builder





# [1.2.0](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@1.1.13...@loopback/openapi-spec-builder@1.2.0) (2019-06-03)


### Features

* replace tslint with eslint ([44185a7](https://github.com/loopbackio/loopback-next/commit/44185a7))





## [1.1.13](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@1.1.12...@loopback/openapi-spec-builder@1.1.13) (2019-05-31)

**Note:** Version bump only for package @loopback/openapi-spec-builder





## [1.1.12](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@1.1.11...@loopback/openapi-spec-builder@1.1.12) (2019-05-30)

**Note:** Version bump only for package @loopback/openapi-spec-builder





## [1.1.11](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@1.1.10...@loopback/openapi-spec-builder@1.1.11) (2019-05-23)

**Note:** Version bump only for package @loopback/openapi-spec-builder





## [1.1.10](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@1.1.9...@loopback/openapi-spec-builder@1.1.10) (2019-05-14)

**Note:** Version bump only for package @loopback/openapi-spec-builder





## [1.1.9](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@1.1.8...@loopback/openapi-spec-builder@1.1.9) (2019-05-10)

**Note:** Version bump only for package @loopback/openapi-spec-builder





## [1.1.8](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@1.1.7...@loopback/openapi-spec-builder@1.1.8) (2019-05-09)

**Note:** Version bump only for package @loopback/openapi-spec-builder





## [1.1.7](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@1.1.6...@loopback/openapi-spec-builder@1.1.7) (2019-05-06)

**Note:** Version bump only for package @loopback/openapi-spec-builder





## [1.1.6](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@1.1.5...@loopback/openapi-spec-builder@1.1.6) (2019-04-20)

**Note:** Version bump only for package @loopback/openapi-spec-builder





## [1.1.5](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@1.1.4...@loopback/openapi-spec-builder@1.1.5) (2019-04-11)

**Note:** Version bump only for package @loopback/openapi-spec-builder





## [1.1.4](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@1.1.3...@loopback/openapi-spec-builder@1.1.4) (2019-04-09)

**Note:** Version bump only for package @loopback/openapi-spec-builder





## [1.1.3](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@1.1.2...@loopback/openapi-spec-builder@1.1.3) (2019-04-05)

**Note:** Version bump only for package @loopback/openapi-spec-builder





## [1.1.2](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@1.1.1...@loopback/openapi-spec-builder@1.1.2) (2019-03-22)

**Note:** Version bump only for package @loopback/openapi-spec-builder





## [1.1.1](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@1.1.0...@loopback/openapi-spec-builder@1.1.1) (2019-03-22)

**Note:** Version bump only for package @loopback/openapi-spec-builder





# [1.1.0](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@1.0.7...@loopback/openapi-spec-builder@1.1.0) (2019-03-12)


### Features

* **openapi-spec-builder:** improve openapi spec builder and add tests ([8c7bd86](https://github.com/loopbackio/loopback-next/commit/8c7bd86))





## [1.0.7](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@1.0.6...@loopback/openapi-spec-builder@1.0.7) (2019-02-25)

**Note:** Version bump only for package @loopback/openapi-spec-builder





## [1.0.6](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@1.0.5...@loopback/openapi-spec-builder@1.0.6) (2019-02-08)

**Note:** Version bump only for package @loopback/openapi-spec-builder





## [1.0.5](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@1.0.4...@loopback/openapi-spec-builder@1.0.5) (2019-01-28)

**Note:** Version bump only for package @loopback/openapi-spec-builder





## [1.0.4](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@1.0.3...@loopback/openapi-spec-builder@1.0.4) (2019-01-14)

**Note:** Version bump only for package @loopback/openapi-spec-builder





## [1.0.3](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@1.0.2...@loopback/openapi-spec-builder@1.0.3) (2018-12-20)

**Note:** Version bump only for package @loopback/openapi-spec-builder





## [1.0.2](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@1.0.1...@loopback/openapi-spec-builder@1.0.2) (2018-12-13)

**Note:** Version bump only for package @loopback/openapi-spec-builder





<a name="1.0.1"></a>
## [1.0.1](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@1.0.0...@loopback/openapi-spec-builder@1.0.1) (2018-11-08)

**Note:** Version bump only for package @loopback/openapi-spec-builder





<a name="0.9.6"></a>
## [0.9.6](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@0.9.5...@loopback/openapi-spec-builder@0.9.6) (2018-10-08)

**Note:** Version bump only for package @loopback/openapi-spec-builder





<a name="0.9.5"></a>
## [0.9.5](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@0.9.4...@loopback/openapi-spec-builder@0.9.5) (2018-10-05)

**Note:** Version bump only for package @loopback/openapi-spec-builder





<a name="0.9.4"></a>
## [0.9.4](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@0.9.3...@loopback/openapi-spec-builder@0.9.4) (2018-10-03)

**Note:** Version bump only for package @loopback/openapi-spec-builder





<a name="0.9.3"></a>
## [0.9.3](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@0.9.2...@loopback/openapi-spec-builder@0.9.3) (2018-09-27)

**Note:** Version bump only for package @loopback/openapi-spec-builder





<a name="0.9.2"></a>
## [0.9.2](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@0.9.1...@loopback/openapi-spec-builder@0.9.2) (2018-09-25)

**Note:** Version bump only for package @loopback/openapi-spec-builder





<a name="0.9.1"></a>
## [0.9.1](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@0.9.0...@loopback/openapi-spec-builder@0.9.1) (2018-09-21)

**Note:** Version bump only for package @loopback/openapi-spec-builder





<a name="0.9.0"></a>
# [0.9.0](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@0.8.8...@loopback/openapi-spec-builder@0.9.0) (2018-09-14)


### Features

* **openapi-v3:** add support for openapi responses ([0ecaecd](https://github.com/loopbackio/loopback-next/commit/0ecaecd))





<a name="0.8.8"></a>
## [0.8.8](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@0.8.7...@loopback/openapi-spec-builder@0.8.8) (2018-09-12)

**Note:** Version bump only for package @loopback/openapi-spec-builder





<a name="0.8.7"></a>
## [0.8.7](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@0.8.6...@loopback/openapi-spec-builder@0.8.7) (2018-09-10)

**Note:** Version bump only for package @loopback/openapi-spec-builder





<a name="0.8.6"></a>
## [0.8.6](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@0.8.5...@loopback/openapi-spec-builder@0.8.6) (2018-09-08)

**Note:** Version bump only for package @loopback/openapi-spec-builder





<a name="0.8.5"></a>
## [0.8.5](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@0.8.4...@loopback/openapi-spec-builder@0.8.5) (2018-08-24)

**Note:** Version bump only for package @loopback/openapi-spec-builder





<a name="0.8.4"></a>
## [0.8.4](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@0.8.3...@loopback/openapi-spec-builder@0.8.4) (2018-08-15)




**Note:** Version bump only for package @loopback/openapi-spec-builder

<a name="0.8.3"></a>
## [0.8.3](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@0.8.2...@loopback/openapi-spec-builder@0.8.3) (2018-08-08)




**Note:** Version bump only for package @loopback/openapi-spec-builder

<a name="0.8.2"></a>
## [0.8.2](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@0.8.1...@loopback/openapi-spec-builder@0.8.2) (2018-07-21)




**Note:** Version bump only for package @loopback/openapi-spec-builder

<a name="0.8.1"></a>
## [0.8.1](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@0.8.0...@loopback/openapi-spec-builder@0.8.1) (2018-07-20)




**Note:** Version bump only for package @loopback/openapi-spec-builder

<a name="0.8.0"></a>
# [0.8.0](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@0.7.11...@loopback/openapi-spec-builder@0.8.0) (2018-07-20)




**Note:** Version bump only for package @loopback/openapi-spec-builder

<a name="0.7.11"></a>
## [0.7.11](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@0.7.10...@loopback/openapi-spec-builder@0.7.11) (2018-07-10)




**Note:** Version bump only for package @loopback/openapi-spec-builder

<a name="0.7.10"></a>
## [0.7.10](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@0.7.9...@loopback/openapi-spec-builder@0.7.10) (2018-06-28)




**Note:** Version bump only for package @loopback/openapi-spec-builder

<a name="0.7.9"></a>
## [0.7.9](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@0.7.8...@loopback/openapi-spec-builder@0.7.9) (2018-06-27)




**Note:** Version bump only for package @loopback/openapi-spec-builder

<a name="0.7.8"></a>
## [0.7.8](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@0.7.7...@loopback/openapi-spec-builder@0.7.8) (2018-06-20)




**Note:** Version bump only for package @loopback/openapi-spec-builder

<a name="0.7.7"></a>
## [0.7.7](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@0.7.5...@loopback/openapi-spec-builder@0.7.7) (2018-06-09)




**Note:** Version bump only for package @loopback/openapi-spec-builder

<a name="0.7.6"></a>
## [0.7.6](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@0.7.5...@loopback/openapi-spec-builder@0.7.6) (2018-06-09)




**Note:** Version bump only for package @loopback/openapi-spec-builder

<a name="0.7.5"></a>
## [0.7.5](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@0.7.4...@loopback/openapi-spec-builder@0.7.5) (2018-06-08)




**Note:** Version bump only for package @loopback/openapi-spec-builder

<a name="0.7.4"></a>
## [0.7.4](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@0.7.3...@loopback/openapi-spec-builder@0.7.4) (2018-05-20)




**Note:** Version bump only for package @loopback/openapi-spec-builder

<a name="0.7.3"></a>
## [0.7.3](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@0.7.2...@loopback/openapi-spec-builder@0.7.3) (2018-05-14)


### Bug Fixes

* change index.d.ts files to point to dist8 ([42ca42d](https://github.com/loopbackio/loopback-next/commit/42ca42d))




<a name="0.7.2"></a>
## [0.7.2](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@0.7.1...@loopback/openapi-spec-builder@0.7.2) (2018-05-14)




**Note:** Version bump only for package @loopback/openapi-spec-builder

<a name="0.7.1"></a>
## [0.7.1](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@0.7.0...@loopback/openapi-spec-builder@0.7.1) (2018-05-08)




**Note:** Version bump only for package @loopback/openapi-spec-builder

<a name="0.7.0"></a>
# [0.7.0](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@0.5.1...@loopback/openapi-spec-builder@0.7.0) (2018-05-03)


### Features

* add helper package "dist-util" ([532f153](https://github.com/loopbackio/loopback-next/commit/532f153))




<a name="0.6.0"></a>
# [0.6.0](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@0.5.1...@loopback/openapi-spec-builder@0.6.0) (2018-05-03)


### Features

* add helper package "dist-util" ([532f153](https://github.com/loopbackio/loopback-next/commit/532f153))




<a name="0.5.1"></a>
## [0.5.1](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@0.5.0...@loopback/openapi-spec-builder@0.5.1) (2018-04-25)




**Note:** Version bump only for package @loopback/openapi-spec-builder

<a name="0.5.0"></a>
# [0.5.0](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@0.4.5...@loopback/openapi-spec-builder@0.5.0) (2018-04-16)




**Note:** Version bump only for package @loopback/openapi-spec-builder

<a name="0.4.5"></a>
## [0.4.5](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@0.4.4...@loopback/openapi-spec-builder@0.4.5) (2018-04-11)




**Note:** Version bump only for package @loopback/openapi-spec-builder

<a name="0.4.4"></a>
## [0.4.4](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@0.4.2...@loopback/openapi-spec-builder@0.4.4) (2018-04-11)




**Note:** Version bump only for package @loopback/openapi-spec-builder

<a name="0.4.3"></a>
## [0.4.3](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@0.4.2...@loopback/openapi-spec-builder@0.4.3) (2018-04-06)




**Note:** Version bump only for package @loopback/openapi-spec-builder

<a name="0.4.2"></a>
## [0.4.2](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@0.4.1...@loopback/openapi-spec-builder@0.4.2) (2018-04-04)




**Note:** Version bump only for package @loopback/openapi-spec-builder

<a name="0.4.1"></a>
## [0.4.1](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@0.4.0...@loopback/openapi-spec-builder@0.4.1) (2018-04-02)




**Note:** Version bump only for package @loopback/openapi-spec-builder

<a name="0.4.0"></a>
# [0.4.0](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@0.3.4...@loopback/openapi-spec-builder@0.4.0) (2018-03-29)




**Note:** Version bump only for package @loopback/openapi-spec-builder

<a name="0.3.4"></a>
## [0.3.4](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@0.3.3...@loopback/openapi-spec-builder@0.3.4) (2018-03-23)




**Note:** Version bump only for package @loopback/openapi-spec-builder

<a name="0.3.3"></a>
## [0.3.3](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@0.3.2...@loopback/openapi-spec-builder@0.3.3) (2018-03-14)




**Note:** Version bump only for package @loopback/openapi-spec-builder

<a name="0.3.2"></a>
## [0.3.2](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@0.3.1...@loopback/openapi-spec-builder@0.3.2) (2018-03-13)




**Note:** Version bump only for package @loopback/openapi-spec-builder

<a name="0.3.1"></a>
## [0.3.1](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@0.3.0...@loopback/openapi-spec-builder@0.3.1) (2018-03-08)




**Note:** Version bump only for package @loopback/openapi-spec-builder

<a name="0.3.0"></a>
# [0.3.0](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@0.2.0...@loopback/openapi-spec-builder@0.3.0) (2018-03-06)


### Bug Fixes

* fix typo of `additional` ([2fd7610](https://github.com/loopbackio/loopback-next/commit/2fd7610))


### Features

* upgrade from swagger 2 to openapi 3 ([71e5af1](https://github.com/loopbackio/loopback-next/commit/71e5af1))




<a name="0.2.0"></a>
# [0.2.0](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@0.1.2...@loopback/openapi-spec-builder@0.2.0) (2018-03-01)




**Note:** Version bump only for package @loopback/openapi-spec-builder

<a name="0.1.2"></a>
## [0.1.2](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@0.1.1...@loopback/openapi-spec-builder@0.1.2) (2018-03-01)




**Note:** Version bump only for package @loopback/openapi-spec-builder

<a name="0.1.1"></a>
## [0.1.1](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@0.1.0...@loopback/openapi-spec-builder@0.1.1) (2018-02-23)




**Note:** Version bump only for package @loopback/openapi-spec-builder

<a name="0.1.0"></a>
# [0.1.0](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@4.0.0-alpha.22...@loopback/openapi-spec-builder@0.1.0) (2018-02-21)




**Note:** Version bump only for package @loopback/openapi-spec-builder

<a name="4.0.0-alpha.22"></a>
# [4.0.0-alpha.22](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@4.0.0-alpha.21...@loopback/openapi-spec-builder@4.0.0-alpha.22) (2018-02-07)


### build

* drop dist6 related targets ([#945](https://github.com/loopbackio/loopback-next/issues/945)) ([a2368ce](https://github.com/loopbackio/loopback-next/commit/a2368ce))


### BREAKING CHANGES

* Support for Node.js version lower than 8.0 has been dropped.
Please upgrade to the latest Node.js 8.x LTS version.

Co-Authored-by: Taranveer Virk <taranveer@virk.cc>




<a name="4.0.0-alpha.21"></a>
# [4.0.0-alpha.21](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@4.0.0-alpha.20...@loopback/openapi-spec-builder@4.0.0-alpha.21) (2018-02-04)




**Note:** Version bump only for package @loopback/openapi-spec-builder

<a name="4.0.0-alpha.20"></a>
# [4.0.0-alpha.20](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@4.0.0-alpha.19...@loopback/openapi-spec-builder@4.0.0-alpha.20) (2018-01-30)




**Note:** Version bump only for package @loopback/openapi-spec-builder

<a name="4.0.0-alpha.19"></a>
# [4.0.0-alpha.19](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@4.0.0-alpha.18...@loopback/openapi-spec-builder@4.0.0-alpha.19) (2018-01-29)




**Note:** Version bump only for package @loopback/openapi-spec-builder

<a name="4.0.0-alpha.18"></a>
# [4.0.0-alpha.18](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@4.0.0-alpha.17...@loopback/openapi-spec-builder@4.0.0-alpha.18) (2018-01-26)




**Note:** Version bump only for package @loopback/openapi-spec-builder

<a name="4.0.0-alpha.17"></a>
# [4.0.0-alpha.17](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@4.0.0-alpha.16...@loopback/openapi-spec-builder@4.0.0-alpha.17) (2018-01-19)




**Note:** Version bump only for package @loopback/openapi-spec-builder

<a name="4.0.0-alpha.16"></a>
# [4.0.0-alpha.16](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@4.0.0-alpha.15...@loopback/openapi-spec-builder@4.0.0-alpha.16) (2018-01-11)


### Features

* **openapi-spec-builder:** add withTags function to spec-builder ([#826](https://github.com/loopbackio/loopback-next/issues/826)) ([b70f55a](https://github.com/loopbackio/loopback-next/commit/b70f55a))




<a name="4.0.0-alpha.15"></a>
# [4.0.0-alpha.15](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@4.0.0-alpha.14...@loopback/openapi-spec-builder@4.0.0-alpha.15) (2017-12-21)




**Note:** Version bump only for package @loopback/openapi-spec-builder

<a name="4.0.0-alpha.14"></a>
# [4.0.0-alpha.14](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@4.0.0-alpha.13...@loopback/openapi-spec-builder@4.0.0-alpha.14) (2017-12-11)


### Bug Fixes

* Fix node module names in source code headers ([0316f28](https://github.com/loopbackio/loopback-next/commit/0316f28))




<a name="4.0.0-alpha.13"></a>
# [4.0.0-alpha.13](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@4.0.0-alpha.12...@loopback/openapi-spec-builder@4.0.0-alpha.13) (2017-11-29)




**Note:** Version bump only for package @loopback/openapi-spec-builder

<a name="4.0.0-alpha.12"></a>
# [4.0.0-alpha.12](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@4.0.0-alpha.11...@loopback/openapi-spec-builder@4.0.0-alpha.12) (2017-11-09)




**Note:** Version bump only for package @loopback/openapi-spec-builder

<a name="4.0.0-alpha.11"></a>
# [4.0.0-alpha.11](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@4.0.0-alpha.10...@loopback/openapi-spec-builder@4.0.0-alpha.11) (2017-11-06)




**Note:** Version bump only for package @loopback/openapi-spec-builder

<a name="4.0.0-alpha.10"></a>
# [4.0.0-alpha.10](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@4.0.0-alpha.9...@loopback/openapi-spec-builder@4.0.0-alpha.10) (2017-10-31)




**Note:** Version bump only for package @loopback/openapi-spec-builder

<a name="4.0.0-alpha.9"></a>
# [4.0.0-alpha.9](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@4.0.0-alpha.8...@loopback/openapi-spec-builder@4.0.0-alpha.9) (2017-10-31)




**Note:** Version bump only for package @loopback/openapi-spec-builder

<a name="4.0.0-alpha.8"></a>
# [4.0.0-alpha.8](https://github.com/loopbackio/loopback-next/compare/@loopback/openapi-spec-builder@4.0.0-alpha.7...@loopback/openapi-spec-builder@4.0.0-alpha.8) (2017-10-25)




**Note:** Version bump only for package @loopback/openapi-spec-builder
