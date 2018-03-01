# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

<a name="0.2.0"></a>
# [0.2.0](https://github.com/strongloop/loopback-next/compare/@loopback/example-rpc-server@0.1.2...@loopback/example-rpc-server@0.2.0) (2018-03-01)




**Note:** Version bump only for package @loopback/example-rpc-server

<a name="0.1.2"></a>
## [0.1.2](https://github.com/strongloop/loopback-next/compare/@loopback/example-rpc-server@0.1.1...@loopback/example-rpc-server@0.1.2) (2018-03-01)


### Features

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
## [0.1.1](https://github.com/strongloop/loopback-next/compare/@loopback/example-rpc-server@0.1.0...@loopback/example-rpc-server@0.1.1) (2018-02-23)




**Note:** Version bump only for package @loopback/example-rpc-server

<a name="0.1.0"></a>
# [0.1.0](https://github.com/strongloop/loopback-next/compare/@loopback/example-rpc-server@4.0.0-alpha.5...@loopback/example-rpc-server@0.1.0) (2018-02-21)




**Note:** Version bump only for package @loopback/example-rpc-server

<a name="4.0.0-alpha.5"></a>
# [4.0.0-alpha.5](https://github.com/strongloop/loopback-next/compare/@loopback/example-rpc-server@4.0.0-alpha.4...@loopback/example-rpc-server@4.0.0-alpha.5) (2018-02-15)




**Note:** Version bump only for package @loopback/example-rpc-server

<a name="4.0.0-alpha.4"></a>
# [4.0.0-alpha.4](https://github.com/strongloop/loopback-next/compare/@loopback/example-rpc-server@4.0.0-alpha.3...@loopback/example-rpc-server@4.0.0-alpha.4) (2018-02-07)


### build

* drop dist6 related targets ([#945](https://github.com/strongloop/loopback-next/issues/945)) ([a2368ce](https://github.com/strongloop/loopback-next/commit/a2368ce))


### BREAKING CHANGES

* Support for Node.js version lower than 8.0 has been dropped.
Please upgrade to the latest Node.js 8.x LTS version.

Co-Authored-by: Taranveer Virk <taranveer@virk.cc>




<a name="4.0.0-alpha.3"></a>
# [4.0.0-alpha.3](https://github.com/strongloop/loopback-next/compare/@loopback/example-rpc-server@4.0.0-alpha.2...@loopback/example-rpc-server@4.0.0-alpha.3) (2018-02-04)




**Note:** Version bump only for package @loopback/example-rpc-server

<a name="4.0.0-alpha.2"></a>
# [4.0.0-alpha.2](https://github.com/strongloop/loopback-next/compare/@loopback/example-rpc-server@4.0.0-alpha.1...@loopback/example-rpc-server@4.0.0-alpha.2) (2018-01-30)




**Note:** Version bump only for package @loopback/example-rpc-server

<a name="4.0.0-alpha.1"></a>
# 4.0.0-alpha.1 (2018-01-29)


### Bug Fixes

* **example-rpc-server:** mocha opts, mark as private ([#923](https://github.com/strongloop/loopback-next/issues/923)) ([c3b195d](https://github.com/strongloop/loopback-next/commit/c3b195d))
