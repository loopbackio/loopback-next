# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [2.0.0](https://github.com/strongloop/loopback-next/compare/@loopback/tslint-config@1.0.0...@loopback/tslint-config@2.0.0) (2019-01-14)


### Bug Fixes

* make the tslint-config repo public ([9ba4550](https://github.com/strongloop/loopback-next/commit/9ba4550))


### Features

* **build:** remove "no-unused-variable", add "no-unused" ([78c9d36](https://github.com/strongloop/loopback-next/commit/78c9d36))


### BREAKING CHANGES

* **build:** The rule "no-unused-variable" has been replaced with
"no-unused" rule. Code comments disabling "no-unused-variable" rule will
no longer work and must be changed to disable "no-unused" rule instead.





# 1.0.0 (2018-12-20)


### Features

* move tslint config into a standalone package ([26f3543](https://github.com/strongloop/loopback-next/commit/26f3543))
