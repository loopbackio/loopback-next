# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

<a name="4.0.0-alpha.6"></a>
# [4.0.0-alpha.6](https://github.com/strongloop/loopback-next/compare/@loopback/rest@4.0.0-alpha.5...@loopback/rest@4.0.0-alpha.6) (2017-10-31)




**Note:** Version bump only for package @loopback/rest

<a name="4.0.0-alpha.5"></a>
# [4.0.0-alpha.5](https://github.com/strongloop/loopback-next/compare/@loopback/rest@4.0.0-alpha.4...@loopback/rest@4.0.0-alpha.5) (2017-10-31)




**Note:** Version bump only for package @loopback/rest

<a name="4.0.0-alpha.4"></a>
# 4.0.0-alpha.4 (2017-10-25)


### Bug Fixes

* **rest:** Add index boilerplate ([02a025e](https://github.com/strongloop/loopback-next/commit/02a025e))
* **rest:** convert primitives to strings ([2e1ca13](https://github.com/strongloop/loopback-next/commit/2e1ca13))
* **rest:** Move server instantiation to class definition ([051b8e0](https://github.com/strongloop/loopback-next/commit/051b8e0))
* **testlab:** Remove sinon-should integration ([8841fce](https://github.com/strongloop/loopback-next/commit/8841fce))


### Code Refactoring

* **core:** Component servers are now key-value pairs ([866953a](https://github.com/strongloop/loopback-next/commit/866953a))


### BREAKING CHANGES

* **core:** Components must now provide key-value pairs in an
object called "servers".
