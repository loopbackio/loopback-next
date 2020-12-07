# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [3.1.1](https://github.com/strongloop/loopback-next/compare/@loopback/express@3.1.0...@loopback/express@3.1.1) (2020-12-07)

**Note:** Version bump only for package @loopback/express





# [3.1.0](https://github.com/strongloop/loopback-next/compare/@loopback/express@3.0.0...@loopback/express@3.1.0) (2020-11-18)


### Features

* **express:** add getMiddlewareContext utility function ([e496642](https://github.com/strongloop/loopback-next/commit/e49664294de2e5b43bb1c42e334a27ee86787453))
* **express:** set up MIDDLEWARE_CONTEXT for request object in constructor ([e086e7b](https://github.com/strongloop/loopback-next/commit/e086e7bcf64a8aa651490784502adfe787156eef))





# [3.0.0](https://github.com/strongloop/loopback-next/compare/@loopback/express@2.1.0...@loopback/express@3.0.0) (2020-11-05)


### Bug Fixes

* use [@injectable](https://github.com/injectable) over [@bind](https://github.com/bind) ([e28c1a5](https://github.com/strongloop/loopback-next/commit/e28c1a5478b0ec147d313fcc635d76e758eb2eb4))


### Code Refactoring

* **rest:** use dynamic value provider for actions ([3a32290](https://github.com/strongloop/loopback-next/commit/3a322902bd47f664efcb0c14c4de96133301672c))


### BREAKING CHANGES

* **rest:** If you use one of the built-in action providers as the base
class, this commit will break you as the signature of the base class has
changed. Otherwise the code should be backward compatible for existing
applications.

Signed-off-by: Raymond Feng <enjoyjava@gmail.com>





# [2.1.0](https://github.com/strongloop/loopback-next/compare/@loopback/express@2.0.1...@loopback/express@2.1.0) (2020-10-07)


### Bug Fixes

* **express:** make sure middleware group name from `[@bind](https://github.com/bind)` is preserved ([1a170e5](https://github.com/strongloop/loopback-next/commit/1a170e59ed8d549fe37d33a4ba9e8bdf2b74ac0d))


### Features

* **context:** introduce new binding scopes ([9916cfd](https://github.com/strongloop/loopback-next/commit/9916cfd4449a870f7a3378e2e674957aed7c1626))





## [2.0.1](https://github.com/strongloop/loopback-next/compare/@loopback/express@2.0.0...@loopback/express@2.0.1) (2020-09-17)

**Note:** Version bump only for package @loopback/express





# [2.0.0](https://github.com/strongloop/loopback-next/compare/@loopback/express@1.4.1...@loopback/express@2.0.0) (2020-09-15)


### Features

* move framework packages to `devDependencies` ([e2c61ce](https://github.com/strongloop/loopback-next/commit/e2c61ce79aa68d76f6e7138642034160b50063f0))


### BREAKING CHANGES

* components no longer install core framework packages as
their own dependencies, they use the framework packages provided by the
target application instead.

If you are getting `npm install` errors after upgrade, then make sure
your project lists all dependencies required by the extensions you are
using.

Signed-off-by: Miroslav Bajtoš <mbajtoss@gmail.com>





## [1.4.1](https://github.com/strongloop/loopback-next/compare/@loopback/express@1.4.0...@loopback/express@1.4.1) (2020-08-27)

**Note:** Version bump only for package @loopback/express





# [1.4.0](https://github.com/strongloop/loopback-next/compare/@loopback/express@1.3.0...@loopback/express@1.4.0) (2020-08-19)


### Features

* **express:** add middleware view to watch registered middleware ([205d948](https://github.com/strongloop/loopback-next/commit/205d948cb91cf48d187ce247ee5e77b1204be35e))
* **rest:** add the ability to validate sorted middleware groups ([227dbf8](https://github.com/strongloop/loopback-next/commit/227dbf8045990536ac1437ea4a7ae1f1a1e571bb))
* **rest:** optimize middleware sequence to reuse middleware binding keys ([0041a24](https://github.com/strongloop/loopback-next/commit/0041a246df89f7dbff179ed7c5e08a65ec5bcbda))





# [1.3.0](https://github.com/strongloop/loopback-next/compare/@loopback/express@1.2.6...@loopback/express@1.3.0) (2020-08-05)


### Features

* **express:** sort middleware by group dependencies and ordered groups ([5582f06](https://github.com/strongloop/loopback-next/commit/5582f069834666a6d6a9d8d2f2d66fa1a9a5f7d3))





## [1.2.6](https://github.com/strongloop/loopback-next/compare/@loopback/express@1.2.5...@loopback/express@1.2.6) (2020-07-20)

**Note:** Version bump only for package @loopback/express





## [1.2.5](https://github.com/strongloop/loopback-next/compare/@loopback/express@1.2.4...@loopback/express@1.2.5) (2020-06-30)

**Note:** Version bump only for package @loopback/express





## [1.2.4](https://github.com/strongloop/loopback-next/compare/@loopback/express@1.2.3...@loopback/express@1.2.4) (2020-06-23)


### Bug Fixes

* set node version to >=10.16 to support events.once ([e39da1c](https://github.com/strongloop/loopback-next/commit/e39da1ca47728eafaf83c10ce35b09b03b6a4edc))





## [1.2.3](https://github.com/strongloop/loopback-next/compare/@loopback/express@1.2.2...@loopback/express@1.2.3) (2020-06-11)


### Bug Fixes

* **express:** ensure options are honored for `invokeMiddleware` resolved from the provider ([b80fcf8](https://github.com/strongloop/loopback-next/commit/b80fcf873fc5213a4d031b7684ddd4bd9ec90f8f))





## [1.2.2](https://github.com/strongloop/loopback-next/compare/@loopback/express@1.2.1...@loopback/express@1.2.2) (2020-05-28)

**Note:** Version bump only for package @loopback/express





## [1.2.1](https://github.com/strongloop/loopback-next/compare/@loopback/express@1.2.0...@loopback/express@1.2.1) (2020-05-20)

**Note:** Version bump only for package @loopback/express





# [1.2.0](https://github.com/strongloop/loopback-next/compare/@loopback/express@1.1.0...@loopback/express@1.2.0) (2020-05-19)


### Bug Fixes

* **express:** fix the asMiddleware return type ([a6802d0](https://github.com/strongloop/loopback-next/commit/a6802d01a8e6f722e71f54e7cd08a0f64e07cc79))
* use unknown type for err argument for Express hander ([b13b338](https://github.com/strongloop/loopback-next/commit/b13b3386a06332b71b33a64f5bc2ab9b4544cc8a))


### Features

* upgrade to TypeScript 3.9.x ([3300e45](https://github.com/strongloop/loopback-next/commit/3300e4569ab8410bb1285f7a54d326e9d976476d))
* **express:** allow invokeMiddleware to take a `next` option ([58c693c](https://github.com/strongloop/loopback-next/commit/58c693c41ed817c7ee845edd8a639fd811bb419d))
* **express:** use 'middleware' as the default group ([13cd0c9](https://github.com/strongloop/loopback-next/commit/13cd0c9023bae3d4190fe55a43ab2582923c4141))





# 1.1.0 (2020-05-07)


### Features

* **express:** add [@loop](https://github.com/loop)Back/express to integrate with Express middleware ([f036475](https://github.com/strongloop/loopback-next/commit/f0364757bf05a79c11c89cd17e57a5ca3c15b27b))
