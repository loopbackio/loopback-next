# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.5.4](https://github.com/strongloop/loopback-next/compare/@loopback/rest@1.5.3...@loopback/rest@1.5.4) (2019-01-28)

**Note:** Version bump only for package @loopback/rest





## [1.5.3](https://github.com/strongloop/loopback-next/compare/@loopback/rest@1.5.2...@loopback/rest@1.5.3) (2019-01-15)

**Note:** Version bump only for package @loopback/rest





## [1.5.2](https://github.com/strongloop/loopback-next/compare/@loopback/rest@1.5.1...@loopback/rest@1.5.2) (2019-01-14)


### Bug Fixes

* rework tslint comments disabling "no-unused-variable" rule ([a18a3d7](https://github.com/strongloop/loopback-next/commit/a18a3d7))





## [1.5.1](https://github.com/strongloop/loopback-next/compare/@loopback/rest@1.5.0...@loopback/rest@1.5.1) (2018-12-20)

**Note:** Version bump only for package @loopback/rest





# [1.5.0](https://github.com/strongloop/loopback-next/compare/@loopback/rest@1.4.0...@loopback/rest@1.5.0) (2018-12-13)


### Bug Fixes

* **rest:** add tests for request validation per media type ([7be76a4](https://github.com/strongloop/loopback-next/commit/7be76a4))
* **rest:** parse query string even when there is no rest query param ([ad905a5](https://github.com/strongloop/loopback-next/commit/ad905a5))


### Features

* **rest:** allow basePath for rest servers ([1016a09](https://github.com/strongloop/loopback-next/commit/1016a09))





# [1.4.0](https://github.com/strongloop/loopback-next/compare/@loopback/rest@1.3.1...@loopback/rest@1.4.0) (2018-11-26)


### Bug Fixes

* **rest:** allow `.` to be used in openapi path template ([47c24cb](https://github.com/strongloop/loopback-next/commit/47c24cb))


### Features

* **rest:** allow body parsers to be extended ([86bfcbc](https://github.com/strongloop/loopback-next/commit/86bfcbc))
* **rest:** switch to express body-parser ([084837f](https://github.com/strongloop/loopback-next/commit/084837f))





## [1.3.1](https://github.com/strongloop/loopback-next/compare/@loopback/rest@1.3.0...@loopback/rest@1.3.1) (2018-11-17)


### Bug Fixes

* **rest:** allow users to disable Explorer redirects after RestServer was created ([34af6a0](https://github.com/strongloop/loopback-next/commit/34af6a0))





# [1.3.0](https://github.com/strongloop/loopback-next/compare/@loopback/rest@1.2.0...@loopback/rest@1.3.0) (2018-11-14)


### Features

* **rest:** add config option to disable API Explorer redirects ([b4d9bc5](https://github.com/strongloop/loopback-next/commit/b4d9bc5))





<a name="1.2.0"></a>
# [1.2.0](https://github.com/strongloop/loopback-next/compare/@loopback/rest@1.0.1...@loopback/rest@1.2.0) (2018-11-08)


### Bug Fixes

* **rest:** don't rely on transitive dependencies from express ([a3d5d0c](https://github.com/strongloop/loopback-next/commit/a3d5d0c))
* **rest:** handle overlapping paths with different vars ([17adc7a](https://github.com/strongloop/loopback-next/commit/17adc7a))
* **rest:** improve route sorting to group by path and verb ([ce31bf7](https://github.com/strongloop/loopback-next/commit/ce31bf7))
* **rest:** make sure the sorting test pass for node 11 ([614450b](https://github.com/strongloop/loopback-next/commit/614450b))
* fix static assets router blocking controller registration ([0e1b06f](https://github.com/strongloop/loopback-next/commit/0e1b06f))
* move serve-static [@types](https://github.com/types) to normal dependencies ([216bf85](https://github.com/strongloop/loopback-next/commit/216bf85)), closes [#1917](https://github.com/strongloop/loopback-next/issues/1917)
* optimize serving static files ([57a94a5](https://github.com/strongloop/loopback-next/commit/57a94a5))
* remove unnecessary dependency from [#1918](https://github.com/strongloop/loopback-next/issues/1918) ([63d367b](https://github.com/strongloop/loopback-next/commit/63d367b))


### Features

* add 'x-visibility' extension property to OpenAPI spec ([5634e18](https://github.com/strongloop/loopback-next/commit/5634e18))
* **rest:** add support for form request body ([2d9e0a8](https://github.com/strongloop/loopback-next/commit/2d9e0a8))
* **rest:** push route(verb, path, spec, fn) down to RestServer ([c49b65a](https://github.com/strongloop/loopback-next/commit/c49b65a))





<a name="1.0.1"></a>
## [1.0.1](https://github.com/strongloop/loopback-next/compare/@loopback/rest@1.0.0...@loopback/rest@1.0.1) (2018-10-17)

**Note:** Version bump only for package @loopback/rest





<a name="0.26.0"></a>
# [0.26.0](https://github.com/strongloop/loopback-next/compare/@loopback/rest@0.25.5...@loopback/rest@0.26.0) (2018-10-08)


### Features

* **rest:** switch to trie based routing ([a682ce2](https://github.com/strongloop/loopback-next/commit/a682ce2))





<a name="0.25.5"></a>
## [0.25.5](https://github.com/strongloop/loopback-next/compare/@loopback/rest@0.25.4...@loopback/rest@0.25.5) (2018-10-06)

**Note:** Version bump only for package @loopback/rest





<a name="0.25.4"></a>
## [0.25.4](https://github.com/strongloop/loopback-next/compare/@loopback/rest@0.25.3...@loopback/rest@0.25.4) (2018-10-05)

**Note:** Version bump only for package @loopback/rest





<a name="0.25.3"></a>
## [0.25.3](https://github.com/strongloop/loopback-next/compare/@loopback/rest@0.25.2...@loopback/rest@0.25.3) (2018-10-03)


### Performance Improvements

* improve schema validation peformance ([353b202](https://github.com/strongloop/loopback-next/commit/353b202))





<a name="0.25.2"></a>
## [0.25.2](https://github.com/strongloop/loopback-next/compare/@loopback/rest@0.25.1...@loopback/rest@0.25.2) (2018-09-28)

**Note:** Version bump only for package @loopback/rest





<a name="0.25.1"></a>
## [0.25.1](https://github.com/strongloop/loopback-next/compare/@loopback/rest@0.25.0...@loopback/rest@0.25.1) (2018-09-27)

**Note:** Version bump only for package @loopback/rest





<a name="0.25.0"></a>
# [0.25.0](https://github.com/strongloop/loopback-next/compare/@loopback/rest@0.24.0...@loopback/rest@0.25.0) (2018-09-25)


### Bug Fixes

* **rest:** coerce string parameters (reject object values) ([1f49844](https://github.com/strongloop/loopback-next/commit/1f49844))


### Features

* builders for Filter and Where schemas ([ca8d96e](https://github.com/strongloop/loopback-next/commit/ca8d96e))
* **cli:** add responses for PingController.ping() ([ec52b89](https://github.com/strongloop/loopback-next/commit/ec52b89))
* **rest:** allow controller methods to handle response writing ([2bfd50e](https://github.com/strongloop/loopback-next/commit/2bfd50e))





<a name="0.24.0"></a>
# [0.24.0](https://github.com/strongloop/loopback-next/compare/@loopback/rest@0.23.0...@loopback/rest@0.24.0) (2018-09-21)


### Features

* **testlab:** add createRestAppClient(), simplify usage in tests ([d75be77](https://github.com/strongloop/loopback-next/commit/d75be77))
* **testlab:** set port to 0 in givenHttpServerConfig ([90a0bfb](https://github.com/strongloop/loopback-next/commit/90a0bfb))





<a name="0.23.0"></a>
# [0.23.0](https://github.com/strongloop/loopback-next/compare/@loopback/rest@0.22.2...@loopback/rest@0.23.0) (2018-09-19)


### Bug Fixes

* **rest:** return 404 when a model was not found ([7a56bad](https://github.com/strongloop/loopback-next/commit/7a56bad))


### Features

* **rest:** add error codes for REST validation errors ([1762765](https://github.com/strongloop/loopback-next/commit/1762765))
* **rest:** set status code to 204 when body is undefined ([047efcb](https://github.com/strongloop/loopback-next/commit/047efcb))





<a name="0.22.2"></a>
## [0.22.2](https://github.com/strongloop/loopback-next/compare/@loopback/rest@0.22.1...@loopback/rest@0.22.2) (2018-09-14)

**Note:** Version bump only for package @loopback/rest





<a name="0.22.1"></a>
## [0.22.1](https://github.com/strongloop/loopback-next/compare/@loopback/rest@0.22.0...@loopback/rest@0.22.1) (2018-09-14)


### Bug Fixes

* **rest:** make sure validation system error is reported ([fe4fe16](https://github.com/strongloop/loopback-next/commit/fe4fe16))





<a name="0.22.0"></a>
# [0.22.0](https://github.com/strongloop/loopback-next/compare/@loopback/rest@0.21.1...@loopback/rest@0.22.0) (2018-09-14)


### Features

* **openapi-v3:** add support for openapi responses ([0ecaecd](https://github.com/strongloop/loopback-next/commit/0ecaecd))





<a name="0.21.1"></a>
## [0.21.1](https://github.com/strongloop/loopback-next/compare/@loopback/rest@0.21.0...@loopback/rest@0.21.1) (2018-09-12)


### Bug Fixes

* **rest:** tidy up host/port parsing and client url building ([b692f45](https://github.com/strongloop/loopback-next/commit/b692f45))





<a name="0.21.0"></a>
# [0.21.0](https://github.com/strongloop/loopback-next/compare/@loopback/rest@0.20.0...@loopback/rest@0.21.0) (2018-09-10)


### Bug Fixes

* **rest:** use direct import to work around a TS bug ([2cf3b2c](https://github.com/strongloop/loopback-next/commit/2cf3b2c))


### Features

* **rest:** make servers configurable for openapi specs ([99b80a9](https://github.com/strongloop/loopback-next/commit/99b80a9))





<a name="0.20.0"></a>
# [0.20.0](https://github.com/strongloop/loopback-next/compare/@loopback/rest@0.19.6...@loopback/rest@0.20.0) (2018-09-08)


### Bug Fixes

* remove extra imports for mixin dependencies ([35b916b](https://github.com/strongloop/loopback-next/commit/35b916b))
* **rest:** use strong-error-handler for writing errors to the response body ([ac011f8](https://github.com/strongloop/loopback-next/commit/ac011f8))


### Features

* **rest:** allow static assets to be served by a rest server ([a1cefcc](https://github.com/strongloop/loopback-next/commit/a1cefcc))
* coerce object arguments from query strings ([d095693](https://github.com/strongloop/loopback-next/commit/d095693))





<a name="0.19.6"></a>
## [0.19.6](https://github.com/strongloop/loopback-next/compare/@loopback/rest@0.19.5...@loopback/rest@0.19.6) (2018-08-25)

**Note:** Version bump only for package @loopback/rest





<a name="0.19.5"></a>
## [0.19.5](https://github.com/strongloop/loopback-next/compare/@loopback/rest@0.19.4...@loopback/rest@0.19.5) (2018-08-24)


### Bug Fixes

* **openapi-v3:** set required to true for path parameters ([2b13247](https://github.com/strongloop/loopback-next/commit/2b13247))





<a name="0.19.4"></a>
## [0.19.4](https://github.com/strongloop/loopback-next/compare/@loopback/rest@0.19.3...@loopback/rest@0.19.4) (2018-08-15)


### Bug Fixes

* **rest:** set openapi url based on x-forwarded-* headers ([8706038](https://github.com/strongloop/loopback-next/commit/8706038))




<a name="0.19.3"></a>
## [0.19.3](https://github.com/strongloop/loopback-next/compare/@loopback/rest@0.19.2...@loopback/rest@0.19.3) (2018-08-08)




**Note:** Version bump only for package @loopback/rest

<a name="0.19.2"></a>
## [0.19.2](https://github.com/strongloop/loopback-next/compare/@loopback/rest@0.19.1...@loopback/rest@0.19.2) (2018-07-21)




**Note:** Version bump only for package @loopback/rest

<a name="0.19.1"></a>
## [0.19.1](https://github.com/strongloop/loopback-next/compare/@loopback/rest@0.19.0...@loopback/rest@0.19.1) (2018-07-20)




**Note:** Version bump only for package @loopback/rest

<a name="0.19.0"></a>
# [0.19.0](https://github.com/strongloop/loopback-next/compare/@loopback/rest@0.18.0...@loopback/rest@0.19.0) (2018-07-20)


### Features

* add HTTPs protocol support ([6941a5d](https://github.com/strongloop/loopback-next/commit/6941a5d))




<a name="0.18.0"></a>
# [0.18.0](https://github.com/strongloop/loopback-next/compare/@loopback/rest@0.17.1...@loopback/rest@0.18.0) (2018-07-13)


### Features

* localize error in details ([3c9f6b4](https://github.com/strongloop/loopback-next/commit/3c9f6b4))




<a name="0.17.1"></a>
## [0.17.1](https://github.com/strongloop/loopback-next/compare/@loopback/rest@0.17.0...@loopback/rest@0.17.1) (2018-07-11)




**Note:** Version bump only for package @loopback/rest

<a name="0.17.0"></a>
# [0.17.0](https://github.com/strongloop/loopback-next/compare/@loopback/rest@0.16.0...@loopback/rest@0.17.0) (2018-07-10)


### Features

* add tests for array and object ([57b968a](https://github.com/strongloop/loopback-next/commit/57b968a))
* **rest:** add url property ([18b3408](https://github.com/strongloop/loopback-next/commit/18b3408))




<a name="0.16.0"></a>
# [0.16.0](https://github.com/strongloop/loopback-next/compare/@loopback/rest@0.15.1...@loopback/rest@0.16.0) (2018-07-09)


### Features

* body validation ([d284ad8](https://github.com/strongloop/loopback-next/commit/d284ad8))




<a name="0.15.1"></a>
## [0.15.1](https://github.com/strongloop/loopback-next/compare/@loopback/rest@0.15.0...@loopback/rest@0.15.1) (2018-06-28)




**Note:** Version bump only for package @loopback/rest

<a name="0.15.0"></a>
# [0.15.0](https://github.com/strongloop/loopback-next/compare/@loopback/rest@0.14.1...@loopback/rest@0.15.0) (2018-06-27)


### Features

* add `listening` property in the server interface ([ff0eab7](https://github.com/strongloop/loopback-next/commit/ff0eab7)), closes [#1368](https://github.com/strongloop/loopback-next/issues/1368)




<a name="0.14.1"></a>
## [0.14.1](https://github.com/strongloop/loopback-next/compare/@loopback/rest@0.14.0...@loopback/rest@0.14.1) (2018-06-26)




**Note:** Version bump only for package @loopback/rest

<a name="0.14.0"></a>
# [0.14.0](https://github.com/strongloop/loopback-next/compare/@loopback/rest@0.12.0...@loopback/rest@0.14.0) (2018-06-25)


### Features

* coercion for more types ([2b4b269](https://github.com/strongloop/loopback-next/commit/2b4b269))




<a name="0.13.0"></a>
# [0.13.0](https://github.com/strongloop/loopback-next/compare/@loopback/rest@0.12.0...@loopback/rest@0.13.0) (2018-06-25)


### Features

* coercion for more types ([2b4b269](https://github.com/strongloop/loopback-next/commit/2b4b269))




<a name="0.12.0"></a>
# [0.12.0](https://github.com/strongloop/loopback-next/compare/@loopback/rest@0.11.3...@loopback/rest@0.12.0) (2018-06-20)


### Bug Fixes

* **rest:** stop an app that has not been started ([1841ebb](https://github.com/strongloop/loopback-next/commit/1841ebb)), closes [#822](https://github.com/strongloop/loopback-next/issues/822)


### Features

* add type coercion ([2b8d816](https://github.com/strongloop/loopback-next/commit/2b8d816))




<a name="0.11.3"></a>
## [0.11.3](https://github.com/strongloop/loopback-next/compare/@loopback/rest@0.11.2...@loopback/rest@0.11.3) (2018-06-11)




**Note:** Version bump only for package @loopback/rest

<a name="0.11.2"></a>
## [0.11.2](https://github.com/strongloop/loopback-next/compare/@loopback/rest@0.11.0...@loopback/rest@0.11.2) (2018-06-09)




**Note:** Version bump only for package @loopback/rest

<a name="0.11.1"></a>
## [0.11.1](https://github.com/strongloop/loopback-next/compare/@loopback/rest@0.11.0...@loopback/rest@0.11.1) (2018-06-09)




**Note:** Version bump only for package @loopback/rest

<a name="0.11.0"></a>
# [0.11.0](https://github.com/strongloop/loopback-next/compare/@loopback/rest@0.10.5...@loopback/rest@0.11.0) (2018-06-08)


### Bug Fixes

* make the code compatible with TypeScript 2.9.x ([37aba50](https://github.com/strongloop/loopback-next/commit/37aba50))


### Features

* add http-server package ([bac8d8c](https://github.com/strongloop/loopback-next/commit/bac8d8c))




<a name="0.10.5"></a>
## [0.10.5](https://github.com/strongloop/loopback-next/compare/@loopback/rest@0.10.4...@loopback/rest@0.10.5) (2018-05-28)




**Note:** Version bump only for package @loopback/rest

<a name="0.10.4"></a>
## [0.10.4](https://github.com/strongloop/loopback-next/compare/@loopback/rest@0.10.3...@loopback/rest@0.10.4) (2018-05-20)




**Note:** Version bump only for package @loopback/rest

<a name="0.10.3"></a>
## [0.10.3](https://github.com/strongloop/loopback-next/compare/@loopback/rest@0.10.2...@loopback/rest@0.10.3) (2018-05-14)


### Bug Fixes

* change index.d.ts files to point to dist8 ([42ca42d](https://github.com/strongloop/loopback-next/commit/42ca42d))




<a name="0.10.2"></a>
## [0.10.2](https://github.com/strongloop/loopback-next/compare/@loopback/rest@0.10.1...@loopback/rest@0.10.2) (2018-05-14)




**Note:** Version bump only for package @loopback/rest

<a name="0.10.1"></a>
## [0.10.1](https://github.com/strongloop/loopback-next/compare/@loopback/rest@0.10.0...@loopback/rest@0.10.1) (2018-05-08)




**Note:** Version bump only for package @loopback/rest

<a name="0.10.0"></a>
# [0.10.0](https://github.com/strongloop/loopback-next/compare/@loopback/rest@0.8.1...@loopback/rest@0.10.0) (2018-05-03)


### Features

* **context:** allow tags to have an optional value ([95acd11](https://github.com/strongloop/loopback-next/commit/95acd11))
* add helper package "dist-util" ([532f153](https://github.com/strongloop/loopback-next/commit/532f153))




<a name="0.9.0"></a>
# [0.9.0](https://github.com/strongloop/loopback-next/compare/@loopback/rest@0.8.1...@loopback/rest@0.9.0) (2018-05-03)


### Features

* **context:** allow tags to have an optional value ([95acd11](https://github.com/strongloop/loopback-next/commit/95acd11))
* add helper package "dist-util" ([532f153](https://github.com/strongloop/loopback-next/commit/532f153))




<a name="0.8.1"></a>
## [0.8.1](https://github.com/strongloop/loopback-next/compare/@loopback/rest@0.8.0...@loopback/rest@0.8.1) (2018-04-26)




**Note:** Version bump only for package @loopback/rest

<a name="0.8.0"></a>
# [0.8.0](https://github.com/strongloop/loopback-next/compare/@loopback/rest@0.7.0...@loopback/rest@0.8.0) (2018-04-25)


### Features

* upgrade to openapi3-ts@0.11.0 ([1ed79c9](https://github.com/strongloop/loopback-next/commit/1ed79c9))




<a name="0.7.0"></a>
# [0.7.0](https://github.com/strongloop/loopback-next/compare/@loopback/rest@0.6.3...@loopback/rest@0.7.0) (2018-04-16)




**Note:** Version bump only for package @loopback/rest

<a name="0.6.3"></a>
## [0.6.3](https://github.com/strongloop/loopback-next/compare/@loopback/rest@0.6.2...@loopback/rest@0.6.3) (2018-04-16)




**Note:** Version bump only for package @loopback/rest

<a name="0.6.2"></a>
## [0.6.2](https://github.com/strongloop/loopback-next/compare/@loopback/rest@0.6.1...@loopback/rest@0.6.2) (2018-04-12)




**Note:** Version bump only for package @loopback/rest

<a name="0.6.1"></a>
## [0.6.1](https://github.com/strongloop/loopback-next/compare/@loopback/rest@0.6.0...@loopback/rest@0.6.1) (2018-04-11)




**Note:** Version bump only for package @loopback/rest

<a name="0.6.0"></a>
# [0.6.0](https://github.com/strongloop/loopback-next/compare/@loopback/rest@0.5.2...@loopback/rest@0.6.0) (2018-04-11)


### Bug Fixes

* change file names to fit advocated naming convention ([0331df8](https://github.com/strongloop/loopback-next/commit/0331df8))


### Features

* **context:** typed binding keys ([685195c](https://github.com/strongloop/loopback-next/commit/685195c))
* **rest:** add typing for controller instance/class/factory ([a1cbab3](https://github.com/strongloop/loopback-next/commit/a1cbab3))
* **rest:** allow factory for controller routes ([184371b](https://github.com/strongloop/loopback-next/commit/184371b))




<a name="0.5.3"></a>
## [0.5.3](https://github.com/strongloop/loopback-next/compare/@loopback/rest@0.5.2...@loopback/rest@0.5.3) (2018-04-06)




**Note:** Version bump only for package @loopback/rest

<a name="0.5.2"></a>
## [0.5.2](https://github.com/strongloop/loopback-next/compare/@loopback/rest@0.5.1...@loopback/rest@0.5.2) (2018-04-04)




**Note:** Version bump only for package @loopback/rest

<a name="0.5.1"></a>
## [0.5.1](https://github.com/strongloop/loopback-next/compare/@loopback/rest@0.5.0...@loopback/rest@0.5.1) (2018-04-02)




**Note:** Version bump only for package @loopback/rest

<a name="0.5.0"></a>
# [0.5.0](https://github.com/strongloop/loopback-next/compare/@loopback/rest@0.4.1...@loopback/rest@0.5.0) (2018-03-29)




**Note:** Version bump only for package @loopback/rest

<a name="0.4.1"></a>
## [0.4.1](https://github.com/strongloop/loopback-next/compare/@loopback/rest@0.4.0...@loopback/rest@0.4.1) (2018-03-23)




**Note:** Version bump only for package @loopback/rest

<a name="0.4.0"></a>
# [0.4.0](https://github.com/strongloop/loopback-next/compare/@loopback/rest@0.3.4...@loopback/rest@0.4.0) (2018-03-21)


### Features

* **rest:** expose app.requestHandler function ([20a41ac](https://github.com/strongloop/loopback-next/commit/20a41ac))


### BREAKING CHANGES

* **rest:** `RestServer#handleHttp` was renamed to
`RestServer#requestHandler`.




<a name="0.3.4"></a>
## [0.3.4](https://github.com/strongloop/loopback-next/compare/@loopback/rest@0.3.3...@loopback/rest@0.3.4) (2018-03-14)




**Note:** Version bump only for package @loopback/rest

<a name="0.3.3"></a>
## [0.3.3](https://github.com/strongloop/loopback-next/compare/@loopback/rest@0.3.2...@loopback/rest@0.3.3) (2018-03-13)




**Note:** Version bump only for package @loopback/rest

<a name="0.3.2"></a>
## [0.3.2](https://github.com/strongloop/loopback-next/compare/@loopback/rest@0.3.1...@loopback/rest@0.3.2) (2018-03-08)


### Bug Fixes

* **rest:** move [@types](https://github.com/types)/cors to dependency ([fee3520](https://github.com/strongloop/loopback-next/commit/fee3520))




<a name="0.3.1"></a>
## [0.3.1](https://github.com/strongloop/loopback-next/compare/@loopback/rest@0.3.0...@loopback/rest@0.3.1) (2018-03-07)


### Bug Fixes

* **rest:** enable cors preflight ([d05bdae](https://github.com/strongloop/loopback-next/commit/d05bdae))




<a name="0.3.0"></a>
# [0.3.0](https://github.com/strongloop/loopback-next/compare/@loopback/rest@0.2.0...@loopback/rest@0.3.0) (2018-03-06)


### Bug Fixes

* fix typo of `additional` ([2fd7610](https://github.com/strongloop/loopback-next/commit/2fd7610))


### Features

* upgrade from swagger 2 to openapi 3 ([71e5af1](https://github.com/strongloop/loopback-next/commit/71e5af1))




<a name="0.2.0"></a>
# [0.2.0](https://github.com/strongloop/loopback-next/compare/@loopback/rest@0.1.2...@loopback/rest@0.2.0) (2018-03-01)




**Note:** Version bump only for package @loopback/rest

<a name="0.1.2"></a>
## [0.1.2](https://github.com/strongloop/loopback-next/compare/@loopback/rest@0.1.1...@loopback/rest@0.1.2) (2018-03-01)


### Bug Fixes

* **rest:** log unexpected errors to console ([#1058](https://github.com/strongloop/loopback-next/issues/1058)) ([b7b0fd8](https://github.com/strongloop/loopback-next/commit/b7b0fd8))
* **rest:** make the route binding key friendly for find ([e3577ab](https://github.com/strongloop/loopback-next/commit/e3577ab))


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
## [0.1.1](https://github.com/strongloop/loopback-next/compare/@loopback/rest@0.1.0...@loopback/rest@0.1.1) (2018-02-23)


### Bug Fixes

* **context:** fix optional param injection for methods ([801a82d](https://github.com/strongloop/loopback-next/commit/801a82d))




<a name="0.1.0"></a>
# [0.1.0](https://github.com/strongloop/loopback-next/compare/@loopback/rest@4.0.0-alpha.26...@loopback/rest@0.1.0) (2018-02-21)


### Features

* **rest:** app.route() and app.api() ([5c3fd62](https://github.com/strongloop/loopback-next/commit/5c3fd62))




<a name="4.0.0-alpha.26"></a>
# [4.0.0-alpha.26](https://github.com/strongloop/loopback-next/compare/@loopback/rest@4.0.0-alpha.25...@loopback/rest@4.0.0-alpha.26) (2018-02-15)




**Note:** Version bump only for package @loopback/rest

<a name="4.0.0-alpha.25"></a>
# [4.0.0-alpha.25](https://github.com/strongloop/loopback-next/compare/@loopback/rest@4.0.0-alpha.24...@loopback/rest@4.0.0-alpha.25) (2018-02-07)


### build

* drop dist6 related targets ([#945](https://github.com/strongloop/loopback-next/issues/945)) ([a2368ce](https://github.com/strongloop/loopback-next/commit/a2368ce))


### BREAKING CHANGES

* Support for Node.js version lower than 8.0 has been dropped.
Please upgrade to the latest Node.js 8.x LTS version.

Co-Authored-by: Taranveer Virk <taranveer@virk.cc>




<a name="4.0.0-alpha.24"></a>
# [4.0.0-alpha.24](https://github.com/strongloop/loopback-next/compare/@loopback/rest@4.0.0-alpha.23...@loopback/rest@4.0.0-alpha.24) (2018-02-04)


### Bug Fixes

* remove console output from tests ([ff4a320](https://github.com/strongloop/loopback-next/commit/ff4a320))




<a name="4.0.0-alpha.23"></a>
# [4.0.0-alpha.23](https://github.com/strongloop/loopback-next/compare/@loopback/rest@4.0.0-alpha.22...@loopback/rest@4.0.0-alpha.23) (2018-01-30)


### Features

* **repository-json-schema:** add in top-level metadata for json schema ([#907](https://github.com/strongloop/loopback-next/issues/907)) ([fe59e6b](https://github.com/strongloop/loopback-next/commit/fe59e6b))




<a name="4.0.0-alpha.22"></a>
# [4.0.0-alpha.22](https://github.com/strongloop/loopback-next/compare/@loopback/rest@4.0.0-alpha.21...@loopback/rest@4.0.0-alpha.22) (2018-01-29)




**Note:** Version bump only for package @loopback/rest

<a name="4.0.0-alpha.21"></a>
# [4.0.0-alpha.21](https://github.com/strongloop/loopback-next/compare/@loopback/rest@4.0.0-alpha.20...@loopback/rest@4.0.0-alpha.21) (2018-01-26)




**Note:** Version bump only for package @loopback/rest

<a name="4.0.0-alpha.20"></a>
# [4.0.0-alpha.20](https://github.com/strongloop/loopback-next/compare/@loopback/rest@4.0.0-alpha.19...@loopback/rest@4.0.0-alpha.20) (2018-01-26)


### Bug Fixes

* **rest:** correctly re-export decorators at runtime ([c81c0ac](https://github.com/strongloop/loopback-next/commit/c81c0ac))
* **rest:** fix assertion broken by new deps versions ([05a8e0c](https://github.com/strongloop/loopback-next/commit/05a8e0c))
* **rest:** fix yaml comparison to tolerate textual diffs ([615882c](https://github.com/strongloop/loopback-next/commit/615882c))
* apply source-maps to test errors ([76a7f56](https://github.com/strongloop/loopback-next/commit/76a7f56)), closes [#602](https://github.com/strongloop/loopback-next/issues/602)
* make mocha self-contained with the source map support ([7c6d869](https://github.com/strongloop/loopback-next/commit/7c6d869))


### Features

* **rest:** enable dependency injection for controller methods ([72afddd](https://github.com/strongloop/loopback-next/commit/72afddd))




<a name="4.0.0-alpha.19"></a>
# [4.0.0-alpha.19](https://github.com/strongloop/loopback-next/compare/@loopback/rest@4.0.0-alpha.18...@loopback/rest@4.0.0-alpha.19) (2018-01-19)


### Bug Fixes

* **rest:** export decorators for backward compatibility ([#850](https://github.com/strongloop/loopback-next/issues/850)) ([5166388](https://github.com/strongloop/loopback-next/commit/5166388))




<a name="4.0.0-alpha.18"></a>
# [4.0.0-alpha.18](https://github.com/strongloop/loopback-next/compare/@loopback/rest@4.0.0-alpha.17...@loopback/rest@4.0.0-alpha.18) (2018-01-11)


### Bug Fixes

* fix imports to use files owning the definitions ([a50405a](https://github.com/strongloop/loopback-next/commit/a50405a))




<a name="4.0.0-alpha.17"></a>
# [4.0.0-alpha.17](https://github.com/strongloop/loopback-next/compare/@loopback/rest@4.0.0-alpha.16...@loopback/rest@4.0.0-alpha.17) (2018-01-03)


### Bug Fixes

* fix version for [@loopback](https://github.com/loopback)/openapi-v2 ([d032129](https://github.com/strongloop/loopback-next/commit/d032129))




<a name="4.0.0-alpha.16"></a>
# [4.0.0-alpha.16](https://github.com/strongloop/loopback-next/compare/@loopback/rest@4.0.0-alpha.15...@loopback/rest@4.0.0-alpha.16) (2018-01-03)


### Features

* **rest:** set controller name as the default tag ([b008e07](https://github.com/strongloop/loopback-next/commit/b008e07))
* Create [@loopback](https://github.com/loopback)/openapi-v2 ([#804](https://github.com/strongloop/loopback-next/issues/804)) ([4ddd4bc](https://github.com/strongloop/loopback-next/commit/4ddd4bc))




<a name="4.0.0-alpha.15"></a>
# [4.0.0-alpha.15](https://github.com/strongloop/loopback-next/compare/@loopback/rest@4.0.0-alpha.14...@loopback/rest@4.0.0-alpha.15) (2017-12-21)


### Features

* **rest:** Improve decorators to infer param types ([37d881f](https://github.com/strongloop/loopback-next/commit/37d881f))
* **rest:** Single-server RestApplication ([80638b4](https://github.com/strongloop/loopback-next/commit/80638b4))




<a name="4.0.0-alpha.14"></a>
# [4.0.0-alpha.14](https://github.com/strongloop/loopback-next/compare/@loopback/rest@4.0.0-alpha.13...@loopback/rest@4.0.0-alpha.14) (2017-12-15)


### Features

* Expose reflectors via MetadataInspector ([5e6829f](https://github.com/strongloop/loopback-next/commit/5e6829f))
* Refactor REST decorators to use factories ([d03adf7](https://github.com/strongloop/loopback-next/commit/d03adf7))




<a name="4.0.0-alpha.13"></a>
# [4.0.0-alpha.13](https://github.com/strongloop/loopback-next/compare/@loopback/rest@4.0.0-alpha.12...@loopback/rest@4.0.0-alpha.13) (2017-12-11)


### Bug Fixes

* Fix node module names in source code headers ([0316f28](https://github.com/strongloop/loopback-next/commit/0316f28))
* **rest:** Fix compilation error caused by [@types](https://github.com/types)/node ([89f1401](https://github.com/strongloop/loopback-next/commit/89f1401))




<a name="4.0.0-alpha.12"></a>
# [4.0.0-alpha.12](https://github.com/strongloop/loopback-next/compare/@loopback/rest@4.0.0-alpha.11...@loopback/rest@4.0.0-alpha.12) (2017-12-01)


### Bug Fixes

* **rest:** move [@types](https://github.com/types)/http-errors from dev-dep ([11350bd](https://github.com/strongloop/loopback-next/commit/11350bd))




<a name="4.0.0-alpha.11"></a>
# [4.0.0-alpha.11](https://github.com/strongloop/loopback-next/compare/@loopback/rest@4.0.0-alpha.10...@loopback/rest@4.0.0-alpha.11) (2017-11-30)




**Note:** Version bump only for package @loopback/rest

<a name="4.0.0-alpha.10"></a>
# [4.0.0-alpha.10](https://github.com/strongloop/loopback-next/compare/@loopback/rest@4.0.0-alpha.9...@loopback/rest@4.0.0-alpha.10) (2017-11-29)


### Bug Fixes

* **rest:** Fix parameter description ([c3e6afc](https://github.com/strongloop/loopback-next/commit/c3e6afc))
* **rest:** Improve rest metadata inheritance ([3f124f3](https://github.com/strongloop/loopback-next/commit/3f124f3))
* **rest:** Listen on all interfaces if host is not configured ([99daf63](https://github.com/strongloop/loopback-next/commit/99daf63))
* **rest:** Remove unused imports ([76a08ee](https://github.com/strongloop/loopback-next/commit/76a08ee))




<a name="4.0.0-alpha.9"></a>
# [4.0.0-alpha.9](https://github.com/strongloop/loopback-next/compare/@loopback/rest@4.0.0-alpha.8...@loopback/rest@4.0.0-alpha.9) (2017-11-14)


### Features

* **rest:** Make rest host and explorer configurable ([caa2598](https://github.com/strongloop/loopback-next/commit/caa2598))




<a name="4.0.0-alpha.8"></a>
# [4.0.0-alpha.8](https://github.com/strongloop/loopback-next/compare/@loopback/rest@4.0.0-alpha.7...@loopback/rest@4.0.0-alpha.8) (2017-11-09)


### Bug Fixes

* **rest:** Tidy up rest decorator metadata ([7d15bfe](https://github.com/strongloop/loopback-next/commit/7d15bfe))


### Features

* **rest:** Improve http error handling ([15d04fa](https://github.com/strongloop/loopback-next/commit/15d04fa))
* **rest:** Improve result serialization for http ([d5bc53e](https://github.com/strongloop/loopback-next/commit/d5bc53e))




<a name="4.0.0-alpha.7"></a>
# [4.0.0-alpha.7](https://github.com/strongloop/loopback-next/compare/@loopback/rest@4.0.0-alpha.6...@loopback/rest@4.0.0-alpha.7) (2017-11-06)




**Note:** Version bump only for package @loopback/rest

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
