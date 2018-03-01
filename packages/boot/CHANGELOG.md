# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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
