# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [4.1.3](https://github.com/strongloop/loopback-next/compare/@loopback/eslint-config@4.1.2...@loopback/eslint-config@4.1.3) (2019-10-24)

**Note:** Version bump only for package @loopback/eslint-config





## [4.1.2](https://github.com/strongloop/loopback-next/compare/@loopback/eslint-config@4.1.1...@loopback/eslint-config@4.1.2) (2019-10-07)

**Note:** Version bump only for package @loopback/eslint-config





## [4.1.1](https://github.com/strongloop/loopback-next/compare/@loopback/eslint-config@4.1.0...@loopback/eslint-config@4.1.1) (2019-09-27)

**Note:** Version bump only for package @loopback/eslint-config





# [4.1.0](https://github.com/strongloop/loopback-next/compare/@loopback/eslint-config@4.0.2...@loopback/eslint-config@4.1.0) (2019-09-17)


### Features

* **eslint-config:** enable "no-misused-promises" rule ([88d5494](https://github.com/strongloop/loopback-next/commit/88d5494))





## [4.0.2](https://github.com/strongloop/loopback-next/compare/@loopback/eslint-config@4.0.1...@loopback/eslint-config@4.0.2) (2019-09-03)

**Note:** Version bump only for package @loopback/eslint-config





## [4.0.1](https://github.com/strongloop/loopback-next/compare/@loopback/eslint-config@4.0.0...@loopback/eslint-config@4.0.1) (2019-08-19)

**Note:** Version bump only for package @loopback/eslint-config





# [4.0.0](https://github.com/strongloop/loopback-next/compare/@loopback/eslint-config@3.0.0...@loopback/eslint-config@4.0.0) (2019-08-15)


### Features

* **eslint-config:** upgrade to @typescript-eslint/eslint-plugin 2.0.0 ([1ec5b2f](https://github.com/strongloop/loopback-next/commit/1ec5b2f))


### BREAKING CHANGES

* **eslint-config:** @typescript-eslint/parser and @typescript-eslint/eslint-plugin
2.0.0 may have introduced breaking changes for recommended rules and configuration





# [3.0.0](https://github.com/strongloop/loopback-next/compare/@loopback/eslint-config@2.0.2...@loopback/eslint-config@3.0.0) (2019-07-31)


### Features

* **eslint-config:** enable "no-return-await" rule ([e28a3c3](https://github.com/strongloop/loopback-next/commit/e28a3c3))


### BREAKING CHANGES

* **eslint-config:** "return await" is no longer allowed, just return the
promise without awaiting its resolution.





## [2.0.2](https://github.com/strongloop/loopback-next/compare/@loopback/eslint-config@2.0.1...@loopback/eslint-config@2.0.2) (2019-07-26)

**Note:** Version bump only for package @loopback/eslint-config





## [2.0.1](https://github.com/strongloop/loopback-next/compare/@loopback/eslint-config@2.0.0...@loopback/eslint-config@2.0.1) (2019-07-17)

**Note:** Version bump only for package @loopback/eslint-config





# [2.0.0](https://github.com/strongloop/loopback-next/compare/@loopback/eslint-config@1.1.2...@loopback/eslint-config@2.0.0) (2019-06-28)


### Features

* **eslint-config:** enable "no-floating-promises" rule ([256e3e8](https://github.com/strongloop/loopback-next/commit/256e3e8))
* **eslint-config:** upgrade eslint to v6 ([b52a40c](https://github.com/strongloop/loopback-next/commit/b52a40c))


### BREAKING CHANGES

* **eslint-config:** We require eslint version 6.0 as a peer dependency now.
To upgrade your project using our eslint-config, bump up eslint version
in your package.json file to "^6.0.0".

The new eslint version added new recommended rules, most notably
"require-atomic-updates" and "no-prototype-builtins". You may get new
linting errors after upgrade, fix them by changing your code or adding
eslint-ignore comments as needed.





## [1.1.2](https://github.com/strongloop/loopback-next/compare/@loopback/eslint-config@1.1.1...@loopback/eslint-config@1.1.2) (2019-06-17)

**Note:** Version bump only for package @loopback/eslint-config





## [1.1.1](https://github.com/strongloop/loopback-next/compare/@loopback/eslint-config@1.1.0...@loopback/eslint-config@1.1.1) (2019-06-06)

**Note:** Version bump only for package @loopback/eslint-config





# [1.1.0](https://github.com/strongloop/loopback-next/compare/@loopback/eslint-config@1.0.0-3...@loopback/eslint-config@1.1.0) (2019-06-03)


### Features

* replace tslint with eslint ([44185a7](https://github.com/strongloop/loopback-next/commit/44185a7))
* **eslint-config:** allow detection of tsconfig file ([5c16db6](https://github.com/strongloop/loopback-next/commit/5c16db6))





# [1.0.0-3](https://github.com/strongloop/loopback-next/compare/@loopback/eslint-config@1.0.0-2...@loopback/eslint-config@1.0.0-3) (2019-05-31)

**Note:** Version bump only for package @loopback/eslint-config





# 1.0.0-2 (2019-05-30)


### Features

* **build:** add eslint scripts and default configs ([a6abe86](https://github.com/strongloop/loopback-next/commit/a6abe86))
