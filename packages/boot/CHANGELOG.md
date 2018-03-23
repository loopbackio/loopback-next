# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

<a name="0.4.1"></a>
## [0.4.1](https://github.com/strongloop/loopback-next/compare/@loopback/boot@0.4.0...@loopback/boot@0.4.1) (2018-03-23)




**Note:** Version bump only for package @loopback/boot

<a name="0.4.0"></a>
# [0.4.0](https://github.com/strongloop/loopback-next/compare/@loopback/boot@0.3.4...@loopback/boot@0.4.0) (2018-03-21)


### Features

* **rest:** expose app.requestHandler function ([20a41ac](https://github.com/strongloop/loopback-next/commit/20a41ac))


### BREAKING CHANGES

* **rest:** `RestServer#handleHttp` was renamed to
`RestServer#requestHandler`.




<a name="0.3.4"></a>
## [0.3.4](https://github.com/strongloop/loopback-next/compare/@loopback/boot@0.3.3...@loopback/boot@0.3.4) (2018-03-14)




**Note:** Version bump only for package @loopback/boot

<a name="0.3.3"></a>
## [0.3.3](https://github.com/strongloop/loopback-next/compare/@loopback/boot@0.3.2...@loopback/boot@0.3.3) (2018-03-13)




**Note:** Version bump only for package @loopback/boot

<a name="0.3.2"></a>
## [0.3.2](https://github.com/strongloop/loopback-next/compare/@loopback/boot@0.3.1...@loopback/boot@0.3.2) (2018-03-08)




**Note:** Version bump only for package @loopback/boot

<a name="0.3.1"></a>
## [0.3.1](https://github.com/strongloop/loopback-next/compare/@loopback/boot@0.3.0...@loopback/boot@0.3.1) (2018-03-07)




**Note:** Version bump only for package @loopback/boot

<a name="0.3.0"></a>
# [0.3.0](https://github.com/strongloop/loopback-next/compare/@loopback/boot@0.2.0...@loopback/boot@0.3.0) (2018-03-06)


### Bug Fixes

* **boot:** warn only if attempts to call app.repository without RepositoryMixin ([fdf9133](https://github.com/strongloop/loopback-next/commit/fdf9133))


### Features

* upgrade from swagger 2 to openapi 3 ([71e5af1](https://github.com/strongloop/loopback-next/commit/71e5af1))




<a name="0.2.0"></a>
# [0.2.0](https://github.com/strongloop/loopback-next/compare/@loopback/boot@0.1.2...@loopback/boot@0.2.0) (2018-03-01)




**Note:** Version bump only for package @loopback/boot

<a name="0.1.2"></a>
## [0.1.2](https://github.com/strongloop/loopback-next/compare/@loopback/boot@0.1.1...@loopback/boot@0.1.2) (2018-03-01)


### Bug Fixes

* **boot:** fix spelling typos ([7292883](https://github.com/strongloop/loopback-next/commit/7292883))


### Features

* add repository booter ([#1030](https://github.com/strongloop/loopback-next/issues/1030)) ([43ea7a8](https://github.com/strongloop/loopback-next/commit/43ea7a8))
* **context:** add type as a generic parameter to `ctx.get()` and friends ([24b217d](https://github.com/strongloop/loopback-next/commit/24b217d))


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
## [0.1.1](https://github.com/strongloop/loopback-next/compare/@loopback/boot@0.1.0...@loopback/boot@0.1.1) (2018-02-23)


### Bug Fixes

* **boot:** fix loadClassesFromFiles to be a sync function ([9f54ef9](https://github.com/strongloop/loopback-next/commit/9f54ef9))




<a name="0.1.0"></a>
# 0.1.0 (2018-02-21)


### Features

* [@loopback](https://github.com/loopback)/boot ([#858](https://github.com/strongloop/loopback-next/issues/858)) ([c2ca8be](https://github.com/strongloop/loopback-next/commit/c2ca8be))
