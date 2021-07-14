# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.5.1](https://github.com/loopbackio/loopback-next/compare/@loopback/pooling@0.5.0...@loopback/pooling@0.5.1) (2021-06-10)

**Note:** Version bump only for package @loopback/pooling





# [0.5.0](https://github.com/loopbackio/loopback-next/compare/@loopback/pooling@0.4.1...@loopback/pooling@0.5.0) (2021-05-03)


### Features

* support node v16 ([ac99415](https://github.com/loopbackio/loopback-next/commit/ac994154543bde22b4482ba98813351656db1b55))





## [0.4.1](https://github.com/loopbackio/loopback-next/compare/@loopback/pooling@0.4.0...@loopback/pooling@0.4.1) (2021-04-06)

**Note:** Version bump only for package @loopback/pooling





# [0.4.0](https://github.com/loopbackio/loopback-next/compare/@loopback/pooling@0.3.7...@loopback/pooling@0.4.0) (2021-03-18)


### Features

* update package-lock.json to v2 consistently ([dfc3fbd](https://github.com/loopbackio/loopback-next/commit/dfc3fbdae0c9ca9f34c64154a471bef22d5ac6b7))
* upgrade to TypeScript 4.2.x ([05930bc](https://github.com/loopbackio/loopback-next/commit/05930bc0cece3909dd66f75ad91eeaa2d365a480))





## [0.3.7](https://github.com/loopbackio/loopback-next/compare/@loopback/pooling@0.3.6...@loopback/pooling@0.3.7) (2021-02-09)

**Note:** Version bump only for package @loopback/pooling





## [0.3.6](https://github.com/loopbackio/loopback-next/compare/@loopback/pooling@0.3.5...@loopback/pooling@0.3.6) (2021-01-21)

**Note:** Version bump only for package @loopback/pooling





## [0.3.5](https://github.com/loopbackio/loopback-next/compare/@loopback/pooling@0.3.4...@loopback/pooling@0.3.5) (2020-12-07)

**Note:** Version bump only for package @loopback/pooling





## [0.3.4](https://github.com/loopbackio/loopback-next/compare/@loopback/pooling@0.3.3...@loopback/pooling@0.3.4) (2020-11-18)

**Note:** Version bump only for package @loopback/pooling





## [0.3.3](https://github.com/loopbackio/loopback-next/compare/@loopback/pooling@0.3.2...@loopback/pooling@0.3.3) (2020-11-05)

**Note:** Version bump only for package @loopback/pooling





## [0.3.2](https://github.com/loopbackio/loopback-next/compare/@loopback/pooling@0.3.1...@loopback/pooling@0.3.2) (2020-10-07)

**Note:** Version bump only for package @loopback/pooling





## [0.3.1](https://github.com/loopbackio/loopback-next/compare/@loopback/pooling@0.3.0...@loopback/pooling@0.3.1) (2020-09-17)

**Note:** Version bump only for package @loopback/pooling





# [0.3.0](https://github.com/loopbackio/loopback-next/compare/@loopback/pooling@0.2.2...@loopback/pooling@0.3.0) (2020-09-15)


### Features

* move framework packages to `peerDependencies` ([d8f72e4](https://github.com/loopbackio/loopback-next/commit/d8f72e4e9085aa132bfac3e930f3960042816f2a))


### BREAKING CHANGES

* Extensions no longer install framework packages as
their own dependencies, they use the framework packages provided by the
target application instead.

If you are getting `npm install` errors after upgrade, then make sure
your project lists all dependencies required by the extensions you are
using.

Signed-off-by: Miroslav Bajtoš <mbajtoss@gmail.com>





## [0.2.2](https://github.com/loopbackio/loopback-next/compare/@loopback/pooling@0.2.1...@loopback/pooling@0.2.2) (2020-08-27)

**Note:** Version bump only for package @loopback/pooling





## [0.2.1](https://github.com/loopbackio/loopback-next/compare/@loopback/pooling@0.2.0...@loopback/pooling@0.2.1) (2020-08-19)

**Note:** Version bump only for package @loopback/pooling





# [0.2.0](https://github.com/loopbackio/loopback-next/compare/@loopback/pooling@0.1.0...@loopback/pooling@0.2.0) (2020-08-05)


### Features

* **pooling:** allow optional request context to be passed to acquire ([90dd868](https://github.com/loopbackio/loopback-next/commit/90dd8686475ba159901605de09b9c9926fe91a9d))





# 0.1.0 (2020-07-20)


### Features

* **pooling:** add an extension to provide pooling service ([402e1e0](https://github.com/loopbackio/loopback-next/commit/402e1e0f5da74c2b72199dd29dcaae43add48478))
