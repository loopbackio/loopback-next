# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.13.1](https://github.com/strongloop/loopback-next/compare/@loopback/core@2.13.0...@loopback/core@2.13.1) (2020-12-07)


### Bug Fixes

* **core:** fix compilation error reported by tsc with typescript@4.1.x ([c538c1b](https://github.com/strongloop/loopback-next/commit/c538c1b6ad6270516abff190364d8bfce6111f91))





# [2.13.0](https://github.com/strongloop/loopback-next/compare/@loopback/core@2.12.0...@loopback/core@2.13.0) (2020-11-18)


### Bug Fixes

* re-export generateUniqueId in index.ts ([e392056](https://github.com/strongloop/loopback-next/commit/e392056471cb06c603ed9313e78886fe606e34a9)), closes [#6767](https://github.com/strongloop/loopback-next/issues/6767)


### Features

* **core:** allow parameter injection for lifecycle methods ([d5351fd](https://github.com/strongloop/loopback-next/commit/d5351fdc81422a523dc2fd78017bda0ef4dbadfd))





# [2.12.0](https://github.com/strongloop/loopback-next/compare/@loopback/core@2.11.0...@loopback/core@2.12.0) (2020-11-05)


### Features

* **core:** add `init` to application life cycle events ([747bc7f](https://github.com/strongloop/loopback-next/commit/747bc7fda83f44b288aefa505c6eddbe387122d4))





# [2.11.0](https://github.com/strongloop/loopback-next/compare/@loopback/core@2.10.1...@loopback/core@2.11.0) (2020-10-07)


### Features

* **context:** introduce new binding scopes ([9916cfd](https://github.com/strongloop/loopback-next/commit/9916cfd4449a870f7a3378e2e674957aed7c1626))





## [2.10.1](https://github.com/strongloop/loopback-next/compare/@loopback/core@2.10.0...@loopback/core@2.10.1) (2020-09-17)

**Note:** Version bump only for package @loopback/core





# [2.10.0](https://github.com/strongloop/loopback-next/compare/@loopback/core@2.9.5...@loopback/core@2.10.0) (2020-09-15)


### Bug Fixes

* improve handling of missing design-time type metadata ([95b6a2b](https://github.com/strongloop/loopback-next/commit/95b6a2b7ce64e614720df43b905f77a53a54e438))


### Features

* add `app.onStart()` and `app.onStop()` helpers ([92daddd](https://github.com/strongloop/loopback-next/commit/92daddd8dfaf24c16e03ed3af66d491a8fd9503e))
* allow dynamic value provider classes and classes with [@inject](https://github.com/inject) to be booted ([7b85cdf](https://github.com/strongloop/loopback-next/commit/7b85cdf63730ef659a4ee799f05f02eea8a1e3e8))





## [2.9.5](https://github.com/strongloop/loopback-next/compare/@loopback/core@2.9.4...@loopback/core@2.9.5) (2020-08-27)

**Note:** Version bump only for package @loopback/core





## [2.9.4](https://github.com/strongloop/loopback-next/compare/@loopback/core@2.9.3...@loopback/core@2.9.4) (2020-08-19)

**Note:** Version bump only for package @loopback/core





## [2.9.3](https://github.com/strongloop/loopback-next/compare/@loopback/core@2.9.2...@loopback/core@2.9.3) (2020-08-05)

**Note:** Version bump only for package @loopback/core





## [2.9.2](https://github.com/strongloop/loopback-next/compare/@loopback/core@2.9.1...@loopback/core@2.9.2) (2020-07-20)

**Note:** Version bump only for package @loopback/core





## [2.9.1](https://github.com/strongloop/loopback-next/compare/@loopback/core@2.9.0...@loopback/core@2.9.1) (2020-06-30)

**Note:** Version bump only for package @loopback/core





# [2.9.0](https://github.com/strongloop/loopback-next/compare/@loopback/core@2.8.0...@loopback/core@2.9.0) (2020-06-23)


### Bug Fixes

* set node version to >=10.16 to support events.once ([e39da1c](https://github.com/strongloop/loopback-next/commit/e39da1ca47728eafaf83c10ce35b09b03b6a4edc))


### Features

* **core:** enable application config with configure/getConfig/[@config](https://github.com/config) ([3a74ee1](https://github.com/strongloop/loopback-next/commit/3a74ee180633754ecd369b07454a104e731129f1))





# [2.8.0](https://github.com/strongloop/loopback-next/compare/@loopback/core@2.7.1...@loopback/core@2.8.0) (2020-06-11)


### Features

* **core:** add services to component artifacts ([5545345](https://github.com/strongloop/loopback-next/commit/5545345a7a1a51333d518d5a5cb8580d74ff2492))





## [2.7.1](https://github.com/strongloop/loopback-next/compare/@loopback/core@2.7.0...@loopback/core@2.7.1) (2020-05-28)

**Note:** Version bump only for package @loopback/core





# [2.7.0](https://github.com/strongloop/loopback-next/compare/@loopback/core@2.6.0...@loopback/core@2.7.0) (2020-05-20)


### Features

* **service-proxy:** refine service mixin ([a6d0e2a](https://github.com/strongloop/loopback-next/commit/a6d0e2a457751568faffc1e733dc15f2e7232d2c))





# [2.6.0](https://github.com/strongloop/loopback-next/compare/@loopback/core@2.5.0...@loopback/core@2.6.0) (2020-05-19)


### Features

* **core:** allow extensionFilter to take a list of extension point names ([8f315eb](https://github.com/strongloop/loopback-next/commit/8f315eb46bee7365da5325a23b948df9d477bfdb))





# [2.5.0](https://github.com/strongloop/loopback-next/compare/@loopback/core@2.4.2...@loopback/core@2.5.0) (2020-05-07)


### Features

* **context:** add registerInterceptor helper function and app.interceptor ([c760966](https://github.com/strongloop/loopback-next/commit/c76096684771ffaf535b75b025892ccfb057bff0))
* **context:** force interceptor functions to return a value ([5663a76](https://github.com/strongloop/loopback-next/commit/5663a7642cbbb43fab08020d398393d0aabeed86))
* **core:** allow options for artifact registration on an application ([f3fdc3b](https://github.com/strongloop/loopback-next/commit/f3fdc3b94e34610dd1bebb600a497c77a2794019))





## [2.4.2](https://github.com/strongloop/loopback-next/compare/@loopback/core@2.4.1...@loopback/core@2.4.2) (2020-04-29)

**Note:** Version bump only for package @loopback/core





## [2.4.1](https://github.com/strongloop/loopback-next/compare/@loopback/core@2.4.0...@loopback/core@2.4.1) (2020-04-23)

**Note:** Version bump only for package @loopback/core





# [2.4.0](https://github.com/strongloop/loopback-next/compare/@loopback/core@2.3.0...@loopback/core@2.4.0) (2020-04-22)


### Features

* update package.json and .travis.yml for builds ([cb2b8e6](https://github.com/strongloop/loopback-next/commit/cb2b8e6a18616dda7783c0193091039d4e608131))
* **core:** improve typing for `app.controller` and `app.component` ([ac4b1ea](https://github.com/strongloop/loopback-next/commit/ac4b1eac8c3643087b64a5d3a98b701c92e15cf1))





# [2.3.0](https://github.com/strongloop/loopback-next/compare/@loopback/core@2.2.1...@loopback/core@2.3.0) (2020-04-11)


### Features

* **core:** improve application signal handler registration ([8086932](https://github.com/strongloop/loopback-next/commit/8086932b66a3aaad2fff6023231f983a43e1791a))





## [2.2.1](https://github.com/strongloop/loopback-next/compare/@loopback/core@2.2.0...@loopback/core@2.2.1) (2020-04-08)

**Note:** Version bump only for package @loopback/core





# [2.2.0](https://github.com/strongloop/loopback-next/compare/@loopback/core@2.1.0...@loopback/core@2.2.0) (2020-03-24)


### Features

* **core:** add more flavors of [@extensions](https://github.com/extensions) decorator ([192563a](https://github.com/strongloop/loopback-next/commit/192563a3f4cdb136b86d898760a33051436a56de))





# [2.1.0](https://github.com/strongloop/loopback-next/compare/@loopback/core@2.0.0...@loopback/core@2.1.0) (2020-03-17)


### Features

* **core:** allow an extension to be used by multiple extension points ([5cc29d6](https://github.com/strongloop/loopback-next/commit/5cc29d630b97a02ba6ac7e5962bb2af2b314a89d))





# [2.0.0](https://github.com/strongloop/loopback-next/compare/@loopback/core@1.12.4...@loopback/core@2.0.0) (2020-03-05)


### chore

* remove support for Node.js v8.x ([4281d9d](https://github.com/strongloop/loopback-next/commit/4281d9df50f0715d32879e1442a90b643ec8f542))


### Features

* add `tslib` as dependency ([a6e0b4c](https://github.com/strongloop/loopback-next/commit/a6e0b4ce7b862764167cefedee14c1115b25e0a4)), closes [#4676](https://github.com/strongloop/loopback-next/issues/4676)


### BREAKING CHANGES

* Node.js v8.x is now end of life. Please upgrade to version
10 and above. See https://nodejs.org/en/about/releases.





## [1.12.4](https://github.com/strongloop/loopback-next/compare/@loopback/core@1.12.3...@loopback/core@1.12.4) (2020-02-06)

**Note:** Version bump only for package @loopback/core





## [1.12.3](https://github.com/strongloop/loopback-next/compare/@loopback/core@1.12.2...@loopback/core@1.12.3) (2020-02-05)

**Note:** Version bump only for package @loopback/core





## [1.12.2](https://github.com/strongloop/loopback-next/compare/@loopback/core@1.12.1...@loopback/core@1.12.2) (2020-01-27)

**Note:** Version bump only for package @loopback/core





## [1.12.1](https://github.com/strongloop/loopback-next/compare/@loopback/core@1.12.0...@loopback/core@1.12.1) (2020-01-07)

**Note:** Version bump only for package @loopback/core





# [1.12.0](https://github.com/strongloop/loopback-next/compare/@loopback/core@1.11.0...@loopback/core@1.12.0) (2019-12-09)


### Features

* **core:** allow application to trap shutdown signals ([2130634](https://github.com/strongloop/loopback-next/commit/213063424c2690aa7ef3f4494d8fc2a7e593b883))
* **core:** emit stateChanged events for application state transitions ([5257a8f](https://github.com/strongloop/loopback-next/commit/5257a8f68525921028b98a340c75758725d256b9))
* **core:** enable start/stop/boot to be idempotent ([b614a78](https://github.com/strongloop/loopback-next/commit/b614a7825be1dc1875556388443f72385525fa29))
* **core:** improve application states for start/stop ([01dac15](https://github.com/strongloop/loopback-next/commit/01dac151260e6c743cc77863f6495a85d19d338c))
* **core:** simplify state management by checking in process states ([874d2b3](https://github.com/strongloop/loopback-next/commit/874d2b385dd8c1dbf3d3980118898c6b99f145aa))





# [1.11.0](https://github.com/strongloop/loopback-next/compare/@loopback/core@1.10.7...@loopback/core@1.11.0) (2019-11-25)


### Features

* **core:** add [@service](https://github.com/service) decorator to inject a service by class/interface ([1d80904](https://github.com/strongloop/loopback-next/commit/1d80904b670724b00cb6a2965b8472f44d23eed0))





## [1.10.7](https://github.com/strongloop/loopback-next/compare/@loopback/core@1.10.6...@loopback/core@1.10.7) (2019-11-12)

**Note:** Version bump only for package @loopback/core





## [1.10.6](https://github.com/strongloop/loopback-next/compare/@loopback/core@1.10.5...@loopback/core@1.10.6) (2019-10-24)

**Note:** Version bump only for package @loopback/core





## [1.10.5](https://github.com/strongloop/loopback-next/compare/@loopback/core@1.10.4...@loopback/core@1.10.5) (2019-10-07)

**Note:** Version bump only for package @loopback/core





## [1.10.4](https://github.com/strongloop/loopback-next/compare/@loopback/core@1.10.3...@loopback/core@1.10.4) (2019-09-28)

**Note:** Version bump only for package @loopback/core





## [1.10.3](https://github.com/strongloop/loopback-next/compare/@loopback/core@1.10.2...@loopback/core@1.10.3) (2019-09-27)

**Note:** Version bump only for package @loopback/core





## [1.10.2](https://github.com/strongloop/loopback-next/compare/@loopback/core@1.10.1...@loopback/core@1.10.2) (2019-09-17)

**Note:** Version bump only for package @loopback/core





## [1.10.1](https://github.com/strongloop/loopback-next/compare/@loopback/core@1.10.0...@loopback/core@1.10.1) (2019-09-06)

**Note:** Version bump only for package @loopback/core





# [1.10.0](https://github.com/strongloop/loopback-next/compare/@loopback/core@1.9.3...@loopback/core@1.10.0) (2019-09-03)


### Features

* **core:** allow application to accept a parent context ([ee50007](https://github.com/strongloop/loopback-next/commit/ee50007))





## [1.9.3](https://github.com/strongloop/loopback-next/compare/@loopback/core@1.9.2...@loopback/core@1.9.3) (2019-08-19)

**Note:** Version bump only for package @loopback/core





## [1.9.2](https://github.com/strongloop/loopback-next/compare/@loopback/core@1.9.1...@loopback/core@1.9.2) (2019-08-15)

**Note:** Version bump only for package @loopback/core





## [1.9.1](https://github.com/strongloop/loopback-next/compare/@loopback/core@1.9.0...@loopback/core@1.9.1) (2019-08-15)

**Note:** Version bump only for package @loopback/core





# [1.9.0](https://github.com/strongloop/loopback-next/compare/@loopback/core@1.8.7...@loopback/core@1.9.0) (2019-07-31)


### Features

* **boot:** improve service booter to load classes decorated with [@bind](https://github.com/bind) ([48e01f4](https://github.com/strongloop/loopback-next/commit/48e01f4))
* **core:** add app.service() to register service classes or providers ([88eff77](https://github.com/strongloop/loopback-next/commit/88eff77))





## [1.8.7](https://github.com/strongloop/loopback-next/compare/@loopback/core@1.8.6...@loopback/core@1.8.7) (2019-07-26)

**Note:** Version bump only for package @loopback/core





## [1.8.6](https://github.com/strongloop/loopback-next/compare/@loopback/core@1.8.5...@loopback/core@1.8.6) (2019-07-17)

**Note:** Version bump only for package @loopback/core





## [1.8.5](https://github.com/strongloop/loopback-next/compare/@loopback/core@1.8.4...@loopback/core@1.8.5) (2019-06-28)

**Note:** Version bump only for package @loopback/core





## [1.8.4](https://github.com/strongloop/loopback-next/compare/@loopback/core@1.8.3...@loopback/core@1.8.4) (2019-06-21)

**Note:** Version bump only for package @loopback/core





## [1.8.3](https://github.com/strongloop/loopback-next/compare/@loopback/core@1.8.2...@loopback/core@1.8.3) (2019-06-20)

**Note:** Version bump only for package @loopback/core





## [1.8.2](https://github.com/strongloop/loopback-next/compare/@loopback/core@1.8.1...@loopback/core@1.8.2) (2019-06-17)

**Note:** Version bump only for package @loopback/core





## [1.8.1](https://github.com/strongloop/loopback-next/compare/@loopback/core@1.8.0...@loopback/core@1.8.1) (2019-06-06)

**Note:** Version bump only for package @loopback/core





# [1.8.0](https://github.com/strongloop/loopback-next/compare/@loopback/core@1.7.3...@loopback/core@1.8.0) (2019-06-03)


### Features

* replace tslint with eslint ([44185a7](https://github.com/strongloop/loopback-next/commit/44185a7))





## [1.7.3](https://github.com/strongloop/loopback-next/compare/@loopback/core@1.7.2...@loopback/core@1.7.3) (2019-05-31)

**Note:** Version bump only for package @loopback/core





## [1.7.2](https://github.com/strongloop/loopback-next/compare/@loopback/core@1.7.1...@loopback/core@1.7.2) (2019-05-30)

**Note:** Version bump only for package @loopback/core





## [1.7.1](https://github.com/strongloop/loopback-next/compare/@loopback/core@1.7.0...@loopback/core@1.7.1) (2019-05-23)

**Note:** Version bump only for package @loopback/core





# [1.7.0](https://github.com/strongloop/loopback-next/compare/@loopback/core@1.6.3...@loopback/core@1.7.0) (2019-05-14)


### Features

* **context:** add binding comparator to sort bindings ([ae3d61f](https://github.com/strongloop/loopback-next/commit/ae3d61f))





## [1.6.3](https://github.com/strongloop/loopback-next/compare/@loopback/core@1.6.2...@loopback/core@1.6.3) (2019-05-10)

**Note:** Version bump only for package @loopback/core





## [1.6.2](https://github.com/strongloop/loopback-next/compare/@loopback/core@1.6.1...@loopback/core@1.6.2) (2019-05-09)

**Note:** Version bump only for package @loopback/core





## [1.6.1](https://github.com/strongloop/loopback-next/compare/@loopback/core@1.6.0...@loopback/core@1.6.1) (2019-05-06)

**Note:** Version bump only for package @loopback/core





# [1.6.0](https://github.com/strongloop/loopback-next/compare/@loopback/core@1.5.0...@loopback/core@1.6.0) (2019-04-26)


### Features

* **core:** add help functions/decorators for extension point/extension ([89f3cbc](https://github.com/strongloop/loopback-next/commit/89f3cbc))





# [1.5.0](https://github.com/strongloop/loopback-next/compare/@loopback/core@1.4.1...@loopback/core@1.5.0) (2019-04-20)


### Features

* **build:** add more TypeScript "strict" checks ([866aa2f](https://github.com/strongloop/loopback-next/commit/866aa2f))





## [1.4.1](https://github.com/strongloop/loopback-next/compare/@loopback/core@1.4.0...@loopback/core@1.4.1) (2019-04-11)

**Note:** Version bump only for package @loopback/core





# [1.4.0](https://github.com/strongloop/loopback-next/compare/@loopback/core@1.3.0...@loopback/core@1.4.0) (2019-04-09)


### Features

* **core:** introduce life cycle support ([27c8127](https://github.com/strongloop/loopback-next/commit/27c8127))





# [1.3.0](https://github.com/strongloop/loopback-next/compare/@loopback/core@1.2.1...@loopback/core@1.3.0) (2019-04-05)


### Features

* **core:** add constants for namespaces and types ([a4778f7](https://github.com/strongloop/loopback-next/commit/a4778f7))
* **core:** create bindings from classes for components ([e615657](https://github.com/strongloop/loopback-next/commit/e615657))





## [1.2.1](https://github.com/strongloop/loopback-next/compare/@loopback/core@1.2.0...@loopback/core@1.2.1) (2019-03-22)

**Note:** Version bump only for package @loopback/core





# [1.2.0](https://github.com/strongloop/loopback-next/compare/@loopback/core@1.1.8...@loopback/core@1.2.0) (2019-03-22)


### Features

* **context:** honor binding scope from [@bind](https://github.com/bind) ([3b30f01](https://github.com/strongloop/loopback-next/commit/3b30f01))





## [1.1.8](https://github.com/strongloop/loopback-next/compare/@loopback/core@1.1.7...@loopback/core@1.1.8) (2019-03-12)

**Note:** Version bump only for package @loopback/core





## [1.1.7](https://github.com/strongloop/loopback-next/compare/@loopback/core@1.1.6...@loopback/core@1.1.7) (2019-02-25)

**Note:** Version bump only for package @loopback/core





## [1.1.6](https://github.com/strongloop/loopback-next/compare/@loopback/core@1.1.5...@loopback/core@1.1.6) (2019-02-08)

**Note:** Version bump only for package @loopback/core





## [1.1.5](https://github.com/strongloop/loopback-next/compare/@loopback/core@1.1.4...@loopback/core@1.1.5) (2019-01-28)

**Note:** Version bump only for package @loopback/core





## [1.1.4](https://github.com/strongloop/loopback-next/compare/@loopback/core@1.1.3...@loopback/core@1.1.4) (2019-01-14)

**Note:** Version bump only for package @loopback/core





## [1.1.3](https://github.com/strongloop/loopback-next/compare/@loopback/core@1.1.2...@loopback/core@1.1.3) (2018-12-20)

**Note:** Version bump only for package @loopback/core





## [1.1.2](https://github.com/strongloop/loopback-next/compare/@loopback/core@1.1.1...@loopback/core@1.1.2) (2018-12-13)

**Note:** Version bump only for package @loopback/core





## [1.1.1](https://github.com/strongloop/loopback-next/compare/@loopback/core@1.1.0...@loopback/core@1.1.1) (2018-11-26)

**Note:** Version bump only for package @loopback/core





# [1.1.0](https://github.com/strongloop/loopback-next/compare/@loopback/core@1.0.1...@loopback/core@1.1.0) (2018-11-14)


### Features

* **core:** allow components to expose an array of bindings ([eae0da3](https://github.com/strongloop/loopback-next/commit/eae0da3))





<a name="1.0.1"></a>
## [1.0.1](https://github.com/strongloop/loopback-next/compare/@loopback/core@1.0.0...@loopback/core@1.0.1) (2018-11-08)

**Note:** Version bump only for package @loopback/core





<a name="0.11.17"></a>
## [0.11.17](https://github.com/strongloop/loopback-next/compare/@loopback/core@0.11.16...@loopback/core@0.11.17) (2018-10-08)

**Note:** Version bump only for package @loopback/core





<a name="0.11.16"></a>
## [0.11.16](https://github.com/strongloop/loopback-next/compare/@loopback/core@0.11.15...@loopback/core@0.11.16) (2018-10-05)

**Note:** Version bump only for package @loopback/core





<a name="0.11.15"></a>
## [0.11.15](https://github.com/strongloop/loopback-next/compare/@loopback/core@0.11.14...@loopback/core@0.11.15) (2018-10-03)

**Note:** Version bump only for package @loopback/core





<a name="0.11.14"></a>
## [0.11.14](https://github.com/strongloop/loopback-next/compare/@loopback/core@0.11.13...@loopback/core@0.11.14) (2018-09-28)

**Note:** Version bump only for package @loopback/core





<a name="0.11.13"></a>
## [0.11.13](https://github.com/strongloop/loopback-next/compare/@loopback/core@0.11.12...@loopback/core@0.11.13) (2018-09-27)

**Note:** Version bump only for package @loopback/core





<a name="0.11.12"></a>
## [0.11.12](https://github.com/strongloop/loopback-next/compare/@loopback/core@0.11.11...@loopback/core@0.11.12) (2018-09-25)

**Note:** Version bump only for package @loopback/core





<a name="0.11.11"></a>
## [0.11.11](https://github.com/strongloop/loopback-next/compare/@loopback/core@0.11.10...@loopback/core@0.11.11) (2018-09-21)

**Note:** Version bump only for package @loopback/core





<a name="0.11.10"></a>
## [0.11.10](https://github.com/strongloop/loopback-next/compare/@loopback/core@0.11.9...@loopback/core@0.11.10) (2018-09-19)

**Note:** Version bump only for package @loopback/core





<a name="0.11.9"></a>
## [0.11.9](https://github.com/strongloop/loopback-next/compare/@loopback/core@0.11.8...@loopback/core@0.11.9) (2018-09-14)

**Note:** Version bump only for package @loopback/core





<a name="0.11.8"></a>
## [0.11.8](https://github.com/strongloop/loopback-next/compare/@loopback/core@0.11.7...@loopback/core@0.11.8) (2018-09-12)

**Note:** Version bump only for package @loopback/core





<a name="0.11.7"></a>
## [0.11.7](https://github.com/strongloop/loopback-next/compare/@loopback/core@0.11.6...@loopback/core@0.11.7) (2018-09-10)

**Note:** Version bump only for package @loopback/core





<a name="0.11.6"></a>
## [0.11.6](https://github.com/strongloop/loopback-next/compare/@loopback/core@0.11.5...@loopback/core@0.11.6) (2018-09-08)

**Note:** Version bump only for package @loopback/core





<a name="0.11.5"></a>
## [0.11.5](https://github.com/strongloop/loopback-next/compare/@loopback/core@0.11.4...@loopback/core@0.11.5) (2018-08-24)

**Note:** Version bump only for package @loopback/core





<a name="0.11.4"></a>
## [0.11.4](https://github.com/strongloop/loopback-next/compare/@loopback/core@0.11.3...@loopback/core@0.11.4) (2018-08-15)




**Note:** Version bump only for package @loopback/core

<a name="0.11.3"></a>
## [0.11.3](https://github.com/strongloop/loopback-next/compare/@loopback/core@0.11.2...@loopback/core@0.11.3) (2018-08-08)




**Note:** Version bump only for package @loopback/core

<a name="0.11.2"></a>
## [0.11.2](https://github.com/strongloop/loopback-next/compare/@loopback/core@0.11.1...@loopback/core@0.11.2) (2018-07-21)




**Note:** Version bump only for package @loopback/core

<a name="0.11.1"></a>
## [0.11.1](https://github.com/strongloop/loopback-next/compare/@loopback/core@0.11.0...@loopback/core@0.11.1) (2018-07-20)




**Note:** Version bump only for package @loopback/core

<a name="0.11.0"></a>
# [0.11.0](https://github.com/strongloop/loopback-next/compare/@loopback/core@0.10.3...@loopback/core@0.11.0) (2018-07-20)




**Note:** Version bump only for package @loopback/core

<a name="0.10.3"></a>
## [0.10.3](https://github.com/strongloop/loopback-next/compare/@loopback/core@0.10.2...@loopback/core@0.10.3) (2018-07-11)




**Note:** Version bump only for package @loopback/core

<a name="0.10.2"></a>
## [0.10.2](https://github.com/strongloop/loopback-next/compare/@loopback/core@0.10.1...@loopback/core@0.10.2) (2018-07-10)




**Note:** Version bump only for package @loopback/core

<a name="0.10.1"></a>
## [0.10.1](https://github.com/strongloop/loopback-next/compare/@loopback/core@0.10.0...@loopback/core@0.10.1) (2018-06-28)




**Note:** Version bump only for package @loopback/core

<a name="0.10.0"></a>
# [0.10.0](https://github.com/strongloop/loopback-next/compare/@loopback/core@0.9.0...@loopback/core@0.10.0) (2018-06-27)


### Features

* add `listening` property in the server interface ([ff0eab7](https://github.com/strongloop/loopback-next/commit/ff0eab7)), closes [#1368](https://github.com/strongloop/loopback-next/issues/1368)




<a name="0.9.0"></a>
# [0.9.0](https://github.com/strongloop/loopback-next/compare/@loopback/core@0.8.8...@loopback/core@0.9.0) (2018-06-20)


### Features

* **example-todo:** add Geo to examples/todo ([b4a9a9e](https://github.com/strongloop/loopback-next/commit/b4a9a9e))




<a name="0.8.8"></a>
## [0.8.8](https://github.com/strongloop/loopback-next/compare/@loopback/core@0.8.7...@loopback/core@0.8.8) (2018-06-11)




**Note:** Version bump only for package @loopback/core

<a name="0.8.7"></a>
## [0.8.7](https://github.com/strongloop/loopback-next/compare/@loopback/core@0.8.5...@loopback/core@0.8.7) (2018-06-09)




**Note:** Version bump only for package @loopback/core

<a name="0.8.6"></a>
## [0.8.6](https://github.com/strongloop/loopback-next/compare/@loopback/core@0.8.5...@loopback/core@0.8.6) (2018-06-09)




**Note:** Version bump only for package @loopback/core

<a name="0.8.5"></a>
## [0.8.5](https://github.com/strongloop/loopback-next/compare/@loopback/core@0.8.4...@loopback/core@0.8.5) (2018-06-08)




**Note:** Version bump only for package @loopback/core

<a name="0.8.4"></a>
## [0.8.4](https://github.com/strongloop/loopback-next/compare/@loopback/core@0.8.3...@loopback/core@0.8.4) (2018-05-20)




**Note:** Version bump only for package @loopback/core

<a name="0.8.3"></a>
## [0.8.3](https://github.com/strongloop/loopback-next/compare/@loopback/core@0.8.2...@loopback/core@0.8.3) (2018-05-14)


### Bug Fixes

* change index.d.ts files to point to dist8 ([42ca42d](https://github.com/strongloop/loopback-next/commit/42ca42d))




<a name="0.8.2"></a>
## [0.8.2](https://github.com/strongloop/loopback-next/compare/@loopback/core@0.8.1...@loopback/core@0.8.2) (2018-05-14)




**Note:** Version bump only for package @loopback/core

<a name="0.8.1"></a>
## [0.8.1](https://github.com/strongloop/loopback-next/compare/@loopback/core@0.8.0...@loopback/core@0.8.1) (2018-05-08)




**Note:** Version bump only for package @loopback/core

<a name="0.8.0"></a>
# [0.8.0](https://github.com/strongloop/loopback-next/compare/@loopback/core@0.6.1...@loopback/core@0.8.0) (2018-05-03)


### Features

* **context:** allow tags to have an optional value ([95acd11](https://github.com/strongloop/loopback-next/commit/95acd11))
* add helper package "dist-util" ([532f153](https://github.com/strongloop/loopback-next/commit/532f153))




<a name="0.7.0"></a>
# [0.7.0](https://github.com/strongloop/loopback-next/compare/@loopback/core@0.6.1...@loopback/core@0.7.0) (2018-05-03)


### Features

* **context:** allow tags to have an optional value ([95acd11](https://github.com/strongloop/loopback-next/commit/95acd11))
* add helper package "dist-util" ([532f153](https://github.com/strongloop/loopback-next/commit/532f153))




<a name="0.6.1"></a>
## [0.6.1](https://github.com/strongloop/loopback-next/compare/@loopback/core@0.6.0...@loopback/core@0.6.1) (2018-04-25)




**Note:** Version bump only for package @loopback/core

<a name="0.6.0"></a>
# [0.6.0](https://github.com/strongloop/loopback-next/compare/@loopback/core@0.5.2...@loopback/core@0.6.0) (2018-04-16)




**Note:** Version bump only for package @loopback/core

<a name="0.5.2"></a>
## [0.5.2](https://github.com/strongloop/loopback-next/compare/@loopback/core@0.5.1...@loopback/core@0.5.2) (2018-04-12)




**Note:** Version bump only for package @loopback/core

<a name="0.5.1"></a>
## [0.5.1](https://github.com/strongloop/loopback-next/compare/@loopback/core@0.5.0...@loopback/core@0.5.1) (2018-04-11)




**Note:** Version bump only for package @loopback/core

<a name="0.5.0"></a>
# [0.5.0](https://github.com/strongloop/loopback-next/compare/@loopback/core@0.4.2...@loopback/core@0.5.0) (2018-04-11)


### Bug Fixes

* change file names to fit advocated naming convention ([0331df8](https://github.com/strongloop/loopback-next/commit/0331df8))


### Features

* **context:** typed binding keys ([685195c](https://github.com/strongloop/loopback-next/commit/685195c))
* **rest:** allow factory for controller routes ([184371b](https://github.com/strongloop/loopback-next/commit/184371b))




<a name="0.4.3"></a>
## [0.4.3](https://github.com/strongloop/loopback-next/compare/@loopback/core@0.4.2...@loopback/core@0.4.3) (2018-04-06)




**Note:** Version bump only for package @loopback/core

<a name="0.4.2"></a>
## [0.4.2](https://github.com/strongloop/loopback-next/compare/@loopback/core@0.4.1...@loopback/core@0.4.2) (2018-04-04)




**Note:** Version bump only for package @loopback/core

<a name="0.4.1"></a>
## [0.4.1](https://github.com/strongloop/loopback-next/compare/@loopback/core@0.4.0...@loopback/core@0.4.1) (2018-04-02)




**Note:** Version bump only for package @loopback/core

<a name="0.4.0"></a>
# [0.4.0](https://github.com/strongloop/loopback-next/compare/@loopback/core@0.3.1...@loopback/core@0.4.0) (2018-03-29)




**Note:** Version bump only for package @loopback/core

<a name="0.3.1"></a>
## [0.3.1](https://github.com/strongloop/loopback-next/compare/@loopback/core@0.3.0...@loopback/core@0.3.1) (2018-03-23)




**Note:** Version bump only for package @loopback/core

<a name="0.3.0"></a>
# [0.3.0](https://github.com/strongloop/loopback-next/compare/@loopback/core@0.2.4...@loopback/core@0.3.0) (2018-03-21)




**Note:** Version bump only for package @loopback/core

<a name="0.2.4"></a>
## [0.2.4](https://github.com/strongloop/loopback-next/compare/@loopback/core@0.2.3...@loopback/core@0.2.4) (2018-03-14)




**Note:** Version bump only for package @loopback/core

<a name="0.2.3"></a>
## [0.2.3](https://github.com/strongloop/loopback-next/compare/@loopback/core@0.2.2...@loopback/core@0.2.3) (2018-03-13)




**Note:** Version bump only for package @loopback/core

<a name="0.2.2"></a>
## [0.2.2](https://github.com/strongloop/loopback-next/compare/@loopback/core@0.2.1...@loopback/core@0.2.2) (2018-03-08)




**Note:** Version bump only for package @loopback/core

<a name="0.2.1"></a>
## [0.2.1](https://github.com/strongloop/loopback-next/compare/@loopback/core@0.2.0...@loopback/core@0.2.1) (2018-03-06)


### Bug Fixes

* fix typo of `additional` ([2fd7610](https://github.com/strongloop/loopback-next/commit/2fd7610))




<a name="0.2.0"></a>
# [0.2.0](https://github.com/strongloop/loopback-next/compare/@loopback/core@0.1.2...@loopback/core@0.2.0) (2018-03-01)




**Note:** Version bump only for package @loopback/core

<a name="0.1.2"></a>
## [0.1.2](https://github.com/strongloop/loopback-next/compare/@loopback/core@0.1.1...@loopback/core@0.1.2) (2018-03-01)


### Features

* **context:** allow context.find by a filter function ([9b1e26c](https://github.com/strongloop/loopback-next/commit/9b1e26c))




<a name="0.1.1"></a>
## [0.1.1](https://github.com/strongloop/loopback-next/compare/@loopback/core@0.1.0...@loopback/core@0.1.1) (2018-02-23)




**Note:** Version bump only for package @loopback/core

<a name="0.1.0"></a>
# [0.1.0](https://github.com/strongloop/loopback-next/compare/@loopback/core@4.0.0-alpha.34...@loopback/core@0.1.0) (2018-02-21)




**Note:** Version bump only for package @loopback/core

<a name="4.0.0-alpha.34"></a>
# [4.0.0-alpha.34](https://github.com/strongloop/loopback-next/compare/@loopback/core@4.0.0-alpha.33...@loopback/core@4.0.0-alpha.34) (2018-02-15)




**Note:** Version bump only for package @loopback/core

<a name="4.0.0-alpha.33"></a>
# [4.0.0-alpha.33](https://github.com/strongloop/loopback-next/compare/@loopback/core@4.0.0-alpha.32...@loopback/core@4.0.0-alpha.33) (2018-02-07)


### build

* drop dist6 related targets ([#945](https://github.com/strongloop/loopback-next/issues/945)) ([a2368ce](https://github.com/strongloop/loopback-next/commit/a2368ce))


### BREAKING CHANGES

* Support for Node.js version lower than 8.0 has been dropped.
Please upgrade to the latest Node.js 8.x LTS version.

Co-Authored-by: Taranveer Virk <taranveer@virk.cc>




<a name="4.0.0-alpha.32"></a>
# [4.0.0-alpha.32](https://github.com/strongloop/loopback-next/compare/@loopback/core@4.0.0-alpha.31...@loopback/core@4.0.0-alpha.32) (2018-02-04)




**Note:** Version bump only for package @loopback/core

<a name="4.0.0-alpha.31"></a>
# [4.0.0-alpha.31](https://github.com/strongloop/loopback-next/compare/@loopback/core@4.0.0-alpha.30...@loopback/core@4.0.0-alpha.31) (2018-01-30)




**Note:** Version bump only for package @loopback/core

<a name="4.0.0-alpha.30"></a>
# [4.0.0-alpha.30](https://github.com/strongloop/loopback-next/compare/@loopback/core@4.0.0-alpha.29...@loopback/core@4.0.0-alpha.30) (2018-01-29)




**Note:** Version bump only for package @loopback/core

<a name="4.0.0-alpha.29"></a>
# [4.0.0-alpha.29](https://github.com/strongloop/loopback-next/compare/@loopback/core@4.0.0-alpha.28...@loopback/core@4.0.0-alpha.29) (2018-01-26)


### Bug Fixes

* apply source-maps to test errors ([76a7f56](https://github.com/strongloop/loopback-next/commit/76a7f56)), closes [#602](https://github.com/strongloop/loopback-next/issues/602)
* make mocha self-contained with the source map support ([7c6d869](https://github.com/strongloop/loopback-next/commit/7c6d869))




<a name="4.0.0-alpha.28"></a>
# [4.0.0-alpha.28](https://github.com/strongloop/loopback-next/compare/@loopback/core@4.0.0-alpha.27...@loopback/core@4.0.0-alpha.28) (2018-01-19)


### Features

* **cli:** lb4 example [<example-name>] ([4286c0d](https://github.com/strongloop/loopback-next/commit/4286c0d))




<a name="4.0.0-alpha.27"></a>
# [4.0.0-alpha.27](https://github.com/strongloop/loopback-next/compare/@loopback/core@4.0.0-alpha.26...@loopback/core@4.0.0-alpha.27) (2018-01-11)


### Bug Fixes

* fix imports to use files owning the definitions ([a50405a](https://github.com/strongloop/loopback-next/commit/a50405a))




<a name="4.0.0-alpha.26"></a>
# [4.0.0-alpha.26](https://github.com/strongloop/loopback-next/compare/@loopback/core@4.0.0-alpha.25...@loopback/core@4.0.0-alpha.26) (2017-12-21)




**Note:** Version bump only for package @loopback/core

<a name="4.0.0-alpha.25"></a>
# [4.0.0-alpha.25](https://github.com/strongloop/loopback-next/compare/@loopback/core@4.0.0-alpha.24...@loopback/core@4.0.0-alpha.25) (2017-12-15)




**Note:** Version bump only for package @loopback/core

<a name="4.0.0-alpha.24"></a>
# [4.0.0-alpha.24](https://github.com/strongloop/loopback-next/compare/@loopback/core@4.0.0-alpha.23...@loopback/core@4.0.0-alpha.24) (2017-12-11)


### Bug Fixes

* Fix node module names in source code headers ([0316f28](https://github.com/strongloop/loopback-next/commit/0316f28))




<a name="4.0.0-alpha.23"></a>
# [4.0.0-alpha.23](https://github.com/strongloop/loopback-next/compare/@loopback/core@4.0.0-alpha.22...@loopback/core@4.0.0-alpha.23) (2017-11-29)


### Features

* **core:** Set tags to group bound artifacts ([aa9812f](https://github.com/strongloop/loopback-next/commit/aa9812f))




<a name="4.0.0-alpha.22"></a>
# [4.0.0-alpha.22](https://github.com/strongloop/loopback-next/compare/@loopback/core@4.0.0-alpha.21...@loopback/core@4.0.0-alpha.22) (2017-11-14)


### Bug Fixes

* **core:** Return binding(s) for app.server/servers ([c506b26](https://github.com/strongloop/loopback-next/commit/c506b26))


### Features

* **context:** Add support for method dependency injection ([df1c879](https://github.com/strongloop/loopback-next/commit/df1c879))




<a name="4.0.0-alpha.21"></a>
# [4.0.0-alpha.21](https://github.com/strongloop/loopback-next/compare/@loopback/core@4.0.0-alpha.20...@loopback/core@4.0.0-alpha.21) (2017-11-09)




**Note:** Version bump only for package @loopback/core

<a name="4.0.0-alpha.20"></a>
# [4.0.0-alpha.20](https://github.com/strongloop/loopback-next/compare/@loopback/core@4.0.0-alpha.19...@loopback/core@4.0.0-alpha.20) (2017-11-06)


### Features

* **core:** allow controllers to be bound via constructor ([#668](https://github.com/strongloop/loopback-next/issues/668)) ([a9f0fac](https://github.com/strongloop/loopback-next/commit/a9f0fac))




<a name="4.0.0-alpha.19"></a>
# [4.0.0-alpha.19](https://github.com/strongloop/loopback-next/compare/@loopback/core@4.0.0-alpha.18...@loopback/core@4.0.0-alpha.19) (2017-10-31)




**Note:** Version bump only for package @loopback/core

<a name="4.0.0-alpha.18"></a>
# [4.0.0-alpha.18](https://github.com/strongloop/loopback-next/compare/@loopback/core@4.0.0-alpha.17...@loopback/core@4.0.0-alpha.18) (2017-10-31)




**Note:** Version bump only for package @loopback/core

<a name="4.0.0-alpha.17"></a>
# [4.0.0-alpha.17](https://github.com/strongloop/loopback-next/compare/@loopback/core@4.0.0-alpha.14...@loopback/core@4.0.0-alpha.17) (2017-10-25)


### Code Refactoring

* **core:** Component servers are now key-value pairs ([866953a](https://github.com/strongloop/loopback-next/commit/866953a))


### BREAKING CHANGES

* **core:** Components must now provide key-value pairs in an
object called "servers".
