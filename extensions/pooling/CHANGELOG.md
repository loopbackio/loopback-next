# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.3.0](https://github.com/strongloop/loopback-next/compare/@loopback/pooling@0.2.2...@loopback/pooling@0.3.0) (2020-09-15)


### Features

* move framework packages to `peerDependencies` ([d8f72e4](https://github.com/strongloop/loopback-next/commit/d8f72e4e9085aa132bfac3e930f3960042816f2a))


### BREAKING CHANGES

* Extensions no longer install framework packages as
their own dependencies, they use the framework packages provided by the
target application instead.

If you are getting `npm install` errors after upgrade, then make sure
your project lists all dependencies required by the extensions you are
using.

Signed-off-by: Miroslav Bajtoš <mbajtoss@gmail.com>





## [0.2.2](https://github.com/strongloop/loopback-next/compare/@loopback/pooling@0.2.1...@loopback/pooling@0.2.2) (2020-08-27)

**Note:** Version bump only for package @loopback/pooling





## [0.2.1](https://github.com/strongloop/loopback-next/compare/@loopback/pooling@0.2.0...@loopback/pooling@0.2.1) (2020-08-19)

**Note:** Version bump only for package @loopback/pooling





# [0.2.0](https://github.com/strongloop/loopback-next/compare/@loopback/pooling@0.1.0...@loopback/pooling@0.2.0) (2020-08-05)


### Features

* **pooling:** allow optional request context to be passed to acquire ([90dd868](https://github.com/strongloop/loopback-next/commit/90dd8686475ba159901605de09b9c9926fe91a9d))





# 0.1.0 (2020-07-20)


### Features

* **pooling:** add an extension to provide pooling service ([402e1e0](https://github.com/strongloop/loopback-next/commit/402e1e0f5da74c2b72199dd29dcaae43add48478))
