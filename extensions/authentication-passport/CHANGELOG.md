# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [3.0.3](https://github.com/strongloop/loopback-next/compare/@loopback/authentication-passport@3.0.2...@loopback/authentication-passport@3.0.3) (2020-11-05)

**Note:** Version bump only for package @loopback/authentication-passport





## [3.0.2](https://github.com/strongloop/loopback-next/compare/@loopback/authentication-passport@3.0.1...@loopback/authentication-passport@3.0.2) (2020-10-07)


### Bug Fixes

* **docs:** fix broken links ([3348ab4](https://github.com/strongloop/loopback-next/commit/3348ab4ea8bc1fc41a3a2f71756c978123ed4001))





## [3.0.1](https://github.com/strongloop/loopback-next/compare/@loopback/authentication-passport@3.0.0...@loopback/authentication-passport@3.0.1) (2020-09-17)

**Note:** Version bump only for package @loopback/authentication-passport





# [3.0.0](https://github.com/strongloop/loopback-next/compare/@loopback/authentication-passport@2.1.13...@loopback/authentication-passport@3.0.0) (2020-09-15)


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





## [2.1.13](https://github.com/strongloop/loopback-next/compare/@loopback/authentication-passport@2.1.12...@loopback/authentication-passport@2.1.13) (2020-08-27)

**Note:** Version bump only for package @loopback/authentication-passport





## [2.1.12](https://github.com/strongloop/loopback-next/compare/@loopback/authentication-passport@2.1.11...@loopback/authentication-passport@2.1.12) (2020-08-19)

**Note:** Version bump only for package @loopback/authentication-passport





## [2.1.11](https://github.com/strongloop/loopback-next/compare/@loopback/authentication-passport@2.1.10...@loopback/authentication-passport@2.1.11) (2020-08-05)

**Note:** Version bump only for package @loopback/authentication-passport





## [2.1.10](https://github.com/strongloop/loopback-next/compare/@loopback/authentication-passport@2.1.9...@loopback/authentication-passport@2.1.10) (2020-07-20)


### Bug Fixes

* **docs:** fix numbering ([bb9a5ae](https://github.com/strongloop/loopback-next/commit/bb9a5ae6b74018a1ec69070d5aaaf1b29ca66647))





## [2.1.9](https://github.com/strongloop/loopback-next/compare/@loopback/authentication-passport@2.1.8...@loopback/authentication-passport@2.1.9) (2020-06-30)

**Note:** Version bump only for package @loopback/authentication-passport





## [2.1.8](https://github.com/strongloop/loopback-next/compare/@loopback/authentication-passport@2.1.7...@loopback/authentication-passport@2.1.8) (2020-06-23)


### Bug Fixes

* set node version to >=10.16 to support events.once ([e39da1c](https://github.com/strongloop/loopback-next/commit/e39da1ca47728eafaf83c10ce35b09b03b6a4edc))
* **docs:** fix broken links ([0e63a6b](https://github.com/strongloop/loopback-next/commit/0e63a6b79b3dc727b01ff4031548b3d3aeceb544))





## [2.1.7](https://github.com/strongloop/loopback-next/compare/@loopback/authentication-passport@2.1.6...@loopback/authentication-passport@2.1.7) (2020-06-11)


### Bug Fixes

* remove unused dependency `@loopback/metadata` ([4d6bff9](https://github.com/strongloop/loopback-next/commit/4d6bff942b8b8b58fe5940b3daf5715c145293df))





## [2.1.6](https://github.com/strongloop/loopback-next/compare/@loopback/authentication-passport@2.1.5...@loopback/authentication-passport@2.1.6) (2020-05-28)

**Note:** Version bump only for package @loopback/authentication-passport





## [2.1.5](https://github.com/strongloop/loopback-next/compare/@loopback/authentication-passport@2.1.4...@loopback/authentication-passport@2.1.5) (2020-05-20)

**Note:** Version bump only for package @loopback/authentication-passport





## [2.1.4](https://github.com/strongloop/loopback-next/compare/@loopback/authentication-passport@2.1.3...@loopback/authentication-passport@2.1.4) (2020-05-19)


### Bug Fixes

* errors in mock oauth2 app export from test folder ([5c4d10f](https://github.com/strongloop/loopback-next/commit/5c4d10f7cb37087cf5f01bd2985f086b04413cf8)), closes [#5380](https://github.com/strongloop/loopback-next/issues/5380)
* **authentication-passport:** delete an extra curly brackets in UserProfileFactory example ([32d56ac](https://github.com/strongloop/loopback-next/commit/32d56ac68af971a9f9e9cff7506a8d702654ca21))





## [2.1.3](https://github.com/strongloop/loopback-next/compare/@loopback/authentication-passport@2.1.2...@loopback/authentication-passport@2.1.3) (2020-05-07)

**Note:** Version bump only for package @loopback/authentication-passport





## [2.1.2](https://github.com/strongloop/loopback-next/compare/@loopback/authentication-passport@2.1.1...@loopback/authentication-passport@2.1.2) (2020-04-29)

**Note:** Version bump only for package @loopback/authentication-passport





## [2.1.1](https://github.com/strongloop/loopback-next/compare/@loopback/authentication-passport@2.1.0...@loopback/authentication-passport@2.1.1) (2020-04-23)

**Note:** Version bump only for package @loopback/authentication-passport





# [2.1.0](https://github.com/strongloop/loopback-next/compare/@loopback/authentication-passport@2.0.4...@loopback/authentication-passport@2.1.0) (2020-04-22)


### Features

* migrate loopback-example-passport repo as lb4 example ([dd3c328](https://github.com/strongloop/loopback-next/commit/dd3c328a138621bb3f6ae770b4db83ba21ecc2d6))
* update package.json and .travis.yml for builds ([cb2b8e6](https://github.com/strongloop/loopback-next/commit/cb2b8e6a18616dda7783c0193091039d4e608131))





## [2.0.4](https://github.com/strongloop/loopback-next/compare/@loopback/authentication-passport@2.0.3...@loopback/authentication-passport@2.0.4) (2020-04-11)


### Bug Fixes

* **authentication-passport:** fix typing issues for oAuth2 mock app ([0d050de](https://github.com/strongloop/loopback-next/commit/0d050dea7058e652c9b885ba850fa50fb9506ee4))





## [2.0.3](https://github.com/strongloop/loopback-next/compare/@loopback/authentication-passport@2.0.2...@loopback/authentication-passport@2.0.3) (2020-04-08)


### Bug Fixes

* passport strategy adapter must support oauth2 flows ([67c2f02](https://github.com/strongloop/loopback-next/commit/67c2f02f74c08ee037827c0045e1f225d6ca8ede))





## [2.0.2](https://github.com/strongloop/loopback-next/compare/@loopback/authentication-passport@2.0.1...@loopback/authentication-passport@2.0.2) (2020-03-24)

**Note:** Version bump only for package @loopback/authentication-passport





## [2.0.1](https://github.com/strongloop/loopback-next/compare/@loopback/authentication-passport@2.0.0...@loopback/authentication-passport@2.0.1) (2020-03-17)

**Note:** Version bump only for package @loopback/authentication-passport





# [2.0.0](https://github.com/strongloop/loopback-next/compare/@loopback/authentication-passport@1.1.3...@loopback/authentication-passport@2.0.0) (2020-03-05)


### chore

* remove support for Node.js v8.x ([4281d9d](https://github.com/strongloop/loopback-next/commit/4281d9df50f0715d32879e1442a90b643ec8f542))


### Features

* add `tslib` as dependency ([a6e0b4c](https://github.com/strongloop/loopback-next/commit/a6e0b4ce7b862764167cefedee14c1115b25e0a4)), closes [#4676](https://github.com/strongloop/loopback-next/issues/4676)


### BREAKING CHANGES

* Node.js v8.x is now end of life. Please upgrade to version
10 and above. See https://nodejs.org/en/about/releases.





## [1.1.3](https://github.com/strongloop/loopback-next/compare/@loopback/authentication-passport@1.1.2...@loopback/authentication-passport@1.1.3) (2020-02-06)

**Note:** Version bump only for package @loopback/authentication-passport





## [1.1.2](https://github.com/strongloop/loopback-next/compare/@loopback/authentication-passport@1.1.1...@loopback/authentication-passport@1.1.2) (2020-02-05)

**Note:** Version bump only for package @loopback/authentication-passport





## [1.1.1](https://github.com/strongloop/loopback-next/compare/@loopback/authentication-passport@1.1.0...@loopback/authentication-passport@1.1.1) (2020-01-27)

**Note:** Version bump only for package @loopback/authentication-passport





# [1.1.0](https://github.com/strongloop/loopback-next/compare/@loopback/authentication-passport@1.0.6...@loopback/authentication-passport@1.1.0) (2020-01-07)


### Features

* add user profile factory interface ([0630194](https://github.com/strongloop/loopback-next/commit/0630194539ba7971ca6c6579ebb9d986e6340a41))





## [1.0.6](https://github.com/strongloop/loopback-next/compare/@loopback/authentication-passport@1.0.5...@loopback/authentication-passport@1.0.6) (2019-12-09)

**Note:** Version bump only for package @loopback/authentication-passport





## [1.0.5](https://github.com/strongloop/loopback-next/compare/@loopback/authentication-passport@1.0.4...@loopback/authentication-passport@1.0.5) (2019-11-25)

**Note:** Version bump only for package @loopback/authentication-passport





## [1.0.4](https://github.com/strongloop/loopback-next/compare/@loopback/authentication-passport@1.0.3...@loopback/authentication-passport@1.0.4) (2019-11-12)

**Note:** Version bump only for package @loopback/authentication-passport





## [1.0.3](https://github.com/strongloop/loopback-next/compare/@loopback/authentication-passport@1.0.2...@loopback/authentication-passport@1.0.3) (2019-10-24)

**Note:** Version bump only for package @loopback/authentication-passport





## [1.0.2](https://github.com/strongloop/loopback-next/compare/@loopback/authentication-passport@1.0.1...@loopback/authentication-passport@1.0.2) (2019-10-07)

**Note:** Version bump only for package @loopback/authentication-passport





## [1.0.1](https://github.com/strongloop/loopback-next/compare/@loopback/authentication-passport@1.0.0...@loopback/authentication-passport@1.0.1) (2019-09-28)

**Note:** Version bump only for package @loopback/authentication-passport





# 1.0.0 (2019-09-27)


### Features

* **authentication-passport:** init commit ([6c83c3d](https://github.com/strongloop/loopback-next/commit/6c83c3d))
* **authentication-passport:** upgrade to authentication 3 ([60d4f60](https://github.com/strongloop/loopback-next/commit/60d4f60))


### BREAKING CHANGES

* **authentication-passport:** upgrade dependency @loopback/authentication to 3.0.0
