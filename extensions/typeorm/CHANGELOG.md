# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.2.1](https://github.com/strongloop/loopback-next/compare/@loopback/typeorm@0.2.0...@loopback/typeorm@0.2.1) (2020-09-17)

**Note:** Version bump only for package @loopback/typeorm





# [0.2.0](https://github.com/strongloop/loopback-next/compare/@loopback/typeorm@0.1.3...@loopback/typeorm@0.2.0) (2020-09-15)


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





## [0.1.3](https://github.com/strongloop/loopback-next/compare/@loopback/typeorm@0.1.2...@loopback/typeorm@0.1.3) (2020-08-27)

**Note:** Version bump only for package @loopback/typeorm





## [0.1.2](https://github.com/strongloop/loopback-next/compare/@loopback/typeorm@0.1.1...@loopback/typeorm@0.1.2) (2020-08-19)

**Note:** Version bump only for package @loopback/typeorm





## [0.1.1](https://github.com/strongloop/loopback-next/compare/@loopback/typeorm@0.1.0...@loopback/typeorm@0.1.1) (2020-08-05)

**Note:** Version bump only for package @loopback/typeorm





# 0.1.0 (2020-07-20)


### Features

* **typeorm:** add a component for TypeORM integration ([b4e984a](https://github.com/strongloop/loopback-next/commit/b4e984a18f46e29ff540a19d6a0a4bc045d0c393))
