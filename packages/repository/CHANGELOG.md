# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

<a name="0.16.2"></a>
## [0.16.2](https://github.com/strongloop/loopback-next/compare/@loopback/repository@0.16.1...@loopback/repository@0.16.2) (2018-09-12)

**Note:** Version bump only for package @loopback/repository





<a name="0.16.1"></a>
## [0.16.1](https://github.com/strongloop/loopback-next/compare/@loopback/repository@0.16.0...@loopback/repository@0.16.1) (2018-09-10)

**Note:** Version bump only for package @loopback/repository





<a name="0.16.0"></a>
# [0.16.0](https://github.com/strongloop/loopback-next/compare/@loopback/repository@0.15.1...@loopback/repository@0.16.0) (2018-09-08)


### Bug Fixes

* remove extra imports for mixin dependencies ([35b916b](https://github.com/strongloop/loopback-next/commit/35b916b))


### Features

* default 404 for request to non-existent resource ([f68a45c](https://github.com/strongloop/loopback-next/commit/f68a45c))
* **service-proxy:** add service mixin ([fb01931](https://github.com/strongloop/loopback-next/commit/fb01931))





<a name="0.15.1"></a>
## [0.15.1](https://github.com/strongloop/loopback-next/compare/@loopback/repository@0.15.0...@loopback/repository@0.15.1) (2018-08-24)

**Note:** Version bump only for package @loopback/repository





<a name="0.15.0"></a>
# [0.15.0](https://github.com/strongloop/loopback-next/compare/@loopback/repository@0.14.3...@loopback/repository@0.15.0) (2018-08-15)


### Bug Fixes

* **repository:** change the way array property definition is built for the juggler ([2471c88](https://github.com/strongloop/loopback-next/commit/2471c88))


### Features

* **repository:** add KVRepository impl using legacy juggler ([97a75dc](https://github.com/strongloop/loopback-next/commit/97a75dc))




<a name="0.14.3"></a>
## [0.14.3](https://github.com/strongloop/loopback-next/compare/@loopback/repository@0.14.2...@loopback/repository@0.14.3) (2018-08-08)




**Note:** Version bump only for package @loopback/repository

<a name="0.14.2"></a>
## [0.14.2](https://github.com/strongloop/loopback-next/compare/@loopback/repository@0.14.1...@loopback/repository@0.14.2) (2018-07-21)




**Note:** Version bump only for package @loopback/repository

<a name="0.14.1"></a>
## [0.14.1](https://github.com/strongloop/loopback-next/compare/@loopback/repository@0.14.0...@loopback/repository@0.14.1) (2018-07-20)




**Note:** Version bump only for package @loopback/repository

<a name="0.14.0"></a>
# [0.14.0](https://github.com/strongloop/loopback-next/compare/@loopback/repository@0.13.3...@loopback/repository@0.14.0) (2018-07-20)


### Bug Fixes

* **repository:** change parameter order in HasManyRepositoryFactory ([534895d](https://github.com/strongloop/loopback-next/commit/534895d))
* **repository:** default where object to an empty object ([4b14a5c](https://github.com/strongloop/loopback-next/commit/4b14a5c))


### BREAKING CHANGES

* **repository:** the generic SourceID for type HasManyRepositoryFactory
has been renamed to ForeignKeyType and switched with Target generic.
Also, the function createHasManyRepositoryFactory also renames the same
generic and makes it the last declared generic. Lastly, the generic
ForeignKeyType is added to DefaultCrudRepository#_createHasManyRepository
FactoryFor function. Assuming there is an Order and Customer model defined,
see the following examples for upgrade instructions:

For `HasManyRepository` type:

```diff
- public orders: HasManyRepository<typeof Customer.prototype.id, Order>
+ public orders: HasManyRepository<Order, typeof Customer.prototype.id>
```

For `createHasManyRepositoryFactory` function:

```diff
- const orderFactoryFn = createHasManyRepositoryFactory<typeof Customer.
prototype.id, Order, typeof Order.prototype.id>(...);
+ const orderFactoryFn = createHasManyRepositoryFactory<Order, typeof Order.
prototype.id, typeof Customer.prototype.id>(...);
```




<a name="0.13.3"></a>
## [0.13.3](https://github.com/strongloop/loopback-next/compare/@loopback/repository@0.13.2...@loopback/repository@0.13.3) (2018-07-13)


### Bug Fixes

* **repository:** change RelationType from numeric to string enums ([62090fc](https://github.com/strongloop/loopback-next/commit/62090fc))




<a name="0.13.2"></a>
## [0.13.2](https://github.com/strongloop/loopback-next/compare/@loopback/repository@0.13.1...@loopback/repository@0.13.2) (2018-07-11)




**Note:** Version bump only for package @loopback/repository

<a name="0.13.1"></a>
## [0.13.1](https://github.com/strongloop/loopback-next/compare/@loopback/repository@0.13.0...@loopback/repository@0.13.1) (2018-07-10)


### Bug Fixes

* **repository:** fix return type of DefaultCrudRepository#_createHasManyRepositoryFactoryFor ([5c11b6c](https://github.com/strongloop/loopback-next/commit/5c11b6c))




<a name="0.13.0"></a>
# [0.13.0](https://github.com/strongloop/loopback-next/compare/@loopback/repository@0.12.1...@loopback/repository@0.13.0) (2018-07-09)


### Bug Fixes

* **repository:** make models strict by default ([08c2d89](https://github.com/strongloop/loopback-next/commit/08c2d89))


### Features

* **cli:** add config and yes options ([5778a2a](https://github.com/strongloop/loopback-next/commit/5778a2a))
* **repository:** introduce hasmany relation decorator inference ([b267f3c](https://github.com/strongloop/loopback-next/commit/b267f3c))




<a name="0.12.1"></a>
## [0.12.1](https://github.com/strongloop/loopback-next/compare/@loopback/repository@0.12.0...@loopback/repository@0.12.1) (2018-06-28)




**Note:** Version bump only for package @loopback/repository

<a name="0.12.0"></a>
# [0.12.0](https://github.com/strongloop/loopback-next/compare/@loopback/repository@0.11.4...@loopback/repository@0.12.0) (2018-06-27)


### Features

* add crud relation methods ([1fdae63](https://github.com/strongloop/loopback-next/commit/1fdae63))




<a name="0.11.4"></a>
## [0.11.4](https://github.com/strongloop/loopback-next/compare/@loopback/repository@0.11.3...@loopback/repository@0.11.4) (2018-06-20)


### Bug Fixes

* **repository:** accept class and instance for app.datasource ([4b4270c](https://github.com/strongloop/loopback-next/commit/4b4270c))
* **repository:** check null for findOne CRUD method ([19f9d61](https://github.com/strongloop/loopback-next/commit/19f9d61))




<a name="0.11.3"></a>
## [0.11.3](https://github.com/strongloop/loopback-next/compare/@loopback/repository@0.11.2...@loopback/repository@0.11.3) (2018-06-11)




**Note:** Version bump only for package @loopback/repository

<a name="0.11.2"></a>
## [0.11.2](https://github.com/strongloop/loopback-next/compare/@loopback/repository@0.11.0...@loopback/repository@0.11.2) (2018-06-09)




**Note:** Version bump only for package @loopback/repository

<a name="0.11.1"></a>
## [0.11.1](https://github.com/strongloop/loopback-next/compare/@loopback/repository@0.11.0...@loopback/repository@0.11.1) (2018-06-09)




**Note:** Version bump only for package @loopback/repository

<a name="0.11.0"></a>
# [0.11.0](https://github.com/strongloop/loopback-next/compare/@loopback/repository@0.10.4...@loopback/repository@0.11.0) (2018-06-08)


### Bug Fixes

* make the code compatible with TypeScript 2.9.x ([37aba50](https://github.com/strongloop/loopback-next/commit/37aba50))


### Features

* **repository:** initial hasMany relation impl ([63f20c4](https://github.com/strongloop/loopback-next/commit/63f20c4))




<a name="0.10.4"></a>
## [0.10.4](https://github.com/strongloop/loopback-next/compare/@loopback/repository@0.10.3...@loopback/repository@0.10.4) (2018-05-20)


### Bug Fixes

* move apidocs outside of the function ([940674e](https://github.com/strongloop/loopback-next/commit/940674e))
* remove mixin builder ([d6942d7](https://github.com/strongloop/loopback-next/commit/d6942d7))




<a name="0.10.3"></a>
## [0.10.3](https://github.com/strongloop/loopback-next/compare/@loopback/repository@0.10.2...@loopback/repository@0.10.3) (2018-05-14)


### Bug Fixes

* change index.d.ts files to point to dist8 ([42ca42d](https://github.com/strongloop/loopback-next/commit/42ca42d))




<a name="0.10.2"></a>
## [0.10.2](https://github.com/strongloop/loopback-next/compare/@loopback/repository@0.10.1...@loopback/repository@0.10.2) (2018-05-14)


### Bug Fixes

* multiple instances of the same repository class ([c553f11](https://github.com/strongloop/loopback-next/commit/c553f11))




<a name="0.10.1"></a>
## [0.10.1](https://github.com/strongloop/loopback-next/compare/@loopback/repository@0.10.0...@loopback/repository@0.10.1) (2018-05-08)




**Note:** Version bump only for package @loopback/repository

<a name="0.10.0"></a>
# [0.10.0](https://github.com/strongloop/loopback-next/compare/@loopback/repository@0.8.1...@loopback/repository@0.10.0) (2018-05-03)


### Features

* add helper package "dist-util" ([532f153](https://github.com/strongloop/loopback-next/commit/532f153))




<a name="0.9.0"></a>
# [0.9.0](https://github.com/strongloop/loopback-next/compare/@loopback/repository@0.8.1...@loopback/repository@0.9.0) (2018-05-03)


### Features

* add helper package "dist-util" ([532f153](https://github.com/strongloop/loopback-next/commit/532f153))




<a name="0.8.1"></a>
## [0.8.1](https://github.com/strongloop/loopback-next/compare/@loopback/repository@0.8.0...@loopback/repository@0.8.1) (2018-04-25)




**Note:** Version bump only for package @loopback/repository

<a name="0.8.0"></a>
# [0.8.0](https://github.com/strongloop/loopback-next/compare/@loopback/repository@0.7.0...@loopback/repository@0.8.0) (2018-04-16)




**Note:** Version bump only for package @loopback/repository

<a name="0.7.0"></a>
# [0.7.0](https://github.com/strongloop/loopback-next/compare/@loopback/repository@0.6.1...@loopback/repository@0.7.0) (2018-04-12)


### Features

* **metadata:** add strongly-typed metadata accessors ([45f9f80](https://github.com/strongloop/loopback-next/commit/45f9f80))




<a name="0.6.1"></a>
## [0.6.1](https://github.com/strongloop/loopback-next/compare/@loopback/repository@0.6.0...@loopback/repository@0.6.1) (2018-04-11)




**Note:** Version bump only for package @loopback/repository

<a name="0.6.0"></a>
# [0.6.0](https://github.com/strongloop/loopback-next/compare/@loopback/repository@0.4.2...@loopback/repository@0.6.0) (2018-04-11)


### Bug Fixes

* change file names to fit advocated naming convention ([0331df8](https://github.com/strongloop/loopback-next/commit/0331df8))


### Features

* **repository:** add getRepository to mixin ([6e1be1f](https://github.com/strongloop/loopback-next/commit/6e1be1f))
* **repository:** have [@repository](https://github.com/repository) take in constructor as arg ([3db07eb](https://github.com/strongloop/loopback-next/commit/3db07eb))




<a name="0.5.0"></a>
# [0.5.0](https://github.com/strongloop/loopback-next/compare/@loopback/repository@0.4.2...@loopback/repository@0.5.0) (2018-04-06)


### Features

* **repository:** add getRepository to mixin ([6e1be1f](https://github.com/strongloop/loopback-next/commit/6e1be1f))




<a name="0.4.2"></a>
## [0.4.2](https://github.com/strongloop/loopback-next/compare/@loopback/repository@0.4.1...@loopback/repository@0.4.2) (2018-04-04)




**Note:** Version bump only for package @loopback/repository

<a name="0.4.1"></a>
## [0.4.1](https://github.com/strongloop/loopback-next/compare/@loopback/repository@0.4.0...@loopback/repository@0.4.1) (2018-04-02)




**Note:** Version bump only for package @loopback/repository

<a name="0.4.0"></a>
# [0.4.0](https://github.com/strongloop/loopback-next/compare/@loopback/repository@0.3.1...@loopback/repository@0.4.0) (2018-03-29)


### Bug Fixes

* **metadata:** refine clone of decoration spec ([544052e](https://github.com/strongloop/loopback-next/commit/544052e))
* **repository:** make sure examples are compiled ([b95f1dc](https://github.com/strongloop/loopback-next/commit/b95f1dc))


### BREAKING CHANGES

* **metadata:** instances of user-defined classes are not cloned any more.

See https://github.com/strongloop/loopback-next/issues/1182. The root
cause is that DataSource instances are cloned incorrectly.




<a name="0.3.1"></a>
## [0.3.1](https://github.com/strongloop/loopback-next/compare/@loopback/repository@0.3.0...@loopback/repository@0.3.1) (2018-03-23)


### Bug Fixes

* **repository:** fix broken code in readme ([e3e97d9](https://github.com/strongloop/loopback-next/commit/e3e97d9))




<a name="0.3.0"></a>
# [0.3.0](https://github.com/strongloop/loopback-next/compare/@loopback/repository@0.2.4...@loopback/repository@0.3.0) (2018-03-21)




**Note:** Version bump only for package @loopback/repository

<a name="0.2.4"></a>
## [0.2.4](https://github.com/strongloop/loopback-next/compare/@loopback/repository@0.2.3...@loopback/repository@0.2.4) (2018-03-14)




**Note:** Version bump only for package @loopback/repository

<a name="0.2.3"></a>
## [0.2.3](https://github.com/strongloop/loopback-next/compare/@loopback/repository@0.2.2...@loopback/repository@0.2.3) (2018-03-13)




**Note:** Version bump only for package @loopback/repository

<a name="0.2.2"></a>
## [0.2.2](https://github.com/strongloop/loopback-next/compare/@loopback/repository@0.2.1...@loopback/repository@0.2.2) (2018-03-08)




**Note:** Version bump only for package @loopback/repository

<a name="0.2.1"></a>
## [0.2.1](https://github.com/strongloop/loopback-next/compare/@loopback/repository@0.2.0...@loopback/repository@0.2.1) (2018-03-06)


### Bug Fixes

* fix package name for `repository` ([e5f7aca](https://github.com/strongloop/loopback-next/commit/e5f7aca))
* fix typo of `additional` ([2fd7610](https://github.com/strongloop/loopback-next/commit/2fd7610))




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
