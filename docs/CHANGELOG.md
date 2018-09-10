# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

<a name="0.18.0"></a>
# [0.18.0](https://github.com/strongloop/loopback-next/compare/@loopback/docs@0.17.1...@loopback/docs@0.18.0) (2018-09-10)


### Features

* **rest:** make servers configurable for openapi specs ([99b80a9](https://github.com/strongloop/loopback-next/commit/99b80a9))





<a name="0.17.1"></a>
## [0.17.1](https://github.com/strongloop/loopback-next/compare/@loopback/docs@0.17.0...@loopback/docs@0.17.1) (2018-09-10)

**Note:** Version bump only for package @loopback/docs





<a name="0.17.0"></a>
# [0.17.0](https://github.com/strongloop/loopback-next/compare/@loopback/docs@0.16.4...@loopback/docs@0.17.0) (2018-09-08)


### Bug Fixes

* remove extra imports for mixin dependencies ([35b916b](https://github.com/strongloop/loopback-next/commit/35b916b))
* **cli:** rename repository/service feature flags ([c089299](https://github.com/strongloop/loopback-next/commit/c089299))
* **docs:** fix todo-tutorial import service and Promise wrapper ([5898849](https://github.com/strongloop/loopback-next/commit/5898849)), closes [#1681](https://github.com/strongloop/loopback-next/issues/1681)
* **docs:** fix typo ([5c33962](https://github.com/strongloop/loopback-next/commit/5c33962))
* **docs:** fix typo in Repositories.md ([b18e95f](https://github.com/strongloop/loopback-next/commit/b18e95f))


### Features

* **rest:** allow static assets to be served by a rest server ([a1cefcc](https://github.com/strongloop/loopback-next/commit/a1cefcc))
* **service-proxy:** add service mixin ([fb01931](https://github.com/strongloop/loopback-next/commit/fb01931))
* coerce object arguments from query strings ([d095693](https://github.com/strongloop/loopback-next/commit/d095693))
* default 404 for request to non-existent resource ([f68a45c](https://github.com/strongloop/loopback-next/commit/f68a45c))





<a name="0.16.4"></a>
## [0.16.4](https://github.com/strongloop/loopback-next/compare/@loopback/docs@0.16.3...@loopback/docs@0.16.4) (2018-08-25)

**Note:** Version bump only for package @loopback/docs





<a name="0.16.3"></a>
## [0.16.3](https://github.com/strongloop/loopback-next/compare/@loopback/docs@0.16.2...@loopback/docs@0.16.3) (2018-08-24)

**Note:** Version bump only for package @loopback/docs





<a name="0.16.2"></a>
## [0.16.2](https://github.com/strongloop/loopback-next/compare/@loopback/docs@0.16.1...@loopback/docs@0.16.2) (2018-08-20)




**Note:** Version bump only for package @loopback/docs

<a name="0.16.1"></a>
## [0.16.1](https://github.com/strongloop/loopback-next/compare/@loopback/docs@0.16.0...@loopback/docs@0.16.1) (2018-08-15)




**Note:** Version bump only for package @loopback/docs

<a name="0.16.0"></a>
# [0.16.0](https://github.com/strongloop/loopback-next/compare/@loopback/docs@0.15.2...@loopback/docs@0.16.0) (2018-08-08)


### Bug Fixes

* update todo juggler page ([3711931](https://github.com/strongloop/loopback-next/commit/3711931))
* **cli:** install dependencies for clones examples ([5774f1f](https://github.com/strongloop/loopback-next/commit/5774f1f))
* **cli:** remove deleteAll endpoint from REST Controller template ([34eba34](https://github.com/strongloop/loopback-next/commit/34eba34))
* **service-proxy:** await datasource until it connects to the service ([714344b](https://github.com/strongloop/loopback-next/commit/714344b))


### Features

* **example-soap-calculator:** add soap web services integration example ([9a8d57c](https://github.com/strongloop/loopback-next/commit/9a8d57c)), closes [#1550](https://github.com/strongloop/loopback-next/issues/1550)




<a name="0.15.2"></a>
## [0.15.2](https://github.com/strongloop/loopback-next/compare/@loopback/docs@0.15.1...@loopback/docs@0.15.2) (2018-07-21)




**Note:** Version bump only for package @loopback/docs

<a name="0.15.1"></a>
## [0.15.1](https://github.com/strongloop/loopback-next/compare/@loopback/docs@0.15.0...@loopback/docs@0.15.1) (2018-07-20)




**Note:** Version bump only for package @loopback/docs

<a name="0.15.0"></a>
# [0.15.0](https://github.com/strongloop/loopback-next/compare/@loopback/docs@0.14.3...@loopback/docs@0.15.0) (2018-07-20)


### Bug Fixes

* **docs:** fix Parsing-requests.html sidebar entry ([94740f4](https://github.com/strongloop/loopback-next/commit/94740f4))
* **repository:** change parameter order in HasManyRepositoryFactory ([534895d](https://github.com/strongloop/loopback-next/commit/534895d))


### Features

* **example-todo-list:** add TodoList package/tutorial ([306d437](https://github.com/strongloop/loopback-next/commit/306d437))


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




<a name="0.14.3"></a>
## [0.14.3](https://github.com/strongloop/loopback-next/compare/@loopback/docs@0.14.2...@loopback/docs@0.14.3) (2018-07-13)


### Bug Fixes

* **cli:** reorder where and body in CLI template for updateAll and make where optional ([c875707](https://github.com/strongloop/loopback-next/commit/c875707))




<a name="0.14.2"></a>
## [0.14.2](https://github.com/strongloop/loopback-next/compare/@loopback/docs@0.14.1...@loopback/docs@0.14.2) (2018-07-11)




**Note:** Version bump only for package @loopback/docs

<a name="0.14.1"></a>
## [0.14.1](https://github.com/strongloop/loopback-next/compare/@loopback/docs@0.14.0...@loopback/docs@0.14.1) (2018-07-10)


### Bug Fixes

* **docs:** fix example-todo diagram link ([b2fe27c](https://github.com/strongloop/loopback-next/commit/b2fe27c))




<a name="0.14.0"></a>
# [0.14.0](https://github.com/strongloop/loopback-next/compare/@loopback/docs@0.13.1...@loopback/docs@0.14.0) (2018-07-09)


### Bug Fixes

* **repository:** make models strict by default ([08c2d89](https://github.com/strongloop/loopback-next/commit/08c2d89))
* typo ([24a3bb5](https://github.com/strongloop/loopback-next/commit/24a3bb5))


### Features

* **cli:** add config and yes options ([5778a2a](https://github.com/strongloop/loopback-next/commit/5778a2a))




<a name="0.13.1"></a>
## [0.13.1](https://github.com/strongloop/loopback-next/compare/@loopback/docs@0.13.0...@loopback/docs@0.13.1) (2018-06-28)




**Note:** Version bump only for package @loopback/docs

<a name="0.13.0"></a>
# [0.13.0](https://github.com/strongloop/loopback-next/compare/@loopback/docs@0.12.1...@loopback/docs@0.13.0) (2018-06-27)


### Bug Fixes

* **docs:** upgrade to strong-docs@3.1.0 and fix links ([f91af8f](https://github.com/strongloop/loopback-next/commit/f91af8f))


### Features

* add `listening` property in the server interface ([ff0eab7](https://github.com/strongloop/loopback-next/commit/ff0eab7)), closes [#1368](https://github.com/strongloop/loopback-next/issues/1368)




<a name="0.12.1"></a>
## [0.12.1](https://github.com/strongloop/loopback-next/compare/@loopback/docs@0.12.0...@loopback/docs@0.12.1) (2018-06-26)




**Note:** Version bump only for package @loopback/docs

<a name="0.12.0"></a>
# [0.12.0](https://github.com/strongloop/loopback-next/compare/@loopback/docs@0.10.0...@loopback/docs@0.12.0) (2018-06-25)


### Features

* coercion for more types ([2b4b269](https://github.com/strongloop/loopback-next/commit/2b4b269))




<a name="0.11.0"></a>
# [0.11.0](https://github.com/strongloop/loopback-next/compare/@loopback/docs@0.10.0...@loopback/docs@0.11.0) (2018-06-25)


### Features

* coercion for more types ([2b4b269](https://github.com/strongloop/loopback-next/commit/2b4b269))




<a name="0.10.0"></a>
# [0.10.0](https://github.com/strongloop/loopback-next/compare/@loopback/docs@0.9.6...@loopback/docs@0.10.0) (2018-06-20)


### Bug Fixes

* **cli:** update successful creation message ([d602ded](https://github.com/strongloop/loopback-next/commit/d602ded)), closes [#886](https://github.com/strongloop/loopback-next/issues/886)
* **docs:** fix link to [@loopback](https://github.com/loopback)/boot apidocs ([848fd5d](https://github.com/strongloop/loopback-next/commit/848fd5d))
* **docs:** update todo-tutorial-juggler.md ([5c7122f](https://github.com/strongloop/loopback-next/commit/5c7122f))


### Features

* **example-todo:** add Geo to examples/todo ([b4a9a9e](https://github.com/strongloop/loopback-next/commit/b4a9a9e))




<a name="0.9.6"></a>
## [0.9.6](https://github.com/strongloop/loopback-next/compare/@loopback/docs@0.9.5...@loopback/docs@0.9.6) (2018-06-11)




**Note:** Version bump only for package @loopback/docs

<a name="0.9.5"></a>
## [0.9.5](https://github.com/strongloop/loopback-next/compare/@loopback/docs@0.9.4...@loopback/docs@0.9.5) (2018-06-09)




**Note:** Version bump only for package @loopback/docs

<a name="0.9.4"></a>
## [0.9.4](https://github.com/strongloop/loopback-next/compare/@loopback/docs@0.9.3...@loopback/docs@0.9.4) (2018-06-09)




**Note:** Version bump only for package @loopback/docs

<a name="0.9.3"></a>
## [0.9.3](https://github.com/strongloop/loopback-next/compare/@loopback/docs@0.9.1...@loopback/docs@0.9.3) (2018-06-09)




**Note:** Version bump only for package @loopback/docs

<a name="0.9.2"></a>
## [0.9.2](https://github.com/strongloop/loopback-next/compare/@loopback/docs@0.9.1...@loopback/docs@0.9.2) (2018-06-09)




**Note:** Version bump only for package @loopback/docs

<a name="0.9.1"></a>
## [0.9.1](https://github.com/strongloop/loopback-next/compare/@loopback/docs@0.9.0...@loopback/docs@0.9.1) (2018-06-08)




**Note:** Version bump only for package @loopback/docs

<a name="0.9.0"></a>
# [0.9.0](https://github.com/strongloop/loopback-next/compare/@loopback/docs@0.8.1...@loopback/docs@0.9.0) (2018-06-08)


### Bug Fixes

* correct docs for rest controller cli prompt ([9241f5a](https://github.com/strongloop/loopback-next/commit/9241f5a))
* **cli:** make sure --applicationName is honored ([526e6ca](https://github.com/strongloop/loopback-next/commit/526e6ca))


### Features

* **cli:** add vscode config files ([3738b9c](https://github.com/strongloop/loopback-next/commit/3738b9c))
* **cli:** auto-generate / update index.ts for exports ([2998363](https://github.com/strongloop/loopback-next/commit/2998363)), closes [#1127](https://github.com/strongloop/loopback-next/issues/1127)
* **http-caching-proxy:** initial implementation ([7d8345c](https://github.com/strongloop/loopback-next/commit/7d8345c))




<a name="0.8.1"></a>
## [0.8.1](https://github.com/strongloop/loopback-next/compare/@loopback/docs@0.8.0...@loopback/docs@0.8.1) (2018-05-28)




**Note:** Version bump only for package @loopback/docs

<a name="0.8.0"></a>
# [0.8.0](https://github.com/strongloop/loopback-next/compare/@loopback/docs@0.7.6...@loopback/docs@0.8.0) (2018-05-23)


### Bug Fixes

* add tealium scripts to page ([a882c64](https://github.com/strongloop/loopback-next/commit/a882c64))


### Features

* **cli:** add CLI prompt for controller's http path name ([0f9c438](https://github.com/strongloop/loopback-next/commit/0f9c438))




<a name="0.7.6"></a>
## [0.7.6](https://github.com/strongloop/loopback-next/compare/@loopback/docs@0.7.5...@loopback/docs@0.7.6) (2018-05-20)




**Note:** Version bump only for package @loopback/docs

<a name="0.7.5"></a>
## [0.7.5](https://github.com/strongloop/loopback-next/compare/@loopback/docs@0.7.4...@loopback/docs@0.7.5) (2018-05-14)




**Note:** Version bump only for package @loopback/docs

<a name="0.7.4"></a>
## [0.7.4](https://github.com/strongloop/loopback-next/compare/@loopback/docs@0.7.3...@loopback/docs@0.7.4) (2018-05-14)


### Bug Fixes

* multiple instances of the same repository class ([c553f11](https://github.com/strongloop/loopback-next/commit/c553f11))




<a name="0.7.3"></a>
## [0.7.3](https://github.com/strongloop/loopback-next/compare/@loopback/docs@0.7.2...@loopback/docs@0.7.3) (2018-05-08)




**Note:** Version bump only for package @loopback/docs

<a name="0.7.2"></a>
## [0.7.2](https://github.com/strongloop/loopback-next/compare/@loopback/docs@0.7.1...@loopback/docs@0.7.2) (2018-05-03)




**Note:** Version bump only for package @loopback/docs

<a name="0.7.1"></a>
## [0.7.1](https://github.com/strongloop/loopback-next/compare/@loopback/docs@0.7.0...@loopback/docs@0.7.1) (2018-05-03)




**Note:** Version bump only for package @loopback/docs

<a name="0.7.0"></a>
# [0.7.0](https://github.com/strongloop/loopback-next/compare/@loopback/docs@0.5.3...@loopback/docs@0.7.0) (2018-05-03)


### Features

* add integration for service-oriented backends ([b9e2d4e](https://github.com/strongloop/loopback-next/commit/b9e2d4e))




<a name="0.6.0"></a>
# [0.6.0](https://github.com/strongloop/loopback-next/compare/@loopback/docs@0.5.3...@loopback/docs@0.6.0) (2018-05-03)


### Features

* add integration for service-oriented backends ([b9e2d4e](https://github.com/strongloop/loopback-next/commit/b9e2d4e))




<a name="0.5.3"></a>
## [0.5.3](https://github.com/strongloop/loopback-next/compare/@loopback/docs@0.5.2...@loopback/docs@0.5.3) (2018-04-26)




**Note:** Version bump only for package @loopback/docs

<a name="0.5.2"></a>
## [0.5.2](https://github.com/strongloop/loopback-next/compare/@loopback/docs@0.5.1...@loopback/docs@0.5.2) (2018-04-26)




**Note:** Version bump only for package @loopback/docs

<a name="0.5.1"></a>
## [0.5.1](https://github.com/strongloop/loopback-next/compare/@loopback/docs@0.5.0...@loopback/docs@0.5.1) (2018-04-25)




**Note:** Version bump only for package @loopback/docs

<a name="0.5.0"></a>
# [0.5.0](https://github.com/strongloop/loopback-next/compare/@loopback/docs@0.4.3...@loopback/docs@0.5.0) (2018-04-16)




**Note:** Version bump only for package @loopback/docs

<a name="0.4.3"></a>
## [0.4.3](https://github.com/strongloop/loopback-next/compare/@loopback/docs@0.4.2...@loopback/docs@0.4.3) (2018-04-16)




**Note:** Version bump only for package @loopback/docs

<a name="0.4.2"></a>
## [0.4.2](https://github.com/strongloop/loopback-next/compare/@loopback/docs@0.4.0...@loopback/docs@0.4.2) (2018-04-12)




**Note:** Version bump only for package @loopback/docs

<a name="0.4.1"></a>
## [0.4.1](https://github.com/strongloop/loopback-next/compare/@loopback/docs@0.4.0...@loopback/docs@0.4.1) (2018-04-12)




**Note:** Version bump only for package @loopback/docs

<a name="0.4.0"></a>
# [0.4.0](https://github.com/strongloop/loopback-next/compare/@loopback/docs@0.3.4...@loopback/docs@0.4.0) (2018-04-11)


### Bug Fixes

* apply small docs changes ([8ad1b86](https://github.com/strongloop/loopback-next/commit/8ad1b86))
* change file names to fit advocated naming convention ([0331df8](https://github.com/strongloop/loopback-next/commit/0331df8))


### Features

* **context:** typed binding keys ([685195c](https://github.com/strongloop/loopback-next/commit/685195c))
* **repository:** have [@repository](https://github.com/repository) take in constructor as arg ([3db07eb](https://github.com/strongloop/loopback-next/commit/3db07eb))




<a name="0.3.5"></a>
## [0.3.5](https://github.com/strongloop/loopback-next/compare/@loopback/docs@0.3.4...@loopback/docs@0.3.5) (2018-04-06)




**Note:** Version bump only for package @loopback/docs

<a name="0.3.4"></a>
## [0.3.4](https://github.com/strongloop/loopback-next/compare/@loopback/docs@0.3.3...@loopback/docs@0.3.4) (2018-04-04)




**Note:** Version bump only for package @loopback/docs

<a name="0.3.3"></a>
## [0.3.3](https://github.com/strongloop/loopback-next/compare/@loopback/docs@0.3.2...@loopback/docs@0.3.3) (2018-04-03)




**Note:** Version bump only for package @loopback/docs

<a name="0.3.2"></a>
## [0.3.2](https://github.com/strongloop/loopback-next/compare/@loopback/docs@0.3.1...@loopback/docs@0.3.2) (2018-04-02)


### Bug Fixes

* update sidebar links ([07c9196](https://github.com/strongloop/loopback-next/commit/07c9196))




<a name="0.3.1"></a>
## [0.3.1](https://github.com/strongloop/loopback-next/compare/@loopback/docs@0.3.0...@loopback/docs@0.3.1) (2018-03-29)


### Bug Fixes

* invalid yaml ([5f02620](https://github.com/strongloop/loopback-next/commit/5f02620))




<a name="0.3.0"></a>
# [0.3.0](https://github.com/strongloop/loopback-next/compare/@loopback/docs@0.2.2...@loopback/docs@0.3.0) (2018-03-29)


### Code Refactoring

* renamed example-getting-started to example-todo ([7a09f1b](https://github.com/strongloop/loopback-next/commit/7a09f1b))


### BREAKING CHANGES

* example-getting-started is now example-todo




<a name="0.2.2"></a>
## [0.2.2](https://github.com/strongloop/loopback-next/compare/@loopback/docs@0.2.1...@loopback/docs@0.2.2) (2018-03-23)




**Note:** Version bump only for package @loopback/docs

<a name="0.2.1"></a>
## [0.2.1](https://github.com/strongloop/loopback-next/compare/@loopback/docs@0.2.0...@loopback/docs@0.2.1) (2018-03-21)


### Bug Fixes

* remove obsolete steps in getting started ([2bd8b5d](https://github.com/strongloop/loopback-next/commit/2bd8b5d))




<a name="0.2.0"></a>
# [0.2.0](https://github.com/strongloop/loopback-next/compare/@loopback/docs@0.1.2...@loopback/docs@0.2.0) (2018-03-21)




**Note:** Version bump only for package @loopback/docs

<a name="0.1.2"></a>
## [0.1.2](https://github.com/strongloop/loopback-next/compare/@loopback/docs@0.1.1...@loopback/docs@0.1.2) (2018-03-14)




**Note:** Version bump only for package @loopback/docs

<a name="0.1.1"></a>
## 0.1.1 (2018-03-13)


### Features

* add openapi v3 types ([#999](https://github.com/strongloop/loopback-next/issues/999)) ([7d83523](https://github.com/strongloop/loopback-next/commit/7d83523))
* drop v2 packages ([17d3084](https://github.com/strongloop/loopback-next/commit/17d3084))
