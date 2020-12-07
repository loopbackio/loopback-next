# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [3.13.2](https://github.com/strongloop/loopback-next/compare/@loopback/context@3.13.1...@loopback/context@3.13.2) (2020-12-07)

**Note:** Version bump only for package @loopback/context





## [3.13.1](https://github.com/strongloop/loopback-next/compare/@loopback/context@3.13.0...@loopback/context@3.13.1) (2020-11-18)


### Bug Fixes

* re-export generateUniqueId in index.ts ([e392056](https://github.com/strongloop/loopback-next/commit/e392056471cb06c603ed9313e78886fe606e34a9)), closes [#6767](https://github.com/strongloop/loopback-next/issues/6767)





# [3.13.0](https://github.com/strongloop/loopback-next/compare/@loopback/context@3.12.0...@loopback/context@3.13.0) (2020-11-05)


### Features

* **context:** add binding.toInjectable shortcut ([230923a](https://github.com/strongloop/loopback-next/commit/230923ada9f8d17038bf819a7b9b0615cedbce31))





# [3.12.0](https://github.com/strongloop/loopback-next/compare/@loopback/context@3.11.1...@loopback/context@3.12.0) (2020-10-07)


### Features

* **context:** introduce new binding scopes ([9916cfd](https://github.com/strongloop/loopback-next/commit/9916cfd4449a870f7a3378e2e674957aed7c1626))





## [3.11.1](https://github.com/strongloop/loopback-next/compare/@loopback/context@3.11.0...@loopback/context@3.11.1) (2020-09-17)

**Note:** Version bump only for package @loopback/context





# [3.11.0](https://github.com/strongloop/loopback-next/compare/@loopback/context@3.10.1...@loopback/context@3.11.0) (2020-09-15)


### Bug Fixes

* improve handling of missing design-time type metadata ([95b6a2b](https://github.com/strongloop/loopback-next/commit/95b6a2b7ce64e614720df43b905f77a53a54e438))


### Features

* **context:** add `[@injectable](https://github.com/injectable)` as a preferred decorator for `[@bind](https://github.com/bind)` ([1f75c35](https://github.com/strongloop/loopback-next/commit/1f75c35937a4190564bdade48b0782c4364f6101))
* allow dynamic value provider classes and classes with [@inject](https://github.com/inject) to be booted ([7b85cdf](https://github.com/strongloop/loopback-next/commit/7b85cdf63730ef659a4ee799f05f02eea8a1e3e8))





## [3.10.1](https://github.com/strongloop/loopback-next/compare/@loopback/context@3.10.0...@loopback/context@3.10.1) (2020-08-27)

**Note:** Version bump only for package @loopback/context





# [3.10.0](https://github.com/strongloop/loopback-next/compare/@loopback/context@3.9.4...@loopback/context@3.10.0) (2020-08-19)


### Features

* **context:** propagate resolution session to dynamic value factory ([60929f1](https://github.com/strongloop/loopback-next/commit/60929f1193b3ac0eadc3b70e3e3efc8206e40bab))





## [3.9.4](https://github.com/strongloop/loopback-next/compare/@loopback/context@3.9.3...@loopback/context@3.9.4) (2020-08-05)

**Note:** Version bump only for package @loopback/context





## [3.9.3](https://github.com/strongloop/loopback-next/compare/@loopback/context@3.9.2...@loopback/context@3.9.3) (2020-07-20)


### Bug Fixes

* **context:** destroy debug instances to avoid memory leak ([a28d53c](https://github.com/strongloop/loopback-next/commit/a28d53c8951bf71af62f5238d694662905d1a8f6))





## [3.9.2](https://github.com/strongloop/loopback-next/compare/@loopback/context@3.9.1...@loopback/context@3.9.2) (2020-06-30)

**Note:** Version bump only for package @loopback/context





## [3.9.1](https://github.com/strongloop/loopback-next/compare/@loopback/context@3.9.0...@loopback/context@3.9.1) (2020-06-23)


### Bug Fixes

* set node version to >=10.16 to support events.once ([e39da1c](https://github.com/strongloop/loopback-next/commit/e39da1ca47728eafaf83c10ce35b09b03b6a4edc))
* **context:** cache binding value or promise as-is to avoid racing condition ([38b9b96](https://github.com/strongloop/loopback-next/commit/38b9b968e5b0c033d9a1f4a304c4cebbb345fac7))





# [3.9.0](https://github.com/strongloop/loopback-next/compare/@loopback/context@3.8.2...@loopback/context@3.9.0) (2020-06-11)


### Features

* **context:** add `tryCatchFinally` helper function for value or promise ([c764ac6](https://github.com/strongloop/loopback-next/commit/c764ac61c3305fba5f8c59357243507e8a940ba6))
* **context:** add strongly typed `on` and `once` methods ([3f14bfa](https://github.com/strongloop/loopback-next/commit/3f14bfa05679fd2642221a9bba0a0e80864b706d))
* **context:** improve error reporting with more contextual information ([2a30484](https://github.com/strongloop/loopback-next/commit/2a30484f90b08803f14669524f8eb64c35031da9))
* **context:** use a faster UID generator ([e5e3d19](https://github.com/strongloop/loopback-next/commit/e5e3d193a182b364a0877dd223be7a0d936a91cd))





## [3.8.2](https://github.com/strongloop/loopback-next/compare/@loopback/context@3.8.1...@loopback/context@3.8.2) (2020-05-28)

**Note:** Version bump only for package @loopback/context





## [3.8.1](https://github.com/strongloop/loopback-next/compare/@loopback/context@3.8.0...@loopback/context@3.8.1) (2020-05-20)

**Note:** Version bump only for package @loopback/context





# [3.8.0](https://github.com/strongloop/loopback-next/compare/@loopback/context@3.7.0...@loopback/context@3.8.0) (2020-05-19)


### Bug Fixes

* **context:** check parameter design type for method injections ([7e81e10](https://github.com/strongloop/loopback-next/commit/7e81e10f8d5c5c5cd9be0e091fde9bf8c4b1e3b3))


### Features

* **context:** allow bindings to be created from dynamic value provider classes ([9e15154](https://github.com/strongloop/loopback-next/commit/9e15154dae3a3b51b5e090ecfe4052f416051332))
* **context:** pass resolution context to the factory function for toDynamicValue() ([6513d3f](https://github.com/strongloop/loopback-next/commit/6513d3f5e36b90f58501cfbf311b2b26210d44dd))
* **context:** use a `_source` to keep the original value provider for bindings ([90679f3](https://github.com/strongloop/loopback-next/commit/90679f3826a8cf18f06123503a9b96c763b5dc20))
* **core:** allow extensionFilter to take a list of extension point names ([8f315eb](https://github.com/strongloop/loopback-next/commit/8f315eb46bee7365da5325a23b948df9d477bfdb))





# [3.7.0](https://github.com/strongloop/loopback-next/compare/@loopback/context@3.6.0...@loopback/context@3.7.0) (2020-05-07)


### Bug Fixes

* **context:** allow binding keys to be used with composeInterceptors() ([0663c04](https://github.com/strongloop/loopback-next/commit/0663c0425b77cbbfa6391e0c4bd92f56b590a548))


### Features

* **context:** add registerInterceptor helper function and app.interceptor ([c760966](https://github.com/strongloop/loopback-next/commit/c76096684771ffaf535b75b025892ccfb057bff0))
* **context:** allow composition of intercetors ([261e9eb](https://github.com/strongloop/loopback-next/commit/261e9eb7d197fc480ab241bdd3b70b8a6e272908))
* **context:** allows bindings with singleton/context scopes to be refreshed ([8155147](https://github.com/strongloop/loopback-next/commit/8155147ceae756b60a0c9289f94ea8be6199c6d7))
* **context:** allows default namespace for bindings from classes ([ec2da01](https://github.com/strongloop/loopback-next/commit/ec2da01d766881da1c90dd47c50f8af319e04614))
* **context:** consolidate uuid generation and testing ([5abe25e](https://github.com/strongloop/loopback-next/commit/5abe25ecc2632b0d25140b5e863dfee446c29a01))
* **context:** force interceptor functions to return a value ([5663a76](https://github.com/strongloop/loopback-next/commit/5663a7642cbbb43fab08020d398393d0aabeed86))
* **context:** relax parameter type for isProviderClass() ([aafe7d0](https://github.com/strongloop/loopback-next/commit/aafe7d002a3bc0d2a1db5aceb054f25cb4f4f11f))





# [3.6.0](https://github.com/strongloop/loopback-next/compare/@loopback/context@3.5.1...@loopback/context@3.6.0) (2020-04-29)


### Features

* **context:** add `BindingKey.generate` to generate unique binding keys ([9478d31](https://github.com/strongloop/loopback-next/commit/9478d319a472e1dca4122a29dbb414ce1525bdb0))





## [3.5.1](https://github.com/strongloop/loopback-next/compare/@loopback/context@3.5.0...@loopback/context@3.5.1) (2020-04-23)

**Note:** Version bump only for package @loopback/context





# [3.5.0](https://github.com/strongloop/loopback-next/compare/@loopback/context@3.4.0...@loopback/context@3.5.0) (2020-04-22)


### Features

* update package.json and .travis.yml for builds ([cb2b8e6](https://github.com/strongloop/loopback-next/commit/cb2b8e6a18616dda7783c0193091039d4e608131))
* **context:** allow explicit invocation source for proxies ([98115f2](https://github.com/strongloop/loopback-next/commit/98115f299e250f124791ff211ae686a4d8c964ce))
* **context:** improve generic typing for binding inspection ([819fabb](https://github.com/strongloop/loopback-next/commit/819fabb04390ce8268c1dc7869253b01eafde4cb))





# [3.4.0](https://github.com/strongloop/loopback-next/compare/@loopback/context@3.3.0...@loopback/context@3.4.0) (2020-04-11)


### Features

* **context:** expose debug method to subclasses ([f651e5b](https://github.com/strongloop/loopback-next/commit/f651e5be28efe624e83a7139152ed00554580dca))





# [3.3.0](https://github.com/strongloop/loopback-next/compare/@loopback/context@3.2.0...@loopback/context@3.3.0) (2020-04-08)


### Bug Fixes

* **context:** fix context observer to catch errors by waitUntilPendingNotificationsDone ([3dad6c0](https://github.com/strongloop/loopback-next/commit/3dad6c0c22ef23506daf6f7d7ad28c247e6080c5))


### Features

* remove Node.js 8.x polyfill for Symbol.asyncIterator ([eeb8772](https://github.com/strongloop/loopback-next/commit/eeb877276cf62d32856eb7227d78618ab4c93c2e))





# [3.2.0](https://github.com/strongloop/loopback-next/compare/@loopback/context@3.1.0...@loopback/context@3.2.0) (2020-03-24)


### Features

* **context:** emit bind/unbind events on ContextView ([65e3d38](https://github.com/strongloop/loopback-next/commit/65e3d38a34b351929ba422de667bc236e9619ebe))
* **context:** improve context view for bind/unbind events ([6a5f90a](https://github.com/strongloop/loopback-next/commit/6a5f90aadb5f5ba213f2da7ea7843f488a09f95d))





# [3.1.0](https://github.com/strongloop/loopback-next/compare/@loopback/context@3.0.0...@loopback/context@3.1.0) (2020-03-17)


### Features

* **context:** introduce TagValueMatcher for more flexible tag matching ([deaf2ed](https://github.com/strongloop/loopback-next/commit/deaf2eda29421e73244d3d27006b502c7dcc25e2))





# [3.0.0](https://github.com/strongloop/loopback-next/compare/@loopback/context@2.1.1...@loopback/context@3.0.0) (2020-03-05)


### chore

* remove support for Node.js v8.x ([4281d9d](https://github.com/strongloop/loopback-next/commit/4281d9df50f0715d32879e1442a90b643ec8f542))


### Features

* **context:** allow tags to be matched by a given name with any value ([7cf053e](https://github.com/strongloop/loopback-next/commit/7cf053e49f46b93033c6b7c5e80daffe8406b2af))
* **context:** remove generic parameters from `BindingFilter` type ([1ce33af](https://github.com/strongloop/loopback-next/commit/1ce33afeefc1c928085ed505adaa32cc06574a0c))
* add `tslib` as dependency ([a6e0b4c](https://github.com/strongloop/loopback-next/commit/a6e0b4ce7b862764167cefedee14c1115b25e0a4)), closes [#4676](https://github.com/strongloop/loopback-next/issues/4676)
* **context:** improve ctx.inspect() to allow classes with colliding names ([e7380fc](https://github.com/strongloop/loopback-next/commit/e7380fc467fe43fd801d8eca05e37745fc922aed))


### BREAKING CHANGES

* **context:** The type `BindingFilter` is no longer generic. Please
update your code and remove any generic arguments provided for the type.

```diff
- BindingFilter<SomeType>
+ BindingFilter
```

Signed-off-by: Miroslav Bajtoš <mbajtoss@gmail.com>
* Node.js v8.x is now end of life. Please upgrade to version
10 and above. See https://nodejs.org/en/about/releases.





## [2.1.1](https://github.com/strongloop/loopback-next/compare/@loopback/context@2.1.0...@loopback/context@2.1.1) (2020-02-06)


### Bug Fixes

* **context:** relax checking on instances of BindingKey class ([8668eb6](https://github.com/strongloop/loopback-next/commit/8668eb64b267e2644be87db92aeb86188d7e86f7))





# [2.1.0](https://github.com/strongloop/loopback-next/compare/@loopback/context@2.0.0...@loopback/context@2.1.0) (2020-02-05)


### Features

* **context:** allow more options to inspect context/binding objects ([3be32a3](https://github.com/strongloop/loopback-next/commit/3be32a34a0109e4f4f2eb0fcfa60171bd66743a6))
* **context:** improve context name with the subclass name as prefix ([42d2e1b](https://github.com/strongloop/loopback-next/commit/42d2e1b302e4c9f58df864c0ca01cb2ca181060a))
* **context:** tidy up binding information for inspection ([15d698b](https://github.com/strongloop/loopback-next/commit/15d698b46841efc0c6bc12bdc89538db77371254))





# [2.0.0](https://github.com/strongloop/loopback-next/compare/@loopback/context@1.25.1...@loopback/context@2.0.0) (2020-01-27)


### Features

* **context:** add ContextEventListener and tidy up parent event handling ([beb41a7](https://github.com/strongloop/loopback-next/commit/beb41a7b105cf1aea64982e3f43f4d5a8128581f))
* **context:** index bindings by tag to speed up matching by tag ([566b9d9](https://github.com/strongloop/loopback-next/commit/566b9d9a35ce52d9aeefe17e36f91c9714616b21))
* **context:** keep binding tag pattern for BindingTagFilter ([856b62d](https://github.com/strongloop/loopback-next/commit/856b62d7053c22ebe0f6acf6a1904e524175429c))
* **context:** make bindings as event emitters to report changes ([dddddb9](https://github.com/strongloop/loopback-next/commit/dddddb96fd6908a8d4caad8868e43d3d0bb742f6))
* **context:** refactor context observer subscription into a new class ([31ad9a5](https://github.com/strongloop/loopback-next/commit/31ad9a55bbd068cd8e41347fca5caaf0ae5eb6e7))
* **context:** set max listeners to Infinity by default ([0741e3b](https://github.com/strongloop/loopback-next/commit/0741e3b1293065a04f1ecd9dbda09df074a5dd34))
* **context:** use BindingEvent for binding event listeners ([ae5febc](https://github.com/strongloop/loopback-next/commit/ae5febc35679f4d77b9970ecc26a71938a1c972e))


### BREAKING CHANGES

* **context:** Context events are now emitted as `ContextEvent` objects
instead of positional arguments. Context listener functions must switch from
the old style to new style as follows:

1. Old style

```ts
ctx.on('bind', (binding, context) => {
// ...
});
```

2. New style

```ts
ctx.on('bind', (event: ContextEvent) => {
// ...
});
```

Or:

```ts
ctx.on('bind', ({binding, context, type}) => {
// ...
});
```





## [1.25.1](https://github.com/strongloop/loopback-next/compare/@loopback/context@1.25.0...@loopback/context@1.25.1) (2020-01-07)

**Note:** Version bump only for package @loopback/context





# [1.25.0](https://github.com/strongloop/loopback-next/compare/@loopback/context@1.24.0...@loopback/context@1.25.0) (2019-12-09)


### Features

* **context:** allow global interceptors to be applied based on source types ([77cbd01](https://github.com/strongloop/loopback-next/commit/77cbd019027e1441339735326bcfb86a23df8b66))
* **context:** make it possible to set source information for interceptions ([2a1ccb4](https://github.com/strongloop/loopback-next/commit/2a1ccb409a889d8b30b03ddf3284c9e9d5554e27))





# [1.24.0](https://github.com/strongloop/loopback-next/compare/@loopback/context@1.23.5...@loopback/context@1.24.0) (2019-11-25)


### Features

* **context:** allow current binding to be injected with `[@inject](https://github.com/inject).binding` ([c01b4c6](https://github.com/strongloop/loopback-next/commit/c01b4c6b4dcc5c7ac79832bda144b1ec0da191b1))
* **context:** improve context/binding with inspect/toJSON for metadata dumping ([ac399f7](https://github.com/strongloop/loopback-next/commit/ac399f7f105eea402ef1932bd96093baad0a009f))
* **core:** add [@service](https://github.com/service) decorator to inject a service by class/interface ([1d80904](https://github.com/strongloop/loopback-next/commit/1d80904b670724b00cb6a2965b8472f44d23eed0))





## [1.23.5](https://github.com/strongloop/loopback-next/compare/@loopback/context@1.23.4...@loopback/context@1.23.5) (2019-11-12)

**Note:** Version bump only for package @loopback/context





## [1.23.4](https://github.com/strongloop/loopback-next/compare/@loopback/context@1.23.3...@loopback/context@1.23.4) (2019-10-24)

**Note:** Version bump only for package @loopback/context





## [1.23.3](https://github.com/strongloop/loopback-next/compare/@loopback/context@1.23.2...@loopback/context@1.23.3) (2019-10-07)

**Note:** Version bump only for package @loopback/context





## [1.23.2](https://github.com/strongloop/loopback-next/compare/@loopback/context@1.23.1...@loopback/context@1.23.2) (2019-09-28)

**Note:** Version bump only for package @loopback/context





## [1.23.1](https://github.com/strongloop/loopback-next/compare/@loopback/context@1.23.0...@loopback/context@1.23.1) (2019-09-27)

**Note:** Version bump only for package @loopback/context





# [1.23.0](https://github.com/strongloop/loopback-next/compare/@loopback/context@1.22.1...@loopback/context@1.23.0) (2019-09-17)


### Features

* **context:** add more logs to simplify troubleshooting ([7752b08](https://github.com/strongloop/loopback-next/commit/7752b08))





## [1.22.1](https://github.com/strongloop/loopback-next/compare/@loopback/context@1.22.0...@loopback/context@1.22.1) (2019-09-06)


### Bug Fixes

* **context:** allow `inject` to be explicitly invoked for class ctor args ([6a0d4f2](https://github.com/strongloop/loopback-next/commit/6a0d4f2))





# [1.22.0](https://github.com/strongloop/loopback-next/compare/@loopback/context@1.21.4...@loopback/context@1.22.0) (2019-09-03)


### Features

* **context:** add decorator name for [@inject](https://github.com/inject).*, [@config](https://github.com/config).*, [@intercept](https://github.com/intercept) errors ([48e3231](https://github.com/strongloop/loopback-next/commit/48e3231))
* **context:** allow [@bind](https://github.com/bind) to be applied on the same class multiple times ([ad4d22c](https://github.com/strongloop/loopback-next/commit/ad4d22c))





## [1.21.4](https://github.com/strongloop/loopback-next/compare/@loopback/context@1.21.3...@loopback/context@1.21.4) (2019-08-19)

**Note:** Version bump only for package @loopback/context





## [1.21.3](https://github.com/strongloop/loopback-next/compare/@loopback/context@1.21.2...@loopback/context@1.21.3) (2019-08-15)

**Note:** Version bump only for package @loopback/context





## [1.21.2](https://github.com/strongloop/loopback-next/compare/@loopback/context@1.21.1...@loopback/context@1.21.2) (2019-08-15)

**Note:** Version bump only for package @loopback/context





## [1.21.1](https://github.com/strongloop/loopback-next/compare/@loopback/context@1.21.0...@loopback/context@1.21.1) (2019-07-31)

**Note:** Version bump only for package @loopback/context





# [1.21.0](https://github.com/strongloop/loopback-next/compare/@loopback/context@1.20.3...@loopback/context@1.21.0) (2019-07-26)


### Features

* **context:** allow [@config](https://github.com/config).* to specify the target binding key ([42b7b98](https://github.com/strongloop/loopback-next/commit/42b7b98))
* **context:** use invocation context for method dependency injection ([a8f326c](https://github.com/strongloop/loopback-next/commit/a8f326c))





## [1.20.3](https://github.com/strongloop/loopback-next/compare/@loopback/context@1.20.2...@loopback/context@1.20.3) (2019-07-17)

**Note:** Version bump only for package @loopback/context





## [1.20.2](https://github.com/strongloop/loopback-next/compare/@loopback/context@1.20.1...@loopback/context@1.20.2) (2019-06-28)


### Bug Fixes

* address violations of "no-floating-promises" rule ([0947531](https://github.com/strongloop/loopback-next/commit/0947531))





## [1.20.1](https://github.com/strongloop/loopback-next/compare/@loopback/context@1.20.0...@loopback/context@1.20.1) (2019-06-21)

**Note:** Version bump only for package @loopback/context





# [1.20.0](https://github.com/strongloop/loopback-next/compare/@loopback/context@1.19.1...@loopback/context@1.20.0) (2019-06-20)


### Features

* **context:** generalize interceptors and chain for invocations ([34d31d8](https://github.com/strongloop/loopback-next/commit/34d31d8))





## [1.19.1](https://github.com/strongloop/loopback-next/compare/@loopback/context@1.19.0...@loopback/context@1.19.1) (2019-06-17)

**Note:** Version bump only for package @loopback/context





# [1.19.0](https://github.com/strongloop/loopback-next/compare/@loopback/context@1.18.0...@loopback/context@1.19.0) (2019-06-06)


### Features

* **context:** add `[@global](https://github.com/global)Interceptor` decorator ([1010a37](https://github.com/strongloop/loopback-next/commit/1010a37))





# [1.18.0](https://github.com/strongloop/loopback-next/compare/@loopback/context@1.17.1...@loopback/context@1.18.0) (2019-06-03)


### Features

* replace tslint with eslint ([44185a7](https://github.com/strongloop/loopback-next/commit/44185a7))





## [1.17.1](https://github.com/strongloop/loopback-next/compare/@loopback/context@1.17.0...@loopback/context@1.17.1) (2019-05-31)

**Note:** Version bump only for package @loopback/context





# [1.17.0](https://github.com/strongloop/loopback-next/compare/@loopback/context@1.16.0...@loopback/context@1.17.0) (2019-05-30)


### Bug Fixes

* **context:** allow injection when a class decorator returns a mixin ([28cc0a0](https://github.com/strongloop/loopback-next/commit/28cc0a0))
* **context:** allow optional for a binding without value getter ([e211a71](https://github.com/strongloop/loopback-next/commit/e211a71))


### Features

* **context:** make parent public for invocation context ([19856c6](https://github.com/strongloop/loopback-next/commit/19856c6))


### Performance Improvements

* **context:** cache description of method parameter injections ([127f7c2](https://github.com/strongloop/loopback-next/commit/127f7c2))





# [1.16.0](https://github.com/strongloop/loopback-next/compare/@loopback/context@1.15.0...@loopback/context@1.16.0) (2019-05-23)


### Features

* **context:** add singleValue to ContextView ([22bd57f](https://github.com/strongloop/loopback-next/commit/22bd57f))
* **context:** leave local bindings and parent unchanged during close ([198af88](https://github.com/strongloop/loopback-next/commit/198af88))
* **context:** support binding config and [@inject](https://github.com/inject).config ([a392852](https://github.com/strongloop/loopback-next/commit/a392852))





# [1.15.0](https://github.com/strongloop/loopback-next/compare/@loopback/context@1.14.0...@loopback/context@1.15.0) (2019-05-14)


### Features

* **context:** add binding comparator to sort bindings ([ae3d61f](https://github.com/strongloop/loopback-next/commit/ae3d61f))





# [1.14.0](https://github.com/strongloop/loopback-next/compare/@loopback/context@1.13.0...@loopback/context@1.14.0) (2019-05-10)


### Bug Fixes

* **context:** close invocation context only after async is done ([e71e990](https://github.com/strongloop/loopback-next/commit/e71e990))


### Features

* **context:** add more getters for InvocationContext ([12a3ecb](https://github.com/strongloop/loopback-next/commit/12a3ecb))





# [1.13.0](https://github.com/strongloop/loopback-next/compare/@loopback/context@1.12.1...@loopback/context@1.13.0) (2019-05-09)


### Features

* **context:** add support for method interceptors ([293188d](https://github.com/strongloop/loopback-next/commit/293188d))





## [1.12.1](https://github.com/strongloop/loopback-next/compare/@loopback/context@1.12.0...@loopback/context@1.12.1) (2019-05-06)

**Note:** Version bump only for package @loopback/context





# [1.12.0](https://github.com/strongloop/loopback-next/compare/@loopback/context@1.11.0...@loopback/context@1.12.0) (2019-04-20)


### Features

* **build:** add more TypeScript "strict" checks ([866aa2f](https://github.com/strongloop/loopback-next/commit/866aa2f))
* **context:** add `[@inject](https://github.com/inject).binding` and improve `[@inject](https://github.com/inject).setter` ([a396274](https://github.com/strongloop/loopback-next/commit/a396274))
* **context:** fix generic typing for BindingFilter ([372b406](https://github.com/strongloop/loopback-next/commit/372b406))





# [1.11.0](https://github.com/strongloop/loopback-next/compare/@loopback/context@1.10.0...@loopback/context@1.11.0) (2019-04-11)


### Bug Fixes

* **context:** instantiate class with non-injected arguments ([6699825](https://github.com/strongloop/loopback-next/commit/6699825))


### Features

* **context:** make Injection.metadata a required property ([dcc9cac](https://github.com/strongloop/loopback-next/commit/dcc9cac))





# [1.10.0](https://github.com/strongloop/loopback-next/compare/@loopback/context@1.9.0...@loopback/context@1.10.0) (2019-04-09)


### Features

* **context:** always pass the session to ResolverFunction ([bf36532](https://github.com/strongloop/loopback-next/commit/bf36532))





# [1.9.0](https://github.com/strongloop/loopback-next/compare/@loopback/context@1.8.1...@loopback/context@1.9.0) (2019-04-05)


### Bug Fixes

* **context:** clear binding cache upon scope or value getter changes ([122fe7b](https://github.com/strongloop/loopback-next/commit/122fe7b))


### Features

* **context:** add a helper function to create a getter from binding filter ([41248f3](https://github.com/strongloop/loopback-next/commit/41248f3))
* **context:** add binding.toAlias() to resolve values from another binding ([15dcd16](https://github.com/strongloop/loopback-next/commit/15dcd16))
* **context:** pass resolution options into binding.getValue() ([705dcd5](https://github.com/strongloop/loopback-next/commit/705dcd5))





## [1.8.1](https://github.com/strongloop/loopback-next/compare/@loopback/context@1.8.0...@loopback/context@1.8.1) (2019-03-22)

**Note:** Version bump only for package @loopback/context





# [1.8.0](https://github.com/strongloop/loopback-next/compare/@loopback/context@1.7.0...@loopback/context@1.8.0) (2019-03-22)


### Features

* **context:** allow namespace tag for createBindingFromClass ([f6fe55e](https://github.com/strongloop/loopback-next/commit/f6fe55e))
* **context:** honor binding scope from [@bind](https://github.com/bind) ([3b30f01](https://github.com/strongloop/loopback-next/commit/3b30f01))
* **context:** improve typing for binding related methods ([f6cf0c6](https://github.com/strongloop/loopback-next/commit/f6cf0c6))
* **context:** tidy up context for resolving injections of a singleton binding ([f5bf43c](https://github.com/strongloop/loopback-next/commit/f5bf43c))





# [1.7.0](https://github.com/strongloop/loopback-next/compare/@loopback/context@1.6.0...@loopback/context@1.7.0) (2019-03-12)


### Features

* **context:** add [@inject](https://github.com/inject).view and extend [@inject](https://github.com/inject) for multiple bindings ([d64268b](https://github.com/strongloop/loopback-next/commit/d64268b))
* **context:** add events to ContextView ([fb10efc](https://github.com/strongloop/loopback-next/commit/fb10efc))
* **context:** introduce context view to watch bindings by filter ([04209f7](https://github.com/strongloop/loopback-next/commit/04209f7))





# [1.6.0](https://github.com/strongloop/loopback-next/compare/@loopback/context@1.5.1...@loopback/context@1.6.0) (2019-02-25)


### Features

* **context:** introduce async context observers for bind/unbind events ([e5e5fc4](https://github.com/strongloop/loopback-next/commit/e5e5fc4))





## [1.5.1](https://github.com/strongloop/loopback-next/compare/@loopback/context@1.5.0...@loopback/context@1.5.1) (2019-02-08)

**Note:** Version bump only for package @loopback/context





# [1.5.0](https://github.com/strongloop/loopback-next/compare/@loopback/context@1.4.1...@loopback/context@1.5.0) (2019-01-28)


### Features

* **context:** add default template argument for BindingAddress ([7113105](https://github.com/strongloop/loopback-next/commit/7113105))
* **context:** binding filters ([ff85e74](https://github.com/strongloop/loopback-next/commit/ff85e74))





## [1.4.1](https://github.com/strongloop/loopback-next/compare/@loopback/context@1.4.0...@loopback/context@1.4.1) (2019-01-14)


### Bug Fixes

* rework tslint comments disabling "no-unused-variable" rule ([a18a3d7](https://github.com/strongloop/loopback-next/commit/a18a3d7))





# [1.4.0](https://github.com/strongloop/loopback-next/compare/@loopback/context@1.3.0...@loopback/context@1.4.0) (2018-12-20)


### Features

* **context:** add `[@bind](https://github.com/bind)` to decorate classes with more information ([b8f9792](https://github.com/strongloop/loopback-next/commit/b8f9792))





# [1.3.0](https://github.com/strongloop/loopback-next/compare/@loopback/context@1.2.0...@loopback/context@1.3.0) (2018-12-13)


### Features

* **context:** add binding.apply(templateFn) ([f046b30](https://github.com/strongloop/loopback-next/commit/f046b30))





# [1.2.0](https://github.com/strongloop/loopback-next/compare/@loopback/context@1.1.0...@loopback/context@1.2.0) (2018-11-26)


### Features

* **rest:** allow body parsers to be extended ([86bfcbc](https://github.com/strongloop/loopback-next/commit/86bfcbc))





# [1.1.0](https://github.com/strongloop/loopback-next/compare/@loopback/context@1.0.1...@loopback/context@1.1.0) (2018-11-14)


### Features

* **context:** add support for context.add(binding) ([8f77cef](https://github.com/strongloop/loopback-next/commit/8f77cef))
* **core:** allow components to expose an array of bindings ([eae0da3](https://github.com/strongloop/loopback-next/commit/eae0da3))





<a name="1.0.1"></a>
## [1.0.1](https://github.com/strongloop/loopback-next/compare/@loopback/context@1.0.0...@loopback/context@1.0.1) (2018-11-08)

**Note:** Version bump only for package @loopback/context





<a name="0.13.2"></a>
## [0.13.2](https://github.com/strongloop/loopback-next/compare/@loopback/context@0.13.1...@loopback/context@0.13.2) (2018-10-08)

**Note:** Version bump only for package @loopback/context





<a name="0.13.1"></a>
## [0.13.1](https://github.com/strongloop/loopback-next/compare/@loopback/context@0.13.0...@loopback/context@0.13.1) (2018-10-05)

**Note:** Version bump only for package @loopback/context





<a name="0.13.0"></a>
# [0.13.0](https://github.com/strongloop/loopback-next/compare/@loopback/context@0.12.13...@loopback/context@0.13.0) (2018-10-03)


### Features

* **context:** add a helper `Getter.fromValue()` ([4764166](https://github.com/strongloop/loopback-next/commit/4764166))





<a name="0.12.13"></a>
## [0.12.13](https://github.com/strongloop/loopback-next/compare/@loopback/context@0.12.12...@loopback/context@0.12.13) (2018-09-28)

**Note:** Version bump only for package @loopback/context





<a name="0.12.12"></a>
## [0.12.12](https://github.com/strongloop/loopback-next/compare/@loopback/context@0.12.11...@loopback/context@0.12.12) (2018-09-27)

**Note:** Version bump only for package @loopback/context





<a name="0.12.11"></a>
## [0.12.11](https://github.com/strongloop/loopback-next/compare/@loopback/context@0.12.10...@loopback/context@0.12.11) (2018-09-25)

**Note:** Version bump only for package @loopback/context





<a name="0.12.10"></a>
## [0.12.10](https://github.com/strongloop/loopback-next/compare/@loopback/context@0.12.9...@loopback/context@0.12.10) (2018-09-21)

**Note:** Version bump only for package @loopback/context





<a name="0.12.9"></a>
## [0.12.9](https://github.com/strongloop/loopback-next/compare/@loopback/context@0.12.8...@loopback/context@0.12.9) (2018-09-19)

**Note:** Version bump only for package @loopback/context





<a name="0.12.8"></a>
## [0.12.8](https://github.com/strongloop/loopback-next/compare/@loopback/context@0.12.7...@loopback/context@0.12.8) (2018-09-12)

**Note:** Version bump only for package @loopback/context





<a name="0.12.7"></a>
## [0.12.7](https://github.com/strongloop/loopback-next/compare/@loopback/context@0.12.6...@loopback/context@0.12.7) (2018-09-10)

**Note:** Version bump only for package @loopback/context





<a name="0.12.6"></a>
## [0.12.6](https://github.com/strongloop/loopback-next/compare/@loopback/context@0.12.5...@loopback/context@0.12.6) (2018-09-08)

**Note:** Version bump only for package @loopback/context





<a name="0.12.5"></a>
## [0.12.5](https://github.com/strongloop/loopback-next/compare/@loopback/context@0.12.4...@loopback/context@0.12.5) (2018-08-24)

**Note:** Version bump only for package @loopback/context





<a name="0.12.4"></a>
## [0.12.4](https://github.com/strongloop/loopback-next/compare/@loopback/context@0.12.3...@loopback/context@0.12.4) (2018-08-15)


### Bug Fixes

* **context:** check constructor/method override for [@inject](https://github.com/inject) ([8c0bdb6](https://github.com/strongloop/loopback-next/commit/8c0bdb6))




<a name="0.12.3"></a>
## [0.12.3](https://github.com/strongloop/loopback-next/compare/@loopback/context@0.12.2...@loopback/context@0.12.3) (2018-08-08)




**Note:** Version bump only for package @loopback/context

<a name="0.12.2"></a>
## [0.12.2](https://github.com/strongloop/loopback-next/compare/@loopback/context@0.12.1...@loopback/context@0.12.2) (2018-07-21)




**Note:** Version bump only for package @loopback/context

<a name="0.12.1"></a>
## [0.12.1](https://github.com/strongloop/loopback-next/compare/@loopback/context@0.12.0...@loopback/context@0.12.1) (2018-07-20)




**Note:** Version bump only for package @loopback/context

<a name="0.12.0"></a>
# [0.12.0](https://github.com/strongloop/loopback-next/compare/@loopback/context@0.11.11...@loopback/context@0.12.0) (2018-07-20)




**Note:** Version bump only for package @loopback/context

<a name="0.11.11"></a>
## [0.11.11](https://github.com/strongloop/loopback-next/compare/@loopback/context@0.11.10...@loopback/context@0.11.11) (2018-07-11)




**Note:** Version bump only for package @loopback/context

<a name="0.11.10"></a>
## [0.11.10](https://github.com/strongloop/loopback-next/compare/@loopback/context@0.11.9...@loopback/context@0.11.10) (2018-07-10)




**Note:** Version bump only for package @loopback/context

<a name="0.11.9"></a>
## [0.11.9](https://github.com/strongloop/loopback-next/compare/@loopback/context@0.11.8...@loopback/context@0.11.9) (2018-06-28)




**Note:** Version bump only for package @loopback/context

<a name="0.11.8"></a>
## [0.11.8](https://github.com/strongloop/loopback-next/compare/@loopback/context@0.11.7...@loopback/context@0.11.8) (2018-06-27)




**Note:** Version bump only for package @loopback/context

<a name="0.11.7"></a>
## [0.11.7](https://github.com/strongloop/loopback-next/compare/@loopback/context@0.11.6...@loopback/context@0.11.7) (2018-06-20)




**Note:** Version bump only for package @loopback/context

<a name="0.11.6"></a>
## [0.11.6](https://github.com/strongloop/loopback-next/compare/@loopback/context@0.11.5...@loopback/context@0.11.6) (2018-06-11)


### Bug Fixes

* **context:** calculate # of method params with default ([f5f5bde](https://github.com/strongloop/loopback-next/commit/f5f5bde))




<a name="0.11.5"></a>
## [0.11.5](https://github.com/strongloop/loopback-next/compare/@loopback/context@0.11.3...@loopback/context@0.11.5) (2018-06-09)




**Note:** Version bump only for package @loopback/context

<a name="0.11.4"></a>
## [0.11.4](https://github.com/strongloop/loopback-next/compare/@loopback/context@0.11.3...@loopback/context@0.11.4) (2018-06-09)




**Note:** Version bump only for package @loopback/context

<a name="0.11.3"></a>
## [0.11.3](https://github.com/strongloop/loopback-next/compare/@loopback/context@0.11.2...@loopback/context@0.11.3) (2018-06-08)


### Bug Fixes

* make the code compatible with TypeScript 2.9.x ([37aba50](https://github.com/strongloop/loopback-next/commit/37aba50))




<a name="0.11.2"></a>
## [0.11.2](https://github.com/strongloop/loopback-next/compare/@loopback/context@0.11.1...@loopback/context@0.11.2) (2018-05-20)




**Note:** Version bump only for package @loopback/context

<a name="0.11.1"></a>
## [0.11.1](https://github.com/strongloop/loopback-next/compare/@loopback/context@0.11.0...@loopback/context@0.11.1) (2018-05-14)


### Bug Fixes

* change index.d.ts files to point to dist8 ([42ca42d](https://github.com/strongloop/loopback-next/commit/42ca42d))




<a name="0.11.0"></a>
# [0.11.0](https://github.com/strongloop/loopback-next/compare/@loopback/context@0.10.1...@loopback/context@0.11.0) (2018-05-14)


### Features

* **context:** add more utils to resolve valueOrPromises ([cc55ef5](https://github.com/strongloop/loopback-next/commit/cc55ef5))




<a name="0.10.1"></a>
## [0.10.1](https://github.com/strongloop/loopback-next/compare/@loopback/context@0.10.0...@loopback/context@0.10.1) (2018-05-08)




**Note:** Version bump only for package @loopback/context

<a name="0.10.0"></a>
# [0.10.0](https://github.com/strongloop/loopback-next/compare/@loopback/context@0.8.1...@loopback/context@0.10.0) (2018-05-03)


### Features

* **context:** allow tags to have an optional value ([95acd11](https://github.com/strongloop/loopback-next/commit/95acd11))
* add helper package "dist-util" ([532f153](https://github.com/strongloop/loopback-next/commit/532f153))




<a name="0.9.0"></a>
# [0.9.0](https://github.com/strongloop/loopback-next/compare/@loopback/context@0.8.1...@loopback/context@0.9.0) (2018-05-03)


### Features

* **context:** allow tags to have an optional value ([95acd11](https://github.com/strongloop/loopback-next/commit/95acd11))
* add helper package "dist-util" ([532f153](https://github.com/strongloop/loopback-next/commit/532f153))




<a name="0.8.1"></a>
## [0.8.1](https://github.com/strongloop/loopback-next/compare/@loopback/context@0.8.0...@loopback/context@0.8.1) (2018-04-25)




**Note:** Version bump only for package @loopback/context

<a name="0.8.0"></a>
# [0.8.0](https://github.com/strongloop/loopback-next/compare/@loopback/context@0.7.0...@loopback/context@0.8.0) (2018-04-16)




**Note:** Version bump only for package @loopback/context

<a name="0.7.0"></a>
# [0.7.0](https://github.com/strongloop/loopback-next/compare/@loopback/context@0.6.1...@loopback/context@0.7.0) (2018-04-12)


### Features

* **metadata:** add strongly-typed metadata accessors ([45f9f80](https://github.com/strongloop/loopback-next/commit/45f9f80))




<a name="0.6.1"></a>
## [0.6.1](https://github.com/strongloop/loopback-next/compare/@loopback/context@0.6.0...@loopback/context@0.6.1) (2018-04-11)




**Note:** Version bump only for package @loopback/context

<a name="0.6.0"></a>
# [0.6.0](https://github.com/strongloop/loopback-next/compare/@loopback/context@0.5.2...@loopback/context@0.6.0) (2018-04-11)


### Bug Fixes

* change file names to fit advocated naming convention ([0331df8](https://github.com/strongloop/loopback-next/commit/0331df8))


### Features

* **context:** typed binding keys ([685195c](https://github.com/strongloop/loopback-next/commit/685195c))




<a name="0.5.3"></a>
## [0.5.3](https://github.com/strongloop/loopback-next/compare/@loopback/context@0.5.2...@loopback/context@0.5.3) (2018-04-06)




**Note:** Version bump only for package @loopback/context

<a name="0.5.2"></a>
## [0.5.2](https://github.com/strongloop/loopback-next/compare/@loopback/context@0.5.1...@loopback/context@0.5.2) (2018-04-04)




**Note:** Version bump only for package @loopback/context

<a name="0.5.1"></a>
## [0.5.1](https://github.com/strongloop/loopback-next/compare/@loopback/context@0.5.0...@loopback/context@0.5.1) (2018-04-02)




**Note:** Version bump only for package @loopback/context

<a name="0.5.0"></a>
# [0.5.0](https://github.com/strongloop/loopback-next/compare/@loopback/context@0.4.0...@loopback/context@0.5.0) (2018-03-29)


### Bug Fixes

* **context:** disable deep clone of injection metadata ([7d8a84c](https://github.com/strongloop/loopback-next/commit/7d8a84c))


### BREAKING CHANGES

* **context:** the `metadata` parameter of `@inject` is no longer
cloned deeply. It's still cloned shallowly.




<a name="0.4.0"></a>
# [0.4.0](https://github.com/strongloop/loopback-next/compare/@loopback/context@0.3.0...@loopback/context@0.4.0) (2018-03-23)


### Features

* **context:** add optional typing for Binding ([3c494fa](https://github.com/strongloop/loopback-next/commit/3c494fa))




<a name="0.3.0"></a>
# [0.3.0](https://github.com/strongloop/loopback-next/compare/@loopback/context@0.2.4...@loopback/context@0.3.0) (2018-03-21)




**Note:** Version bump only for package @loopback/context

<a name="0.2.4"></a>
## [0.2.4](https://github.com/strongloop/loopback-next/compare/@loopback/context@0.2.3...@loopback/context@0.2.4) (2018-03-14)




**Note:** Version bump only for package @loopback/context

<a name="0.2.3"></a>
## [0.2.3](https://github.com/strongloop/loopback-next/compare/@loopback/context@0.2.2...@loopback/context@0.2.3) (2018-03-13)




**Note:** Version bump only for package @loopback/context

<a name="0.2.2"></a>
## [0.2.2](https://github.com/strongloop/loopback-next/compare/@loopback/context@0.2.1...@loopback/context@0.2.2) (2018-03-08)




**Note:** Version bump only for package @loopback/context

<a name="0.2.1"></a>
## [0.2.1](https://github.com/strongloop/loopback-next/compare/@loopback/context@0.2.0...@loopback/context@0.2.1) (2018-03-06)


### Bug Fixes

* fix typo of `additional` ([2fd7610](https://github.com/strongloop/loopback-next/commit/2fd7610))




<a name="0.2.0"></a>
# [0.2.0](https://github.com/strongloop/loopback-next/compare/@loopback/context@0.1.2...@loopback/context@0.2.0) (2018-03-01)




**Note:** Version bump only for package @loopback/context

<a name="0.1.2"></a>
## [0.1.2](https://github.com/strongloop/loopback-next/compare/@loopback/context@0.1.1...@loopback/context@0.1.2) (2018-03-01)


### Features

* **context:** add type as a generic parameter to `ctx.get()` and friends ([24b217d](https://github.com/strongloop/loopback-next/commit/24b217d))
* **context:** allow context.find by a filter function ([9b1e26c](https://github.com/strongloop/loopback-next/commit/9b1e26c))
* **context:** use Readonly to guard immutable values ([871ddef](https://github.com/strongloop/loopback-next/commit/871ddef))


### BREAKING CHANGES

* **context:** `ctx.get()` and `ctx.getSync()` require a type now.
See the example below for upgrade instructions:

```diff
- const c: MyController = await ctx.get('MyController');
+ const c = await ctx.get<MyController>('MyController');
```

`isPromise` was renamed to `isPromiseLike` and acts as a type guard
for `PromiseLike`, not `Promise`.  When upgrading affected code, you
need to determine whether the code was accepting any Promise
implementation (i.e. `PromiseLike`) or only native Promises. In the
former case, you should use `isPromiseLike` and potentially convert the
userland Promise instance to a native Promise via
`Promise.resolve(promiseLike)`. In the latter case, you can replace
`isPromise(p)` with `p instanceof Promise`.




<a name="0.1.1"></a>
## [0.1.1](https://github.com/strongloop/loopback-next/compare/@loopback/context@0.1.0...@loopback/context@0.1.1) (2018-02-23)


### Bug Fixes

* **context:** fix optional param injection for methods ([801a82d](https://github.com/strongloop/loopback-next/commit/801a82d))




<a name="0.1.0"></a>
# [0.1.0](https://github.com/strongloop/loopback-next/compare/@loopback/context@4.0.0-alpha.32...@loopback/context@0.1.0) (2018-02-21)




**Note:** Version bump only for package @loopback/context

<a name="4.0.0-alpha.32"></a>
# [4.0.0-alpha.32](https://github.com/strongloop/loopback-next/compare/@loopback/context@4.0.0-alpha.31...@loopback/context@4.0.0-alpha.32) (2018-02-15)


### Features

* **context:** formalize injection metadata as an interface ([7ffc1e5](https://github.com/strongloop/loopback-next/commit/7ffc1e5))




<a name="4.0.0-alpha.31"></a>
# [4.0.0-alpha.31](https://github.com/strongloop/loopback-next/compare/@loopback/context@4.0.0-alpha.30...@loopback/context@4.0.0-alpha.31) (2018-02-07)


### Bug Fixes

* **build:** fix tslint config and slipped violations ([22f8e05](https://github.com/strongloop/loopback-next/commit/22f8e05))
* **context:** address review comments ([3925296](https://github.com/strongloop/loopback-next/commit/3925296))
* **context:** pass metadata to `[@inject](https://github.com/inject).tag` ([27e26e9](https://github.com/strongloop/loopback-next/commit/27e26e9))


### build

* drop dist6 related targets ([#945](https://github.com/strongloop/loopback-next/issues/945)) ([a2368ce](https://github.com/strongloop/loopback-next/commit/a2368ce))


### Features

* **context:** add [@inject](https://github.com/inject).context for context injection ([6e0deaf](https://github.com/strongloop/loopback-next/commit/6e0deaf))
* **context:** add decorator & optional attrs to injection metadata ([3a1c7de](https://github.com/strongloop/loopback-next/commit/3a1c7de))
* **context:** add name to context ([21e1daf](https://github.com/strongloop/loopback-next/commit/21e1daf))
* **context:** add unbind() to allow remove bindings by key ([b9c3893](https://github.com/strongloop/loopback-next/commit/b9c3893))
* **context:** enhance binding caching to be context aware ([7b7eb30](https://github.com/strongloop/loopback-next/commit/7b7eb30))
* **context:** reports the resolution path for circular deps ([bc4ce20](https://github.com/strongloop/loopback-next/commit/bc4ce20))


### BREAKING CHANGES

* Support for Node.js version lower than 8.0 has been dropped.
Please upgrade to the latest Node.js 8.x LTS version.

Co-Authored-by: Taranveer Virk <taranveer@virk.cc>




<a name="4.0.0-alpha.30"></a>
# [4.0.0-alpha.30](https://github.com/strongloop/loopback-next/compare/@loopback/context@4.0.0-alpha.29...@loopback/context@4.0.0-alpha.30) (2018-02-04)


### Bug Fixes

* remove console output from tests ([ff4a320](https://github.com/strongloop/loopback-next/commit/ff4a320))




<a name="4.0.0-alpha.29"></a>
# [4.0.0-alpha.29](https://github.com/strongloop/loopback-next/compare/@loopback/context@4.0.0-alpha.28...@loopback/context@4.0.0-alpha.29) (2018-01-30)




**Note:** Version bump only for package @loopback/context

<a name="4.0.0-alpha.28"></a>
# [4.0.0-alpha.28](https://github.com/strongloop/loopback-next/compare/@loopback/context@4.0.0-alpha.27...@loopback/context@4.0.0-alpha.28) (2018-01-29)




**Note:** Version bump only for package @loopback/context

<a name="4.0.0-alpha.27"></a>
# [4.0.0-alpha.27](https://github.com/strongloop/loopback-next/compare/@loopback/context@4.0.0-alpha.26...@loopback/context@4.0.0-alpha.27) (2018-01-26)


### Bug Fixes

* apply source-maps to test errors ([76a7f56](https://github.com/strongloop/loopback-next/commit/76a7f56)), closes [#602](https://github.com/strongloop/loopback-next/issues/602)
* make mocha self-contained with the source map support ([7c6d869](https://github.com/strongloop/loopback-next/commit/7c6d869))




<a name="4.0.0-alpha.26"></a>
# [4.0.0-alpha.26](https://github.com/strongloop/loopback-next/compare/@loopback/context@4.0.0-alpha.25...@loopback/context@4.0.0-alpha.26) (2018-01-19)


### Bug Fixes

* address review comments ([76d3ec3](https://github.com/strongloop/loopback-next/commit/76d3ec3))
* **context:** add resolution-session.ts for api docs ([25a9e91](https://github.com/strongloop/loopback-next/commit/25a9e91))
* **context:** allow session to be passed into [@inject](https://github.com/inject).getter ([0517ea1](https://github.com/strongloop/loopback-next/commit/0517ea1))
* **context:** clean up the circular dependency tests ([5c35ccd](https://github.com/strongloop/loopback-next/commit/5c35ccd))
* **context:** fix the test to avoid UnhandledPromiseRejectionWarning ([6a82c4d](https://github.com/strongloop/loopback-next/commit/6a82c4d))
* make sure TS compiler infer undefined ([4c48ece](https://github.com/strongloop/loopback-next/commit/4c48ece))
* propagate errors via promises ([204c1b7](https://github.com/strongloop/loopback-next/commit/204c1b7))
* use version range for [@types](https://github.com/types)/debug ([3adbc0b](https://github.com/strongloop/loopback-next/commit/3adbc0b))


### Features

* **context:** add [@inject](https://github.com/inject).tag to allow injection by a tag ([fc8f260](https://github.com/strongloop/loopback-next/commit/fc8f260))
* **context:** add more debug statements ([38eab3e](https://github.com/strongloop/loopback-next/commit/38eab3e))
* **context:** enable detection of circular dependencies ([72b4190](https://github.com/strongloop/loopback-next/commit/72b4190))
* **context:** forbid bind().to() a Promise instance ([#854](https://github.com/strongloop/loopback-next/issues/854)) ([85ffa8b](https://github.com/strongloop/loopback-next/commit/85ffa8b))
* **context:** track injections with ResolutionSession ([cd4848e](https://github.com/strongloop/loopback-next/commit/cd4848e))
* **context:** use one stack to track bindings and injections ([b2f7eda](https://github.com/strongloop/loopback-next/commit/b2f7eda))


### BREAKING CHANGES

* **context:** It is no longer possible to pass a promise instance
to `.to()` method of a Binding. Use `.toDynamicValue()` instead.
Consider deferring the async computation (that produced the promise
instance you are binding) into the dynamic value getter function,
i.e. start the async computation only from the getter function.

An example diff showing how to upgrade your existing code:

-    ctx.bind('bar').to(Promise.resolve('BAR'));
+    ctx.bind('bar').toDynamicValue(() => Promise.resolve('BAR'));




<a name="4.0.0-alpha.25"></a>
# [4.0.0-alpha.25](https://github.com/strongloop/loopback-next/compare/@loopback/context@4.0.0-alpha.24...@loopback/context@4.0.0-alpha.25) (2018-01-11)


### Bug Fixes

* resolve injected arguments ([#821](https://github.com/strongloop/loopback-next/issues/821)) ([ca9e4dd](https://github.com/strongloop/loopback-next/commit/ca9e4dd))


### Features

* **context:** export function to build binding key with path ([fd804a5](https://github.com/strongloop/loopback-next/commit/fd804a5))


### Reverts

* revert error message ([#823](https://github.com/strongloop/loopback-next/issues/823)) ([f83c502](https://github.com/strongloop/loopback-next/commit/f83c502))




<a name="4.0.0-alpha.24"></a>
# [4.0.0-alpha.24](https://github.com/strongloop/loopback-next/compare/@loopback/context@4.0.0-alpha.23...@loopback/context@4.0.0-alpha.24) (2017-12-21)




**Note:** Version bump only for package @loopback/context

<a name="4.0.0-alpha.23"></a>
# [4.0.0-alpha.23](https://github.com/strongloop/loopback-next/compare/@loopback/context@4.0.0-alpha.22...@loopback/context@4.0.0-alpha.23) (2017-12-15)


### Bug Fixes

* Improve test coverage for metadata inspector ([3b4b552](https://github.com/strongloop/loopback-next/commit/3b4b552))


### Features

* **context:** Add decorator factories ([f517570](https://github.com/strongloop/loopback-next/commit/f517570))
* Add metadata inspector ([c683019](https://github.com/strongloop/loopback-next/commit/c683019))
* Use decorator factories ([88ebd21](https://github.com/strongloop/loopback-next/commit/88ebd21))




<a name="4.0.0-alpha.22"></a>
# [4.0.0-alpha.22](https://github.com/strongloop/loopback-next/compare/@loopback/context@4.0.0-alpha.21...@loopback/context@4.0.0-alpha.22) (2017-12-11)


### Bug Fixes

* Fix node module names in source code headers ([0316f28](https://github.com/strongloop/loopback-next/commit/0316f28))




<a name="4.0.0-alpha.21"></a>
# [4.0.0-alpha.21](https://github.com/strongloop/loopback-next/compare/@loopback/context@4.0.0-alpha.20...@loopback/context@4.0.0-alpha.21) (2017-11-29)


### Features

* **context:** Allow patterns to be RegExp ([991cf38](https://github.com/strongloop/loopback-next/commit/991cf38))




<a name="4.0.0-alpha.20"></a>
# [4.0.0-alpha.20](https://github.com/strongloop/loopback-next/compare/@loopback/context@4.0.0-alpha.19...@loopback/context@4.0.0-alpha.20) (2017-11-14)


### Features

* **context:** Add support for method dependency injection ([df1c879](https://github.com/strongloop/loopback-next/commit/df1c879))




<a name="4.0.0-alpha.19"></a>
# [4.0.0-alpha.19](https://github.com/strongloop/loopback-next/compare/@loopback/context@4.0.0-alpha.18...@loopback/context@4.0.0-alpha.19) (2017-11-09)




**Note:** Version bump only for package @loopback/context

<a name="4.0.0-alpha.18"></a>
# [4.0.0-alpha.18](https://github.com/strongloop/loopback-next/compare/@loopback/context@4.0.0-alpha.17...@loopback/context@4.0.0-alpha.18) (2017-11-06)




**Note:** Version bump only for package @loopback/context

<a name="4.0.0-alpha.17"></a>
# [4.0.0-alpha.17](https://github.com/strongloop/loopback-next/compare/@loopback/context@4.0.0-alpha.16...@loopback/context@4.0.0-alpha.17) (2017-10-31)




**Note:** Version bump only for package @loopback/context

<a name="4.0.0-alpha.16"></a>
# [4.0.0-alpha.16](https://github.com/strongloop/loopback-next/compare/@loopback/context@4.0.0-alpha.15...@loopback/context@4.0.0-alpha.16) (2017-10-31)




**Note:** Version bump only for package @loopback/context

<a name="4.0.0-alpha.15"></a>
# [4.0.0-alpha.15](https://github.com/strongloop/loopback-next/compare/@loopback/context@4.0.0-alpha.12...@loopback/context@4.0.0-alpha.15) (2017-10-25)


### Bug Fixes

* **context:** inject nested properties ([#587](https://github.com/strongloop/loopback-next/issues/587)) ([d53fc57](https://github.com/strongloop/loopback-next/commit/d53fc57))


### Features

* **context:** Add isBound() and more apidocs to Context ([39932be](https://github.com/strongloop/loopback-next/commit/39932be))
* **context:** Add toJSON() for Context & Binding ([b6ce426](https://github.com/strongloop/loopback-next/commit/b6ce426))
