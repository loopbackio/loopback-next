# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [3.1.2](https://github.com/strongloop/loopback-next/compare/@loopback/boot@3.1.1...@loopback/boot@3.1.2) (2020-12-07)

**Note:** Version bump only for package @loopback/boot





## [3.1.1](https://github.com/strongloop/loopback-next/compare/@loopback/boot@3.1.0...@loopback/boot@3.1.1) (2020-11-18)

**Note:** Version bump only for package @loopback/boot





# [3.1.0](https://github.com/strongloop/loopback-next/compare/@loopback/boot@3.0.2...@loopback/boot@3.1.0) (2020-11-05)


### Features

* **core:** add `init` to application life cycle events ([747bc7f](https://github.com/strongloop/loopback-next/commit/747bc7fda83f44b288aefa505c6eddbe387122d4))





## [3.0.2](https://github.com/strongloop/loopback-next/compare/@loopback/boot@3.0.1...@loopback/boot@3.0.2) (2020-10-07)

**Note:** Version bump only for package @loopback/boot





## [3.0.1](https://github.com/strongloop/loopback-next/compare/@loopback/boot@3.0.0...@loopback/boot@3.0.1) (2020-09-17)

**Note:** Version bump only for package @loopback/boot





# [3.0.0](https://github.com/strongloop/loopback-next/compare/@loopback/boot@2.5.1...@loopback/boot@3.0.0) (2020-09-15)


### Features

* allow dynamic value provider classes and classes with [@inject](https://github.com/inject) to be booted ([7b85cdf](https://github.com/strongloop/loopback-next/commit/7b85cdf63730ef659a4ee799f05f02eea8a1e3e8))
* move framework packages to `devDependencies` ([e2c61ce](https://github.com/strongloop/loopback-next/commit/e2c61ce79aa68d76f6e7138642034160b50063f0))
* **boot:** unify booter namespace to be `booters` ([c8bdfda](https://github.com/strongloop/loopback-next/commit/c8bdfda2abff4e57b9e95aaab0717f0581c5812b))


### BREAKING CHANGES

* components no longer install core framework packages as
their own dependencies, they use the framework packages provided by the
target application instead.

If you are getting `npm install` errors after upgrade, then make sure
your project lists all dependencies required by the extensions you are
using.

Signed-off-by: Miroslav Bajtoš <mbajtoss@gmail.com>





## [2.5.1](https://github.com/strongloop/loopback-next/compare/@loopback/boot@2.5.0...@loopback/boot@2.5.1) (2020-08-27)

**Note:** Version bump only for package @loopback/boot





# [2.5.0](https://github.com/strongloop/loopback-next/compare/@loopback/boot@2.4.1...@loopback/boot@2.5.0) (2020-08-19)


### Features

* warn if app is started without booting ([1677195](https://github.com/strongloop/loopback-next/commit/1677195321ce06a1d7467233979ca4f321870e40))





## [2.4.1](https://github.com/strongloop/loopback-next/compare/@loopback/boot@2.4.0...@loopback/boot@2.4.1) (2020-08-05)

**Note:** Version bump only for package @loopback/boot





# [2.4.0](https://github.com/strongloop/loopback-next/compare/@loopback/boot@2.3.5...@loopback/boot@2.4.0) (2020-07-20)


### Bug Fixes

* **boot:** generate unique binding keys for component application booters ([0a7c406](https://github.com/strongloop/loopback-next/commit/0a7c4068fca043b676b3abdce10b4ee4c0ef9f58))


### Features

* **typeorm:** add a component for TypeORM integration ([b4e984a](https://github.com/strongloop/loopback-next/commit/b4e984a18f46e29ff540a19d6a0a4bc045d0c393))





## [2.3.5](https://github.com/strongloop/loopback-next/compare/@loopback/boot@2.3.4...@loopback/boot@2.3.5) (2020-06-30)


### Bug Fixes

* **boot:** use unique sandbox subdirs for testing ([293d9e0](https://github.com/strongloop/loopback-next/commit/293d9e0dc537ca8a78e61bd0a84e6658dc94c7fa))





## [2.3.4](https://github.com/strongloop/loopback-next/compare/@loopback/boot@2.3.3...@loopback/boot@2.3.4) (2020-06-23)


### Bug Fixes

* set node version to >=10.16 to support events.once ([e39da1c](https://github.com/strongloop/loopback-next/commit/e39da1ca47728eafaf83c10ce35b09b03b6a4edc))


### Reverts

* Revert "fix(boot): make sure sandbox directories are removed after tests" ([c971347](https://github.com/strongloop/loopback-next/commit/c971347dd2b7dc2c8afcecb8562d8fa46a3dea32))





## [2.3.3](https://github.com/strongloop/loopback-next/compare/@loopback/boot@2.3.2...@loopback/boot@2.3.3) (2020-06-11)


### Bug Fixes

* **boot:** make sure sandbox directories are removed after tests ([00d52ee](https://github.com/strongloop/loopback-next/commit/00d52eed7fc23fb8da44084bac4f9ab75f65152e))





## [2.3.2](https://github.com/strongloop/loopback-next/compare/@loopback/boot@2.3.1...@loopback/boot@2.3.2) (2020-05-28)


### Bug Fixes

* bootmixin get binding from super.component() ([9a855ff](https://github.com/strongloop/loopback-next/commit/9a855ffb6b42c9052b1faba32530c62a06cc0b1c))





## [2.3.1](https://github.com/strongloop/loopback-next/compare/@loopback/boot@2.3.0...@loopback/boot@2.3.1) (2020-05-20)

**Note:** Version bump only for package @loopback/boot





# [2.3.0](https://github.com/strongloop/loopback-next/compare/@loopback/boot@2.2.0...@loopback/boot@2.3.0) (2020-05-19)


### Features

* **boot:** add `applicationBooter` method to `BootMixin` ([3a8a487](https://github.com/strongloop/loopback-next/commit/3a8a48700fc34d007137c591c03af813cb96db20))
* **boot:** add a booter for model classes ([2de7d5f](https://github.com/strongloop/loopback-next/commit/2de7d5f5f3a4498eda1ca615cf2c5a472163236f))
* **boot:** make sure core bindings are excluded from sub app boot ([a6108ce](https://github.com/strongloop/loopback-next/commit/a6108ced24e2760b21e3d6d29f0becf14ea42baf))
* **repository:** add `model()` to RepositoryMixin ([8314612](https://github.com/strongloop/loopback-next/commit/8314612f816f0eb41d5a30f71dffa8738b84b2d6)), closes [/github.com/strongloop/loopback-next/pull/5378#discussion_r424980840](https://github.com//github.com/strongloop/loopback-next/pull/5378/issues/discussion_r424980840)





# [2.2.0](https://github.com/strongloop/loopback-next/compare/@loopback/boot@2.1.2...@loopback/boot@2.2.0) (2020-05-07)


### Features

* **boot:** add helpers to create a booter for component applications ([9276237](https://github.com/strongloop/loopback-next/commit/92762378d63c104c2c43f4960ae96fc649c8d3fe))
* **context:** add registerInterceptor helper function and app.interceptor ([c760966](https://github.com/strongloop/loopback-next/commit/c76096684771ffaf535b75b025892ccfb057bff0))





## [2.1.2](https://github.com/strongloop/loopback-next/compare/@loopback/boot@2.1.1...@loopback/boot@2.1.2) (2020-04-29)

**Note:** Version bump only for package @loopback/boot





## [2.1.1](https://github.com/strongloop/loopback-next/compare/@loopback/boot@2.1.0...@loopback/boot@2.1.1) (2020-04-23)

**Note:** Version bump only for package @loopback/boot





# [2.1.0](https://github.com/strongloop/loopback-next/compare/@loopback/boot@2.0.4...@loopback/boot@2.1.0) (2020-04-22)


### Features

* update package.json and .travis.yml for builds ([cb2b8e6](https://github.com/strongloop/loopback-next/commit/cb2b8e6a18616dda7783c0193091039d4e608131))





## [2.0.4](https://github.com/strongloop/loopback-next/compare/@loopback/boot@2.0.3...@loopback/boot@2.0.4) (2020-04-11)

**Note:** Version bump only for package @loopback/boot





## [2.0.3](https://github.com/strongloop/loopback-next/compare/@loopback/boot@2.0.2...@loopback/boot@2.0.3) (2020-04-08)


### Features

* **testlab:** introduce TestSandboxOptions to control sanbox creation ([d03ec89](https://github.com/strongloop/loopback-next/commit/d03ec8939a5d8a16fa50f931d3b9752c501173c4))


### BREAKING CHANGES

* **testlab:** The TestSandbox constructor changes its signature and behavior
now. It used to take a `path` as the top-level directory of the sandbox. The
new style is illustrated below.

```ts
// Create a sandbox as a unique temporary subdirectory under the rootPath
const sandbox = new TestSandbox(rootPath);
const sandbox = new TestSandbox({subdir: true});

// Create a sandbox in the root path directly
// This is same as the old behavior
const sandbox = new TestSandbox(rootPath, {subdir: false});
const sandbox = new TestSandbox(rootPath, {subdir: '.'});

// Create a sandbox in the `test1` subdirectory of the root path
const sandbox = new TestSandbox(rootPath, {subdir: 'test1'});
```





## [2.0.2](https://github.com/strongloop/loopback-next/compare/@loopback/boot@2.0.1...@loopback/boot@2.0.2) (2020-03-24)


### Bug Fixes

* **boot:** fix resolution of package.json for application metadata ([854ce9a](https://github.com/strongloop/loopback-next/commit/854ce9af7180de795fbf8bc908f233e640460a65))
* update package locks ([cd2f6fa](https://github.com/strongloop/loopback-next/commit/cd2f6fa7a732afe4a16f4ccf8316ff3142959fe8))





## [2.0.1](https://github.com/strongloop/loopback-next/compare/@loopback/boot@2.0.0...@loopback/boot@2.0.1) (2020-03-17)

**Note:** Version bump only for package @loopback/boot





# [2.0.0](https://github.com/strongloop/loopback-next/compare/@loopback/boot@1.7.4...@loopback/boot@2.0.0) (2020-03-05)


### Bug Fixes

* **cli:** extract messages for generators ([2f572bd](https://github.com/strongloop/loopback-next/commit/2f572bd75883420e38bfaa780bc38445aec92e65))


### chore

* remove support for Node.js v8.x ([4281d9d](https://github.com/strongloop/loopback-next/commit/4281d9df50f0715d32879e1442a90b643ec8f542))


### Features

* add `tslib` as dependency ([a6e0b4c](https://github.com/strongloop/loopback-next/commit/a6e0b4ce7b862764167cefedee14c1115b25e0a4)), closes [#4676](https://github.com/strongloop/loopback-next/issues/4676)
* **rest-crud:** add CrudRestApiBuilder ([bc5d56f](https://github.com/strongloop/loopback-next/commit/bc5d56fd4f10759756cd0ef6fbc922c02b5a9894))


### BREAKING CHANGES

* Node.js v8.x is now end of life. Please upgrade to version
10 and above. See https://nodejs.org/en/about/releases.





## [1.7.4](https://github.com/strongloop/loopback-next/compare/@loopback/boot@1.7.3...@loopback/boot@1.7.4) (2020-02-06)

**Note:** Version bump only for package @loopback/boot





## [1.7.3](https://github.com/strongloop/loopback-next/compare/@loopback/boot@1.7.2...@loopback/boot@1.7.3) (2020-02-05)

**Note:** Version bump only for package @loopback/boot





## [1.7.2](https://github.com/strongloop/loopback-next/compare/@loopback/boot@1.7.1...@loopback/boot@1.7.2) (2020-01-27)

**Note:** Version bump only for package @loopback/boot





## [1.7.1](https://github.com/strongloop/loopback-next/compare/@loopback/boot@1.7.0...@loopback/boot@1.7.1) (2020-01-07)

**Note:** Version bump only for package @loopback/boot





# [1.7.0](https://github.com/strongloop/loopback-next/compare/@loopback/boot@1.6.0...@loopback/boot@1.7.0) (2020-01-07)


### Features

* add model-api-builder and model-api-booter ([bacadcc](https://github.com/strongloop/loopback-next/commit/bacadcc22f6c813ee384d1d040f518190d9aae17))





# [1.6.0](https://github.com/strongloop/loopback-next/compare/@loopback/boot@1.5.12...@loopback/boot@1.6.0) (2019-12-09)


### Features

* **boot:** set up booting and booted states for boot() ([96c9313](https://github.com/strongloop/loopback-next/commit/96c93134db0509ce7d97ce6c5451377bed4fc6fe))
* **core:** enable start/stop/boot to be idempotent ([b614a78](https://github.com/strongloop/loopback-next/commit/b614a7825be1dc1875556388443f72385525fa29))
* **core:** improve application states for start/stop ([01dac15](https://github.com/strongloop/loopback-next/commit/01dac151260e6c743cc77863f6495a85d19d338c))





## [1.5.12](https://github.com/strongloop/loopback-next/compare/@loopback/boot@1.5.11...@loopback/boot@1.5.12) (2019-11-25)

**Note:** Version bump only for package @loopback/boot





## [1.5.11](https://github.com/strongloop/loopback-next/compare/@loopback/boot@1.5.10...@loopback/boot@1.5.11) (2019-11-12)

**Note:** Version bump only for package @loopback/boot





## [1.5.10](https://github.com/strongloop/loopback-next/compare/@loopback/boot@1.5.9...@loopback/boot@1.5.10) (2019-10-24)

**Note:** Version bump only for package @loopback/boot





## [1.5.9](https://github.com/strongloop/loopback-next/compare/@loopback/boot@1.5.8...@loopback/boot@1.5.9) (2019-10-07)

**Note:** Version bump only for package @loopback/boot





## [1.5.8](https://github.com/strongloop/loopback-next/compare/@loopback/boot@1.5.7...@loopback/boot@1.5.8) (2019-09-28)

**Note:** Version bump only for package @loopback/boot





## [1.5.7](https://github.com/strongloop/loopback-next/compare/@loopback/boot@1.5.6...@loopback/boot@1.5.7) (2019-09-27)

**Note:** Version bump only for package @loopback/boot





## [1.5.6](https://github.com/strongloop/loopback-next/compare/@loopback/boot@1.5.5...@loopback/boot@1.5.6) (2019-09-17)

**Note:** Version bump only for package @loopback/boot





## [1.5.5](https://github.com/strongloop/loopback-next/compare/@loopback/boot@1.5.4...@loopback/boot@1.5.5) (2019-09-06)

**Note:** Version bump only for package @loopback/boot





## [1.5.4](https://github.com/strongloop/loopback-next/compare/@loopback/boot@1.5.3...@loopback/boot@1.5.4) (2019-09-03)

**Note:** Version bump only for package @loopback/boot





## [1.5.3](https://github.com/strongloop/loopback-next/compare/@loopback/boot@1.5.2...@loopback/boot@1.5.3) (2019-08-19)

**Note:** Version bump only for package @loopback/boot





## [1.5.2](https://github.com/strongloop/loopback-next/compare/@loopback/boot@1.5.1...@loopback/boot@1.5.2) (2019-08-15)

**Note:** Version bump only for package @loopback/boot





## [1.5.1](https://github.com/strongloop/loopback-next/compare/@loopback/boot@1.5.0...@loopback/boot@1.5.1) (2019-08-15)

**Note:** Version bump only for package @loopback/boot





# [1.5.0](https://github.com/strongloop/loopback-next/compare/@loopback/boot@1.4.6...@loopback/boot@1.5.0) (2019-07-31)


### Features

* **boot:** improve service booter to load classes decorated with [@bind](https://github.com/bind) ([48e01f4](https://github.com/strongloop/loopback-next/commit/48e01f4))
* **boot:** introduce `[@booter](https://github.com/booter)` to decorate booter classes ([f27b517](https://github.com/strongloop/loopback-next/commit/f27b517))
* **boot:** use [@config](https://github.com/config) to inject options for booters ([016812d](https://github.com/strongloop/loopback-next/commit/016812d))





## [1.4.6](https://github.com/strongloop/loopback-next/compare/@loopback/boot@1.4.5...@loopback/boot@1.4.6) (2019-07-26)

**Note:** Version bump only for package @loopback/boot





## [1.4.5](https://github.com/strongloop/loopback-next/compare/@loopback/boot@1.4.4...@loopback/boot@1.4.5) (2019-07-17)

**Note:** Version bump only for package @loopback/boot





## [1.4.4](https://github.com/strongloop/loopback-next/compare/@loopback/boot@1.4.3...@loopback/boot@1.4.4) (2019-06-28)

**Note:** Version bump only for package @loopback/boot





## [1.4.3](https://github.com/strongloop/loopback-next/compare/@loopback/boot@1.4.2...@loopback/boot@1.4.3) (2019-06-21)

**Note:** Version bump only for package @loopback/boot





## [1.4.2](https://github.com/strongloop/loopback-next/compare/@loopback/boot@1.4.1...@loopback/boot@1.4.2) (2019-06-20)

**Note:** Version bump only for package @loopback/boot





## [1.4.1](https://github.com/strongloop/loopback-next/compare/@loopback/boot@1.4.0...@loopback/boot@1.4.1) (2019-06-17)

**Note:** Version bump only for package @loopback/boot





# [1.4.0](https://github.com/strongloop/loopback-next/compare/@loopback/boot@1.3.0...@loopback/boot@1.4.0) (2019-06-06)


### Features

* **boot:** add a booter for interceptors ([467d6ea](https://github.com/strongloop/loopback-next/commit/467d6ea))





# [1.3.0](https://github.com/strongloop/loopback-next/compare/@loopback/boot@1.2.10...@loopback/boot@1.3.0) (2019-06-03)


### Features

* replace tslint with eslint ([44185a7](https://github.com/strongloop/loopback-next/commit/44185a7))





## [1.2.10](https://github.com/strongloop/loopback-next/compare/@loopback/boot@1.2.9...@loopback/boot@1.2.10) (2019-05-31)

**Note:** Version bump only for package @loopback/boot





## [1.2.9](https://github.com/strongloop/loopback-next/compare/@loopback/boot@1.2.8...@loopback/boot@1.2.9) (2019-05-30)

**Note:** Version bump only for package @loopback/boot





## [1.2.8](https://github.com/strongloop/loopback-next/compare/@loopback/boot@1.2.7...@loopback/boot@1.2.8) (2019-05-23)

**Note:** Version bump only for package @loopback/boot





## [1.2.7](https://github.com/strongloop/loopback-next/compare/@loopback/boot@1.2.6...@loopback/boot@1.2.7) (2019-05-14)

**Note:** Version bump only for package @loopback/boot





## [1.2.6](https://github.com/strongloop/loopback-next/compare/@loopback/boot@1.2.5...@loopback/boot@1.2.6) (2019-05-10)

**Note:** Version bump only for package @loopback/boot





## [1.2.5](https://github.com/strongloop/loopback-next/compare/@loopback/boot@1.2.4...@loopback/boot@1.2.5) (2019-05-09)

**Note:** Version bump only for package @loopback/boot





## [1.2.4](https://github.com/strongloop/loopback-next/compare/@loopback/boot@1.2.3...@loopback/boot@1.2.4) (2019-05-06)

**Note:** Version bump only for package @loopback/boot





## [1.2.3](https://github.com/strongloop/loopback-next/compare/@loopback/boot@1.2.2...@loopback/boot@1.2.3) (2019-04-26)

**Note:** Version bump only for package @loopback/boot





## [1.2.2](https://github.com/strongloop/loopback-next/compare/@loopback/boot@1.2.1...@loopback/boot@1.2.2) (2019-04-20)

**Note:** Version bump only for package @loopback/boot





## [1.2.1](https://github.com/strongloop/loopback-next/compare/@loopback/boot@1.2.0...@loopback/boot@1.2.1) (2019-04-11)

**Note:** Version bump only for package @loopback/boot





# [1.2.0](https://github.com/strongloop/loopback-next/compare/@loopback/boot@1.1.3...@loopback/boot@1.2.0) (2019-04-09)


### Features

* **boot:** add a booter for life cycle scripts ([6912f76](https://github.com/strongloop/loopback-next/commit/6912f76))





## [1.1.3](https://github.com/strongloop/loopback-next/compare/@loopback/boot@1.1.2...@loopback/boot@1.1.3) (2019-04-05)

**Note:** Version bump only for package @loopback/boot





## [1.1.2](https://github.com/strongloop/loopback-next/compare/@loopback/boot@1.1.1...@loopback/boot@1.1.2) (2019-03-22)

**Note:** Version bump only for package @loopback/boot





## [1.1.1](https://github.com/strongloop/loopback-next/compare/@loopback/boot@1.1.0...@loopback/boot@1.1.1) (2019-03-22)

**Note:** Version bump only for package @loopback/boot





# [1.1.0](https://github.com/strongloop/loopback-next/compare/@loopback/boot@1.0.14...@loopback/boot@1.1.0) (2019-03-12)


### Features

* **boot:** bind booter classes as singleton by default ([649cfc2](https://github.com/strongloop/loopback-next/commit/649cfc2))
* **boot:** honor [@bind](https://github.com/bind) for booter classes ([5054155](https://github.com/strongloop/loopback-next/commit/5054155))





## [1.0.14](https://github.com/strongloop/loopback-next/compare/@loopback/boot@1.0.13...@loopback/boot@1.0.14) (2019-03-01)

**Note:** Version bump only for package @loopback/boot





## [1.0.13](https://github.com/strongloop/loopback-next/compare/@loopback/boot@1.0.12...@loopback/boot@1.0.13) (2019-02-25)

**Note:** Version bump only for package @loopback/boot





## [1.0.12](https://github.com/strongloop/loopback-next/compare/@loopback/boot@1.0.11...@loopback/boot@1.0.12) (2019-02-08)

**Note:** Version bump only for package @loopback/boot





## [1.0.11](https://github.com/strongloop/loopback-next/compare/@loopback/boot@1.0.10...@loopback/boot@1.0.11) (2019-01-28)

**Note:** Version bump only for package @loopback/boot





## [1.0.10](https://github.com/strongloop/loopback-next/compare/@loopback/boot@1.0.9...@loopback/boot@1.0.10) (2019-01-15)

**Note:** Version bump only for package @loopback/boot





## [1.0.9](https://github.com/strongloop/loopback-next/compare/@loopback/boot@1.0.8...@loopback/boot@1.0.9) (2019-01-14)


### Bug Fixes

* rework tslint comments disabling "no-unused-variable" rule ([a18a3d7](https://github.com/strongloop/loopback-next/commit/a18a3d7))





## [1.0.8](https://github.com/strongloop/loopback-next/compare/@loopback/boot@1.0.7...@loopback/boot@1.0.8) (2018-12-20)

**Note:** Version bump only for package @loopback/boot





## [1.0.7](https://github.com/strongloop/loopback-next/compare/@loopback/boot@1.0.6...@loopback/boot@1.0.7) (2018-12-13)

**Note:** Version bump only for package @loopback/boot





## [1.0.6](https://github.com/strongloop/loopback-next/compare/@loopback/boot@1.0.5...@loopback/boot@1.0.6) (2018-11-26)

**Note:** Version bump only for package @loopback/boot





## [1.0.5](https://github.com/strongloop/loopback-next/compare/@loopback/boot@1.0.4...@loopback/boot@1.0.5) (2018-11-17)

**Note:** Version bump only for package @loopback/boot





## [1.0.4](https://github.com/strongloop/loopback-next/compare/@loopback/boot@1.0.3...@loopback/boot@1.0.4) (2018-11-14)

**Note:** Version bump only for package @loopback/boot





<a name="1.0.3"></a>
## [1.0.3](https://github.com/strongloop/loopback-next/compare/@loopback/boot@1.0.1...@loopback/boot@1.0.3) (2018-11-08)

**Note:** Version bump only for package @loopback/boot





<a name="1.0.1"></a>
## [1.0.1](https://github.com/strongloop/loopback-next/compare/@loopback/boot@1.0.0...@loopback/boot@1.0.1) (2018-10-17)

**Note:** Version bump only for package @loopback/boot





<a name="0.14.7"></a>
## [0.14.7](https://github.com/strongloop/loopback-next/compare/@loopback/boot@0.14.6...@loopback/boot@0.14.7) (2018-10-08)

**Note:** Version bump only for package @loopback/boot





<a name="0.14.6"></a>
## [0.14.6](https://github.com/strongloop/loopback-next/compare/@loopback/boot@0.14.5...@loopback/boot@0.14.6) (2018-10-06)

**Note:** Version bump only for package @loopback/boot





<a name="0.14.5"></a>
## [0.14.5](https://github.com/strongloop/loopback-next/compare/@loopback/boot@0.14.4...@loopback/boot@0.14.5) (2018-10-05)

**Note:** Version bump only for package @loopback/boot





<a name="0.14.4"></a>
## [0.14.4](https://github.com/strongloop/loopback-next/compare/@loopback/boot@0.14.3...@loopback/boot@0.14.4) (2018-10-03)

**Note:** Version bump only for package @loopback/boot





<a name="0.14.3"></a>
## [0.14.3](https://github.com/strongloop/loopback-next/compare/@loopback/boot@0.14.2...@loopback/boot@0.14.3) (2018-09-28)

**Note:** Version bump only for package @loopback/boot





<a name="0.14.2"></a>
## [0.14.2](https://github.com/strongloop/loopback-next/compare/@loopback/boot@0.14.1...@loopback/boot@0.14.2) (2018-09-27)


### Bug Fixes

* **boot:** fix incorrect comment ([4ad6e4f](https://github.com/strongloop/loopback-next/commit/4ad6e4f))





<a name="0.14.1"></a>
## [0.14.1](https://github.com/strongloop/loopback-next/compare/@loopback/boot@0.14.0...@loopback/boot@0.14.1) (2018-09-25)

**Note:** Version bump only for package @loopback/boot





<a name="0.14.0"></a>
# [0.14.0](https://github.com/strongloop/loopback-next/compare/@loopback/boot@0.13.6...@loopback/boot@0.14.0) (2018-09-21)


### Features

* **testlab:** add createRestAppClient(), simplify usage in tests ([d75be77](https://github.com/strongloop/loopback-next/commit/d75be77))
* **testlab:** set port to 0 in givenHttpServerConfig ([90a0bfb](https://github.com/strongloop/loopback-next/commit/90a0bfb))





<a name="0.13.6"></a>
## [0.13.6](https://github.com/strongloop/loopback-next/compare/@loopback/boot@0.13.5...@loopback/boot@0.13.6) (2018-09-19)

**Note:** Version bump only for package @loopback/boot





<a name="0.13.5"></a>
## [0.13.5](https://github.com/strongloop/loopback-next/compare/@loopback/boot@0.13.4...@loopback/boot@0.13.5) (2018-09-14)

**Note:** Version bump only for package @loopback/boot





<a name="0.13.4"></a>
## [0.13.4](https://github.com/strongloop/loopback-next/compare/@loopback/boot@0.13.3...@loopback/boot@0.13.4) (2018-09-14)

**Note:** Version bump only for package @loopback/boot





<a name="0.13.3"></a>
## [0.13.3](https://github.com/strongloop/loopback-next/compare/@loopback/boot@0.13.2...@loopback/boot@0.13.3) (2018-09-14)

**Note:** Version bump only for package @loopback/boot





<a name="0.13.2"></a>
## [0.13.2](https://github.com/strongloop/loopback-next/compare/@loopback/boot@0.13.1...@loopback/boot@0.13.2) (2018-09-12)

**Note:** Version bump only for package @loopback/boot





<a name="0.13.1"></a>
## [0.13.1](https://github.com/strongloop/loopback-next/compare/@loopback/boot@0.13.0...@loopback/boot@0.13.1) (2018-09-10)

**Note:** Version bump only for package @loopback/boot





<a name="0.13.0"></a>
# [0.13.0](https://github.com/strongloop/loopback-next/compare/@loopback/boot@0.12.6...@loopback/boot@0.13.0) (2018-09-08)


### Bug Fixes

* remove extra imports for mixin dependencies ([35b916b](https://github.com/strongloop/loopback-next/commit/35b916b))


### Features

* **boot:** add debug logs for better troubleshooting ([cdb63b7](https://github.com/strongloop/loopback-next/commit/cdb63b7))
* **boot:** implement Service booter ([bf8e9c8](https://github.com/strongloop/loopback-next/commit/bf8e9c8))
* **service-proxy:** add service mixin ([fb01931](https://github.com/strongloop/loopback-next/commit/fb01931))





<a name="0.12.6"></a>
## [0.12.6](https://github.com/strongloop/loopback-next/compare/@loopback/boot@0.12.5...@loopback/boot@0.12.6) (2018-08-25)

**Note:** Version bump only for package @loopback/boot





<a name="0.12.5"></a>
## [0.12.5](https://github.com/strongloop/loopback-next/compare/@loopback/boot@0.12.4...@loopback/boot@0.12.5) (2018-08-24)

**Note:** Version bump only for package @loopback/boot





<a name="0.12.4"></a>
## [0.12.4](https://github.com/strongloop/loopback-next/compare/@loopback/boot@0.12.3...@loopback/boot@0.12.4) (2018-08-15)




**Note:** Version bump only for package @loopback/boot

<a name="0.12.3"></a>
## [0.12.3](https://github.com/strongloop/loopback-next/compare/@loopback/boot@0.12.2...@loopback/boot@0.12.3) (2018-08-08)




**Note:** Version bump only for package @loopback/boot

<a name="0.12.2"></a>
## [0.12.2](https://github.com/strongloop/loopback-next/compare/@loopback/boot@0.12.1...@loopback/boot@0.12.2) (2018-07-21)




**Note:** Version bump only for package @loopback/boot

<a name="0.12.1"></a>
## [0.12.1](https://github.com/strongloop/loopback-next/compare/@loopback/boot@0.12.0...@loopback/boot@0.12.1) (2018-07-20)




**Note:** Version bump only for package @loopback/boot

<a name="0.12.0"></a>
# [0.12.0](https://github.com/strongloop/loopback-next/compare/@loopback/boot@0.11.9...@loopback/boot@0.12.0) (2018-07-20)




**Note:** Version bump only for package @loopback/boot

<a name="0.11.9"></a>
## [0.11.9](https://github.com/strongloop/loopback-next/compare/@loopback/boot@0.11.8...@loopback/boot@0.11.9) (2018-07-13)




**Note:** Version bump only for package @loopback/boot

<a name="0.11.8"></a>
## [0.11.8](https://github.com/strongloop/loopback-next/compare/@loopback/boot@0.11.7...@loopback/boot@0.11.8) (2018-07-11)




**Note:** Version bump only for package @loopback/boot

<a name="0.11.7"></a>
## [0.11.7](https://github.com/strongloop/loopback-next/compare/@loopback/boot@0.11.6...@loopback/boot@0.11.7) (2018-07-10)




**Note:** Version bump only for package @loopback/boot

<a name="0.11.6"></a>
## [0.11.6](https://github.com/strongloop/loopback-next/compare/@loopback/boot@0.11.5...@loopback/boot@0.11.6) (2018-07-09)




**Note:** Version bump only for package @loopback/boot

<a name="0.11.5"></a>
## [0.11.5](https://github.com/strongloop/loopback-next/compare/@loopback/boot@0.11.4...@loopback/boot@0.11.5) (2018-06-28)




**Note:** Version bump only for package @loopback/boot

<a name="0.11.4"></a>
## [0.11.4](https://github.com/strongloop/loopback-next/compare/@loopback/boot@0.11.3...@loopback/boot@0.11.4) (2018-06-27)




**Note:** Version bump only for package @loopback/boot

<a name="0.11.3"></a>
## [0.11.3](https://github.com/strongloop/loopback-next/compare/@loopback/boot@0.11.2...@loopback/boot@0.11.3) (2018-06-26)




**Note:** Version bump only for package @loopback/boot

<a name="0.11.2"></a>
## [0.11.2](https://github.com/strongloop/loopback-next/compare/@loopback/boot@0.11.0...@loopback/boot@0.11.2) (2018-06-25)




**Note:** Version bump only for package @loopback/boot

<a name="0.11.1"></a>
## [0.11.1](https://github.com/strongloop/loopback-next/compare/@loopback/boot@0.11.0...@loopback/boot@0.11.1) (2018-06-25)




**Note:** Version bump only for package @loopback/boot

<a name="0.11.0"></a>
# [0.11.0](https://github.com/strongloop/loopback-next/compare/@loopback/boot@0.10.9...@loopback/boot@0.11.0) (2018-06-20)


### Features

* **boot:** datasource booter ([470b193](https://github.com/strongloop/loopback-next/commit/470b193))




<a name="0.10.9"></a>
## [0.10.9](https://github.com/strongloop/loopback-next/compare/@loopback/boot@0.10.8...@loopback/boot@0.10.9) (2018-06-11)




**Note:** Version bump only for package @loopback/boot

<a name="0.10.8"></a>
## [0.10.8](https://github.com/strongloop/loopback-next/compare/@loopback/boot@0.10.6...@loopback/boot@0.10.8) (2018-06-09)




**Note:** Version bump only for package @loopback/boot

<a name="0.10.7"></a>
## [0.10.7](https://github.com/strongloop/loopback-next/compare/@loopback/boot@0.10.6...@loopback/boot@0.10.7) (2018-06-09)




**Note:** Version bump only for package @loopback/boot

<a name="0.10.6"></a>
## [0.10.6](https://github.com/strongloop/loopback-next/compare/@loopback/boot@0.10.5...@loopback/boot@0.10.6) (2018-06-08)




**Note:** Version bump only for package @loopback/boot

<a name="0.10.5"></a>
## [0.10.5](https://github.com/strongloop/loopback-next/compare/@loopback/boot@0.10.4...@loopback/boot@0.10.5) (2018-05-28)




**Note:** Version bump only for package @loopback/boot

<a name="0.10.4"></a>
## [0.10.4](https://github.com/strongloop/loopback-next/compare/@loopback/boot@0.10.3...@loopback/boot@0.10.4) (2018-05-20)




**Note:** Version bump only for package @loopback/boot

<a name="0.10.3"></a>
## [0.10.3](https://github.com/strongloop/loopback-next/compare/@loopback/boot@0.10.2...@loopback/boot@0.10.3) (2018-05-14)


### Bug Fixes

* change index.d.ts files to point to dist8 ([42ca42d](https://github.com/strongloop/loopback-next/commit/42ca42d))




<a name="0.10.2"></a>
## [0.10.2](https://github.com/strongloop/loopback-next/compare/@loopback/boot@0.10.1...@loopback/boot@0.10.2) (2018-05-14)




**Note:** Version bump only for package @loopback/boot

<a name="0.10.1"></a>
## [0.10.1](https://github.com/strongloop/loopback-next/compare/@loopback/boot@0.10.0...@loopback/boot@0.10.1) (2018-05-08)




**Note:** Version bump only for package @loopback/boot

<a name="0.10.0"></a>
# [0.10.0](https://github.com/strongloop/loopback-next/compare/@loopback/boot@0.8.2...@loopback/boot@0.10.0) (2018-05-03)


### Features

* add helper package "dist-util" ([532f153](https://github.com/strongloop/loopback-next/commit/532f153))




<a name="0.9.0"></a>
# [0.9.0](https://github.com/strongloop/loopback-next/compare/@loopback/boot@0.8.2...@loopback/boot@0.9.0) (2018-05-03)


### Features

* add helper package "dist-util" ([532f153](https://github.com/strongloop/loopback-next/commit/532f153))




<a name="0.8.2"></a>
## [0.8.2](https://github.com/strongloop/loopback-next/compare/@loopback/boot@0.8.1...@loopback/boot@0.8.2) (2018-04-26)




**Note:** Version bump only for package @loopback/boot

<a name="0.8.1"></a>
## [0.8.1](https://github.com/strongloop/loopback-next/compare/@loopback/boot@0.8.0...@loopback/boot@0.8.1) (2018-04-25)




**Note:** Version bump only for package @loopback/boot

<a name="0.8.0"></a>
# [0.8.0](https://github.com/strongloop/loopback-next/compare/@loopback/boot@0.7.2...@loopback/boot@0.8.0) (2018-04-16)




**Note:** Version bump only for package @loopback/boot

<a name="0.7.2"></a>
## [0.7.2](https://github.com/strongloop/loopback-next/compare/@loopback/boot@0.7.1...@loopback/boot@0.7.2) (2018-04-16)




**Note:** Version bump only for package @loopback/boot

<a name="0.7.1"></a>
## [0.7.1](https://github.com/strongloop/loopback-next/compare/@loopback/boot@0.7.0...@loopback/boot@0.7.1) (2018-04-12)




**Note:** Version bump only for package @loopback/boot

<a name="0.7.0"></a>
# [0.7.0](https://github.com/strongloop/loopback-next/compare/@loopback/boot@0.6.0...@loopback/boot@0.7.0) (2018-04-11)


### Features

* **testlab:** update sourceMappingURL when copying a JS file ([aac2781](https://github.com/strongloop/loopback-next/commit/aac2781))




<a name="0.6.0"></a>
# [0.6.0](https://github.com/strongloop/loopback-next/compare/@loopback/boot@0.5.2...@loopback/boot@0.6.0) (2018-04-11)


### Bug Fixes

* change file names to fit advocated naming convention ([0331df8](https://github.com/strongloop/loopback-next/commit/0331df8))


### Features

* **context:** typed binding keys ([685195c](https://github.com/strongloop/loopback-next/commit/685195c))




<a name="0.5.3"></a>
## [0.5.3](https://github.com/strongloop/loopback-next/compare/@loopback/boot@0.5.2...@loopback/boot@0.5.3) (2018-04-06)




**Note:** Version bump only for package @loopback/boot

<a name="0.5.2"></a>
## [0.5.2](https://github.com/strongloop/loopback-next/compare/@loopback/boot@0.5.1...@loopback/boot@0.5.2) (2018-04-04)




**Note:** Version bump only for package @loopback/boot

<a name="0.5.1"></a>
## [0.5.1](https://github.com/strongloop/loopback-next/compare/@loopback/boot@0.5.0...@loopback/boot@0.5.1) (2018-04-02)




**Note:** Version bump only for package @loopback/boot

<a name="0.5.0"></a>
# [0.5.0](https://github.com/strongloop/loopback-next/compare/@loopback/boot@0.4.1...@loopback/boot@0.5.0) (2018-03-29)




**Note:** Version bump only for package @loopback/boot

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
