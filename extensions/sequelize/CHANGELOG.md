# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.5.0](https://github.com/loopbackio/loopback-next/compare/@loopback/sequelize@0.4.0...@loopback/sequelize@0.5.0) (2023-07-17)


### Features

* **sequelize:** add `defaultFn` support ([960c3eb](https://github.com/loopbackio/loopback-next/commit/960c3eb7a0f965c9965f01c27a4765c2ede67256)), closes [#9597](https://github.com/loopbackio/loopback-next/issues/9597)





# [0.4.0](https://github.com/loopbackio/loopback-next/compare/@loopback/sequelize@0.3.0...@loopback/sequelize@0.4.0) (2023-06-28)


### Bug Fixes

* **sequelize:** defer to `toJSON` for hidden property exclusion ([89b12b9](https://github.com/loopbackio/loopback-next/commit/89b12b992a5b176f5c4e022703d227702adda468))
* **sequelize:** get table name dynamically ([2a7ca80](https://github.com/loopbackio/loopback-next/commit/2a7ca805da0d717afc1f98f529f18ba527d5bcc2))
* **sequelize:** handle invalid inclusion filter ([dae9d49](https://github.com/loopbackio/loopback-next/commit/dae9d4957460c94142da2a52c84e11ece961a0d1)), closes [#9635](https://github.com/loopbackio/loopback-next/issues/9635)
* **sequelize:** preserve error context ([b7ca762](https://github.com/loopbackio/loopback-next/commit/b7ca762d8d55d05d86d3122cdfb2c873c87c8cde)), closes [#9626](https://github.com/loopbackio/loopback-next/issues/9626)
* **sequelize:** statically use 5.1.4 version of sqlite3 ([135a500](https://github.com/loopbackio/loopback-next/commit/135a50023b71f4a2817eebe933e90e29768741ec))


### Features

* **sequelize:** allow direct option forwarding to sequelize instance ([f751040](https://github.com/loopbackio/loopback-next/commit/f7510408e3ebdc35446a73f6e85d419bf3c160a6))
* **sequelize:** custom query support ([a30ecc8](https://github.com/loopbackio/loopback-next/commit/a30ecc826b47c246ed33ebb172d250ea72bb4e61))
* update dependency @types/node to ^16 ([2af42b7](https://github.com/loopbackio/loopback-next/commit/2af42b721c6dfc2df49bfcac1cbea478aba417ab))





# [0.3.0](https://github.com/loopbackio/loopback-next/compare/@loopback/sequelize@0.2.0...@loopback/sequelize@0.3.0) (2023-05-15)


### Features

* add support for node v20 ([e23cefa](https://github.com/loopbackio/loopback-next/commit/e23cefaf5cce3fb990cb09f4c94239d1979615b1))
* remove support for node v14 ([5425762](https://github.com/loopbackio/loopback-next/commit/5425762f1353869994acf081bcda4816e6a9c3b0))
* remove support for node v19 ([e26a2ac](https://github.com/loopbackio/loopback-next/commit/e26a2ac2e43245d09dfc9721ccfa41d830daccb8))


### BREAKING CHANGES

* End of life of Node v14

Signed-off-by: Francisco Buceta <frbuceta@gmail.com>





# [0.2.0](https://github.com/loopbackio/loopback-next/compare/@loopback/sequelize@0.1.0...@loopback/sequelize@0.2.0) (2023-04-13)


### Bug Fixes

* refresh package lock files ([9979eb1](https://github.com/loopbackio/loopback-next/commit/9979eb183b6c6cd5775da7478cdede8a92ce0d5e)), closes [#9351](https://github.com/loopbackio/loopback-next/issues/9351)


### Features

* **sequelize:** add connection pooling support ([043c8d7](https://github.com/loopbackio/loopback-next/commit/043c8d734a21d993cfb380f7996ca9c2269611d7))
* **sequelize:** add sql transactions support ([9719c0a](https://github.com/loopbackio/loopback-next/commit/9719c0ace6624191ecaea817702610ee428658de))





# 0.1.0 (2023-03-09)


### Features

* **sequelize:** add an extension for sequelize orm ([6256ed9](https://github.com/loopbackio/loopback-next/commit/6256ed903eb04af2fd78995d58eb623d878df845))
