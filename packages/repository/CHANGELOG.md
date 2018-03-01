# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

<a name="0.2.0"></a>
# [0.2.0](https://github.com/strongloop/loopback-next/compare/@loopback/repository@0.1.2...@loopback/repository@0.2.0) (2018-03-01)




**Note:** Version bump only for package @loopback/repository

<a name="0.1.2"></a>
## [0.1.2](https://github.com/strongloop/loopback-next/compare/@loopback/repository@0.1.1...@loopback/repository@0.1.2) (2018-03-01)


### Features

* add repository booter ([#1030](https://github.com/strongloop/loopback-next/issues/1030)) ([43ea7a8](https://github.com/strongloop/loopback-next/commit/43ea7a8))
* **context:** add type as a generic parameter to `ctx.get()` and friends ([24b217d](https://github.com/strongloop/loopback-next/commit/24b217d))
* **repository:** add datasource method in repository mixin ([85347fa](https://github.com/strongloop/loopback-next/commit/85347fa))


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
## [0.1.1](https://github.com/strongloop/loopback-next/compare/@loopback/repository@0.1.0...@loopback/repository@0.1.1) (2018-02-23)




**Note:** Version bump only for package @loopback/repository

<a name="0.1.0"></a>
# [0.1.0](https://github.com/strongloop/loopback-next/compare/@loopback/repository@4.0.0-alpha.30...@loopback/repository@0.1.0) (2018-02-21)




**Note:** Version bump only for package @loopback/repository

<a name="4.0.0-alpha.30"></a>
# [4.0.0-alpha.30](https://github.com/strongloop/loopback-next/compare/@loopback/repository@4.0.0-alpha.29...@loopback/repository@4.0.0-alpha.30) (2018-02-15)




**Note:** Version bump only for package @loopback/repository

<a name="4.0.0-alpha.29"></a>
# [4.0.0-alpha.29](https://github.com/strongloop/loopback-next/compare/@loopback/repository@4.0.0-alpha.28...@loopback/repository@4.0.0-alpha.29) (2018-02-07)


### build

* drop dist6 related targets ([#945](https://github.com/strongloop/loopback-next/issues/945)) ([a2368ce](https://github.com/strongloop/loopback-next/commit/a2368ce))


### BREAKING CHANGES

* Support for Node.js version lower than 8.0 has been dropped.
Please upgrade to the latest Node.js 8.x LTS version.

Co-Authored-by: Taranveer Virk <taranveer@virk.cc>




<a name="4.0.0-alpha.28"></a>
# [4.0.0-alpha.28](https://github.com/strongloop/loopback-next/compare/@loopback/repository@4.0.0-alpha.27...@loopback/repository@4.0.0-alpha.28) (2018-02-04)




**Note:** Version bump only for package @loopback/repository

<a name="4.0.0-alpha.27"></a>
# [4.0.0-alpha.27](https://github.com/strongloop/loopback-next/compare/@loopback/repository@4.0.0-alpha.26...@loopback/repository@4.0.0-alpha.27) (2018-01-30)


### Features

* **repository-json-schema:** add in top-level metadata for json schema ([#907](https://github.com/strongloop/loopback-next/issues/907)) ([fe59e6b](https://github.com/strongloop/loopback-next/commit/fe59e6b))




<a name="4.0.0-alpha.26"></a>
# [4.0.0-alpha.26](https://github.com/strongloop/loopback-next/compare/@loopback/repository@4.0.0-alpha.25...@loopback/repository@4.0.0-alpha.26) (2018-01-29)




**Note:** Version bump only for package @loopback/repository

<a name="4.0.0-alpha.25"></a>
# [4.0.0-alpha.25](https://github.com/strongloop/loopback-next/compare/@loopback/repository@4.0.0-alpha.24...@loopback/repository@4.0.0-alpha.25) (2018-01-26)


### Bug Fixes

* apply source-maps to test errors ([76a7f56](https://github.com/strongloop/loopback-next/commit/76a7f56)), closes [#602](https://github.com/strongloop/loopback-next/issues/602)
* make mocha self-contained with the source map support ([7c6d869](https://github.com/strongloop/loopback-next/commit/7c6d869))




<a name="4.0.0-alpha.24"></a>
# [4.0.0-alpha.24](https://github.com/strongloop/loopback-next/compare/@loopback/repository@4.0.0-alpha.23...@loopback/repository@4.0.0-alpha.24) (2018-01-19)


### Features

* add findOne function into legacy juggler bridge ([ee0df08](https://github.com/strongloop/loopback-next/commit/ee0df08))




<a name="4.0.0-alpha.23"></a>
# [4.0.0-alpha.23](https://github.com/strongloop/loopback-next/compare/@loopback/repository@4.0.0-alpha.22...@loopback/repository@4.0.0-alpha.23) (2018-01-11)


### Bug Fixes

* fix imports to use files owning the definitions ([a50405a](https://github.com/strongloop/loopback-next/commit/a50405a))
* tidy up the build scripts ([6cc83b6](https://github.com/strongloop/loopback-next/commit/6cc83b6))




<a name="4.0.0-alpha.22"></a>
# [4.0.0-alpha.22](https://github.com/strongloop/loopback-next/compare/@loopback/repository@4.0.0-alpha.21...@loopback/repository@4.0.0-alpha.22) (2018-01-03)


### Bug Fixes

* update description for [@loopback](https://github.com/loopback)/repository ([6e2377a](https://github.com/strongloop/loopback-next/commit/6e2377a))




<a name="4.0.0-alpha.21"></a>
# [4.0.0-alpha.21](https://github.com/strongloop/loopback-next/compare/@loopback/repository@4.0.0-alpha.20...@loopback/repository@4.0.0-alpha.21) (2018-01-03)


### Features

* **repository:** helper function for getting Model metadata ([b19635d](https://github.com/strongloop/loopback-next/commit/b19635d))




<a name="4.0.0-alpha.20"></a>
# [4.0.0-alpha.20](https://github.com/strongloop/loopback-next/compare/@loopback/repository@4.0.0-alpha.19...@loopback/repository@4.0.0-alpha.20) (2017-12-21)


### Features

* **repository:** Add array decorator ([3e7b419](https://github.com/strongloop/loopback-next/commit/3e7b419))
* **repository:** Make property parameter optional ([a701ce9](https://github.com/strongloop/loopback-next/commit/a701ce9))




<a name="4.0.0-alpha.19"></a>
# [4.0.0-alpha.19](https://github.com/strongloop/loopback-next/compare/@loopback/repository@4.0.0-alpha.18...@loopback/repository@4.0.0-alpha.19) (2017-12-15)


### Features

* **repository:** Add builders and execute() ([89eaf5f](https://github.com/strongloop/loopback-next/commit/89eaf5f))
* Add metadata inspector ([c683019](https://github.com/strongloop/loopback-next/commit/c683019))
* Use decorator factories ([88ebd21](https://github.com/strongloop/loopback-next/commit/88ebd21))




<a name="4.0.0-alpha.18"></a>
# [4.0.0-alpha.18](https://github.com/strongloop/loopback-next/compare/@loopback/repository@4.0.0-alpha.17...@loopback/repository@4.0.0-alpha.18) (2017-12-11)




**Note:** Version bump only for package @loopback/repository

<a name="4.0.0-alpha.17"></a>
# [4.0.0-alpha.17](https://github.com/strongloop/loopback-next/compare/@loopback/repository@4.0.0-alpha.16...@loopback/repository@4.0.0-alpha.17) (2017-11-29)




**Note:** Version bump only for package @loopback/repository

<a name="4.0.0-alpha.16"></a>
# [4.0.0-alpha.16](https://github.com/strongloop/loopback-next/compare/@loopback/repository@4.0.0-alpha.15...@loopback/repository@4.0.0-alpha.16) (2017-11-14)




**Note:** Version bump only for package @loopback/repository

<a name="4.0.0-alpha.15"></a>
# [4.0.0-alpha.15](https://github.com/strongloop/loopback-next/compare/@loopback/repository@4.0.0-alpha.14...@loopback/repository@4.0.0-alpha.15) (2017-11-09)


### Bug Fixes

* Fix lint errors by newer version of prettier ([d6c5404](https://github.com/strongloop/loopback-next/commit/d6c5404))




<a name="4.0.0-alpha.14"></a>
# [4.0.0-alpha.14](https://github.com/strongloop/loopback-next/compare/@loopback/repository@4.0.0-alpha.13...@loopback/repository@4.0.0-alpha.14) (2017-11-06)


### Bug Fixes

* **repository:** findById will reject on no result ([04077dc](https://github.com/strongloop/loopback-next/commit/04077dc))




<a name="4.0.0-alpha.13"></a>
# [4.0.0-alpha.13](https://github.com/strongloop/loopback-next/compare/@loopback/repository@4.0.0-alpha.12...@loopback/repository@4.0.0-alpha.13) (2017-10-31)




**Note:** Version bump only for package @loopback/repository

<a name="4.0.0-alpha.12"></a>
# [4.0.0-alpha.12](https://github.com/strongloop/loopback-next/compare/@loopback/repository@4.0.0-alpha.11...@loopback/repository@4.0.0-alpha.12) (2017-10-31)




**Note:** Version bump only for package @loopback/repository

<a name="4.0.0-alpha.11"></a>
# [4.0.0-alpha.11](https://github.com/strongloop/loopback-next/compare/@loopback/repository@4.0.0-alpha.8...@loopback/repository@4.0.0-alpha.11) (2017-10-25)




**Note:** Version bump only for package @loopback/repository
