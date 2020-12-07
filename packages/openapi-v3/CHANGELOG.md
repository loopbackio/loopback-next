# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [5.1.2](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@5.1.1...@loopback/openapi-v3@5.1.2) (2020-12-07)

**Note:** Version bump only for package @loopback/openapi-v3





## [5.1.1](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@5.1.0...@loopback/openapi-v3@5.1.1) (2020-11-18)

**Note:** Version bump only for package @loopback/openapi-v3





# [5.1.0](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@5.0.0...@loopback/openapi-v3@5.1.0) (2020-11-05)


### Bug Fixes

* **openapi-v3:** add apidocs for oas.response and oas.tags ([a7151d8](https://github.com/strongloop/loopback-next/commit/a7151d831c5e3c78a6938a30eab9d1b78fc31c0c))


### Features

* turn modifySpec into async ([fcd0bcb](https://github.com/strongloop/loopback-next/commit/fcd0bcbc9f9c042a254993d5d26a4c9526e72eb0))
* **filter:** allow use an array in filter.fields ([ec386c1](https://github.com/strongloop/loopback-next/commit/ec386c15bce904c770a9be51f21d4ff3592dd1af))
* **openapi-v3:** make `mergeOpenAPISpec` retval strongly typed ([91b433a](https://github.com/strongloop/loopback-next/commit/91b433ae6b2ddcd7c0636ed020a2b84c8a09cf65))





# [5.0.0](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@4.0.1...@loopback/openapi-v3@5.0.0) (2020-10-07)


### Features

* **openapi-v3:** add OAS3 visibility decorator ([c388cbf](https://github.com/strongloop/loopback-next/commit/c388cbf94ea06065432b4bb52a8b494b5d8c4c8e)), closes [#6392](https://github.com/strongloop/loopback-next/issues/6392)
* update dependency openapi3-ts to v2 ([aabd6e6](https://github.com/strongloop/loopback-next/commit/aabd6e62a11d5e10ff2256ec664a923041e27ce0))


### BREAKING CHANGES

* openapi3-ts@2.x has a stricter typing for `type` and `format`
properties as union types with a known list of values.

We now either have to explicitly type the schema as `SchemaObject`
or cast the `type` to `SchemaObject['type'], for example:

```ts
import {SchemaObject} from '@loopback/openapi-v3';

const schemaDef1 = {
  type: 'number' as const; // cast the type to be 'number' from 'string'
};

// Use the explicit `SchemaObject` to enforce inference
const schemaDef2: SchemaObject = {
  type: 'number' as const;
};
```

It also applies to OpenAPI parameter objects:

```ts
import {ParameterObject} from '@loopback/openapi-v3';

const paramDef1 = {
  type: 'number' as const, // cast the type to be 'number' from 'string'
  name: 'limit',
  in: 'query',
}

// Use the explicit `ParameterObject` to enforce inference
const paramDef2: ParameterObject = {
  type: 'number',
  name: 'limit',
  in: 'query',
}
```

Signed-off-by: Renovate Bot <bot@renovateapp.com>





## [4.0.1](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@4.0.0...@loopback/openapi-v3@4.0.1) (2020-09-17)

**Note:** Version bump only for package @loopback/openapi-v3





# [4.0.0](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@3.4.9...@loopback/openapi-v3@4.0.0) (2020-09-15)


### Bug Fixes

* improve handling of missing design-time type metadata ([95b6a2b](https://github.com/strongloop/loopback-next/commit/95b6a2b7ce64e614720df43b905f77a53a54e438))


### Features

* **openapi-v3:** export a constant for the default openapi spec info ([fce91a2](https://github.com/strongloop/loopback-next/commit/fce91a20e514c557a5f84bfcae4eb7031894f114))
* move framework packages to `devDependencies` ([e2c61ce](https://github.com/strongloop/loopback-next/commit/e2c61ce79aa68d76f6e7138642034160b50063f0))


### BREAKING CHANGES

* components no longer install core framework packages as
their own dependencies, they use the framework packages provided by the
target application instead.

If you are getting `npm install` errors after upgrade, then make sure
your project lists all dependencies required by the extensions you are
using.

Signed-off-by: Miroslav Bajtoš <mbajtoss@gmail.com>





## [3.4.9](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@3.4.8...@loopback/openapi-v3@3.4.9) (2020-08-27)


### Bug Fixes

* **repository-json-schema:** allows string-based order filter ([c10dca9](https://github.com/strongloop/loopback-next/commit/c10dca990f73d80c70752ae72fd1006bb356991d)), closes [#6140](https://github.com/strongloop/loopback-next/issues/6140)





## [3.4.8](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@3.4.7...@loopback/openapi-v3@3.4.8) (2020-08-19)

**Note:** Version bump only for package @loopback/openapi-v3





## [3.4.7](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@3.4.6...@loopback/openapi-v3@3.4.7) (2020-08-05)

**Note:** Version bump only for package @loopback/openapi-v3





## [3.4.6](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@3.4.5...@loopback/openapi-v3@3.4.6) (2020-07-20)


### Bug Fixes

* **repository-json-schema:** added type 'object' to model json schema ([5c5f9ef](https://github.com/strongloop/loopback-next/commit/5c5f9efcfdea7788503d74610e7ce64f31abc7cd)), closes [#3804](https://github.com/strongloop/loopback-next/issues/3804)





## [3.4.5](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@3.4.4...@loopback/openapi-v3@3.4.5) (2020-06-30)

**Note:** Version bump only for package @loopback/openapi-v3





## [3.4.4](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@3.4.3...@loopback/openapi-v3@3.4.4) (2020-06-23)


### Bug Fixes

* set node version to >=10.16 to support events.once ([e39da1c](https://github.com/strongloop/loopback-next/commit/e39da1ca47728eafaf83c10ce35b09b03b6a4edc))





## [3.4.3](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@3.4.2...@loopback/openapi-v3@3.4.3) (2020-06-11)

**Note:** Version bump only for package @loopback/openapi-v3





## [3.4.2](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@3.4.1...@loopback/openapi-v3@3.4.2) (2020-05-28)

**Note:** Version bump only for package @loopback/openapi-v3





## [3.4.1](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@3.4.0...@loopback/openapi-v3@3.4.1) (2020-05-20)

**Note:** Version bump only for package @loopback/openapi-v3





# [3.4.0](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@3.3.1...@loopback/openapi-v3@3.4.0) (2020-05-19)


### Features

* **openapi-v3:** relax `[@api](https://github.com/api)` to make `paths` optional with `{}` as the default ([ef3c415](https://github.com/strongloop/loopback-next/commit/ef3c4151efb2c88daa2b5abb37c6086b91860c92))





## [3.3.1](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@3.3.0...@loopback/openapi-v3@3.3.1) (2020-05-07)

**Note:** Version bump only for package @loopback/openapi-v3





# [3.3.0](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@3.2.1...@loopback/openapi-v3@3.3.0) (2020-04-29)


### Features

* populate x-typescript-type for openapi schema ([02a2633](https://github.com/strongloop/loopback-next/commit/02a26339e8a49b92148aa9c05179458a4bc85a70))





## [3.2.1](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@3.2.0...@loopback/openapi-v3@3.2.1) (2020-04-23)

**Note:** Version bump only for package @loopback/openapi-v3





# [3.2.0](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@3.1.3...@loopback/openapi-v3@3.2.0) (2020-04-22)


### Features

* **rest:** ensure OpenAPI spec components are merged ([2efa27b](https://github.com/strongloop/loopback-next/commit/2efa27b283d86258fe705914c557536abaf2c435))
* update package.json and .travis.yml for builds ([cb2b8e6](https://github.com/strongloop/loopback-next/commit/cb2b8e6a18616dda7783c0193091039d4e608131))
* **rest:** add openapi schema consolidation ([6a039ed](https://github.com/strongloop/loopback-next/commit/6a039edd4e056089bca8cf2acd4ed7ddab55d55e))





## [3.1.3](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@3.1.2...@loopback/openapi-v3@3.1.3) (2020-04-11)

**Note:** Version bump only for package @loopback/openapi-v3





## [3.1.2](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@3.1.1...@loopback/openapi-v3@3.1.2) (2020-04-08)

**Note:** Version bump only for package @loopback/openapi-v3





## [3.1.1](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@3.1.0...@loopback/openapi-v3@3.1.1) (2020-03-24)

**Note:** Version bump only for package @loopback/openapi-v3





# [3.1.0](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@3.0.0...@loopback/openapi-v3@3.1.0) (2020-03-17)


### Features

* **openapi-v3:** add sugar decorators for file requestBody/response ([e8c8f38](https://github.com/strongloop/loopback-next/commit/e8c8f38161b6b2c0ac93d047667649c97ba6eba9))
* enable authStrategy to provide OASEnhancer ([df7dd2b](https://github.com/strongloop/loopback-next/commit/df7dd2b7852eef83a259d38819a0175fc408a5fc))





# [3.0.0](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@2.0.0...@loopback/openapi-v3@3.0.0) (2020-03-05)


### chore

* remove support for Node.js v8.x ([4281d9d](https://github.com/strongloop/loopback-next/commit/4281d9df50f0715d32879e1442a90b643ec8f542))


### Features

* **openapi-v3:** add sugar decorators for filter/where params ([f61896e](https://github.com/strongloop/loopback-next/commit/f61896efa886eb580bfc2b58de1b6e4862a4c53d))
* add `tslib` as dependency ([a6e0b4c](https://github.com/strongloop/loopback-next/commit/a6e0b4ce7b862764167cefedee14c1115b25e0a4)), closes [#4676](https://github.com/strongloop/loopback-next/issues/4676)
* adds [@response](https://github.com/response) decorator ([fe603ec](https://github.com/strongloop/loopback-next/commit/fe603ec815e6d6c446cc540860c2dc99d4b9a908))
* improve filter schema to allow exclusion ([be73660](https://github.com/strongloop/loopback-next/commit/be736601dcf91b8b322470fc08c9ed42260fa60c))


### BREAKING CHANGES

* Node.js v8.x is now end of life. Please upgrade to version
10 and above. See https://nodejs.org/en/about/releases.





# [2.0.0](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@1.13.0...@loopback/openapi-v3@2.0.0) (2020-02-06)


### Bug Fixes

* suport complex objects for query params in api explorer ([a4ef640](https://github.com/strongloop/loopback-next/commit/a4ef64037a80d1ff7df37ba7912909a1bfcdbf51))


### BREAKING CHANGES

* This fix has modified the api definitions described by the decorator
'param.query.object', to support Open-API's `url-encoded` definition for json query
parameters.

Previously, such parameters were described with `exploded: true` and
`style: deepObject`, i.e exploded encoding, which turned out to be problematic as explained and discussed in,
https://github.com/swagger-api/swagger-js/issues/1385 and
https://github.com/OAI/OpenAPI-Specification/issues/1706

```json
  {
    "in": "query",
    "style": "deepObject"
    "explode": "true",
    "schema": {}
  }
```

Exploded encoding worked for simple json objects as below but not for complex objects.

```
   http://localhost:3000/todos?filter[limit]=2
```

To address these issues with exploded queries, this fix switches definition of json
query params from the `exploded`, `deep-object` style to the `url-encoded` style
definition in Open-API spec.

LoopBack already supports receiving url-encoded payload for json query parameters.

For instance, to filter api results from the GET '/todo-list' endpoint in the
todo-list example with a specific relation, { "include": [ { "relation": "todo" } ] },
the following url-encoded query parameter can be used,

```
   http://localhost:3000/todos?filter=%7B%22include%22%3A%5B%7B%22relation%22%3A%22todoList%22%7D%5D%7D
```

The above was possible because the coercion behavior in LoopBack performed json
parsing for `deep object` style json query params before this fix. This fix has
modified that behavior by removing json parsing. Since the `exploded` `deep-object`
definition has been removed from the `param.query.object` decorator, this new
behaviour remains just an internal source code aspect as of now.

In effect, this fix only modifies the open api definitions generated from LoopBack
APIs. The 'style' and 'explode' fields are removed and the 'schema' field is moved
under 'content[application/json]'. This is the definition that supports url-encoding
as per Open-API spec.

```json
  {
    "in": "query"
    "content": {
      "application/json": {
        "schema": {}
      }
    }
  }
```

Certain client libraries (like swagger-ui or LoopBack's api explorer) necessiate
using Open-API's `url-encoded` style definition for json query params to support
"sending" url-encoded payload.

All consumers of LoopBack APIs may need to regenerate api definitions, if their
client libraries require them to do so for url-encoding.

Otherwise there wouldn't be any significant impact on API consumers.

To preserve compatibility with existing REST API clients, this change is backward
compatible. All exploded queries like `?filter[limit]=1` will continue to work for
json query params, despite the fact that they are described differently in the
OpenAPI spec.

Existing api clients will continue to work after an upgrade.

The signature of the 'param.query.object' decorator has not changed.

There is no code changes required in the LoopBack APIs after upgrading to this
fix. No method signatures or data structures are impacted.





# [1.13.0](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@1.12.0...@loopback/openapi-v3@1.13.0) (2020-02-05)


### Features

* adds [@oas](https://github.com/oas).deprecated() decorator ([6b6b5f0](https://github.com/strongloop/loopback-next/commit/6b6b5f05d224053d6a9735a506841d19b7331dac))
* adds [@oas](https://github.com/oas).tags convenience decorator ([a8722dc](https://github.com/strongloop/loopback-next/commit/a8722dc68838344684a5d3de76fa6915e08d2e56))





# [1.12.0](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@1.11.0...@loopback/openapi-v3@1.12.0) (2020-01-27)


### Features

* support x-ts-type in anyOf/allOf/oneOf/not ([28fcc54](https://github.com/strongloop/loopback-next/commit/28fcc545e42d4c5ae88215436b873a78a3fb6c8d))
* **openapi-v3:** add support for `anyOf` and `oneOf` on the `jsonToSchemaObject` utility ([72ba132](https://github.com/strongloop/loopback-next/commit/72ba1321a85112a3e085d62fe573f60f79d5c64c)), closes [#3524](https://github.com/strongloop/loopback-next/issues/3524)
* **repository-json-schema:** add title to filter schemas ([6105883](https://github.com/strongloop/loopback-next/commit/6105883967ca5853cc8990f423d9febd1eb07101))





# [1.11.0](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@1.10.3...@loopback/openapi-v3@1.11.0) (2020-01-07)


### Features

* openapi spec contributor extension point ([9fee3f3](https://github.com/strongloop/loopback-next/commit/9fee3f342ff76d65d1899ddf1dbf7a257c85ea26))





## [1.10.3](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@1.10.2...@loopback/openapi-v3@1.10.3) (2019-12-09)

**Note:** Version bump only for package @loopback/openapi-v3





## [1.10.2](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@1.10.1...@loopback/openapi-v3@1.10.2) (2019-11-25)

**Note:** Version bump only for package @loopback/openapi-v3





## [1.10.1](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@1.10.0...@loopback/openapi-v3@1.10.1) (2019-11-12)


### Bug Fixes

* **openapi-v3:** remove examples from schema ([c819f92](https://github.com/strongloop/loopback-next/commit/c819f92b647a5baf651b4aeec6636dd2f2e70771))





# [1.10.0](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@1.9.10...@loopback/openapi-v3@1.10.0) (2019-10-24)


### Bug Fixes

* allow json schema with circular refs to be converted to OpenAPI schema ([cd5ca92](https://github.com/strongloop/loopback-next/commit/cd5ca92c368ae35bc10d8847b3b0d379f7196544))
* **openapi-v3:** preserve `additionalProperties: false` ([bc7691b](https://github.com/strongloop/loopback-next/commit/bc7691b0963ee297922bd4d9652a0eccf763f085))


### Features

* **openapi-v3:** copy first example from examples to schema ([0c7843a](https://github.com/strongloop/loopback-next/commit/0c7843abd82b391557d807e7bbd80e4c7b2ae8fd))





## [1.9.10](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@1.9.9...@loopback/openapi-v3@1.9.10) (2019-10-07)

**Note:** Version bump only for package @loopback/openapi-v3





## [1.9.9](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@1.9.8...@loopback/openapi-v3@1.9.9) (2019-09-28)

**Note:** Version bump only for package @loopback/openapi-v3





## [1.9.8](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@1.9.7...@loopback/openapi-v3@1.9.8) (2019-09-27)

**Note:** Version bump only for package @loopback/openapi-v3





## [1.9.7](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@1.9.6...@loopback/openapi-v3@1.9.7) (2019-09-17)

**Note:** Version bump only for package @loopback/openapi-v3





## [1.9.6](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@1.9.5...@loopback/openapi-v3@1.9.6) (2019-09-06)

**Note:** Version bump only for package @loopback/openapi-v3





## [1.9.5](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@1.9.4...@loopback/openapi-v3@1.9.5) (2019-09-03)

**Note:** Version bump only for package @loopback/openapi-v3





## [1.9.4](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@1.9.3...@loopback/openapi-v3@1.9.4) (2019-08-19)

**Note:** Version bump only for package @loopback/openapi-v3





## [1.9.3](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@1.9.2...@loopback/openapi-v3@1.9.3) (2019-08-15)

**Note:** Version bump only for package @loopback/openapi-v3





## [1.9.2](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@1.9.1...@loopback/openapi-v3@1.9.2) (2019-08-15)

**Note:** Version bump only for package @loopback/openapi-v3





## [1.9.1](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@1.9.0...@loopback/openapi-v3@1.9.1) (2019-07-31)


### Bug Fixes

* enforce JsonSchemaOptions type when building model schema ([9bbc932](https://github.com/strongloop/loopback-next/commit/9bbc932))





# [1.9.0](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@1.8.0...@loopback/openapi-v3@1.9.0) (2019-07-26)


### Features

* **openapi-v3:** allow optional spec for `[@param](https://github.com/param).*` shortcut decorators ([4f155a4](https://github.com/strongloop/loopback-next/commit/4f155a4))





# [1.8.0](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@1.7.0...@loopback/openapi-v3@1.8.0) (2019-07-17)


### Features

* **repository-json-schema:** add an option to exclude properties from schema ([53ac940](https://github.com/strongloop/loopback-next/commit/53ac940))





# [1.7.0](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@1.6.4...@loopback/openapi-v3@1.7.0) (2019-06-28)


### Features

* **openapi-v3:** remove dependency on openapi-v3-types ([4c2096c](https://github.com/strongloop/loopback-next/commit/4c2096c))





## [1.6.4](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@1.6.3...@loopback/openapi-v3@1.6.4) (2019-06-21)

**Note:** Version bump only for package @loopback/openapi-v3





## [1.6.3](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@1.6.2...@loopback/openapi-v3@1.6.3) (2019-06-20)

**Note:** Version bump only for package @loopback/openapi-v3





## [1.6.2](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@1.6.1...@loopback/openapi-v3@1.6.2) (2019-06-17)

**Note:** Version bump only for package @loopback/openapi-v3





## [1.6.1](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@1.6.0...@loopback/openapi-v3@1.6.1) (2019-06-06)

**Note:** Version bump only for package @loopback/openapi-v3





# [1.6.0](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@1.5.1...@loopback/openapi-v3@1.6.0) (2019-06-03)


### Features

* replace tslint with eslint ([44185a7](https://github.com/strongloop/loopback-next/commit/44185a7))





## [1.5.1](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@1.5.0...@loopback/openapi-v3@1.5.1) (2019-05-31)

**Note:** Version bump only for package @loopback/openapi-v3





# [1.5.0](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@1.4.0...@loopback/openapi-v3@1.5.0) (2019-05-30)


### Features

* helpers for building JSON/OpenAPI schema referencing shared definitions ([bf07ff9](https://github.com/strongloop/loopback-next/commit/bf07ff9))





# [1.4.0](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@1.3.11...@loopback/openapi-v3@1.4.0) (2019-05-23)


### Features

* **openapi-v3:** allow controller to reference models via openapispec ([d57f272](https://github.com/strongloop/loopback-next/commit/d57f272))





## [1.3.11](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@1.3.10...@loopback/openapi-v3@1.3.11) (2019-05-14)

**Note:** Version bump only for package @loopback/openapi-v3





## [1.3.10](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@1.3.9...@loopback/openapi-v3@1.3.10) (2019-05-10)

**Note:** Version bump only for package @loopback/openapi-v3





## [1.3.9](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@1.3.8...@loopback/openapi-v3@1.3.9) (2019-05-09)

**Note:** Version bump only for package @loopback/openapi-v3





## [1.3.8](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@1.3.7...@loopback/openapi-v3@1.3.8) (2019-05-06)

**Note:** Version bump only for package @loopback/openapi-v3





## [1.3.7](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@1.3.6...@loopback/openapi-v3@1.3.7) (2019-04-26)

**Note:** Version bump only for package @loopback/openapi-v3





## [1.3.6](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@1.3.5...@loopback/openapi-v3@1.3.6) (2019-04-20)

**Note:** Version bump only for package @loopback/openapi-v3





## [1.3.5](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@1.3.4...@loopback/openapi-v3@1.3.5) (2019-04-11)

**Note:** Version bump only for package @loopback/openapi-v3





## [1.3.4](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@1.3.3...@loopback/openapi-v3@1.3.4) (2019-04-09)

**Note:** Version bump only for package @loopback/openapi-v3





## [1.3.3](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@1.3.2...@loopback/openapi-v3@1.3.3) (2019-04-05)

**Note:** Version bump only for package @loopback/openapi-v3





## [1.3.2](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@1.3.1...@loopback/openapi-v3@1.3.2) (2019-03-22)

**Note:** Version bump only for package @loopback/openapi-v3





## [1.3.1](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@1.3.0...@loopback/openapi-v3@1.3.1) (2019-03-22)

**Note:** Version bump only for package @loopback/openapi-v3





# [1.3.0](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@1.2.3...@loopback/openapi-v3@1.3.0) (2019-03-12)


### Features

* **openapi-v3:** add operationId based on controller/method names ([89f905b](https://github.com/strongloop/loopback-next/commit/89f905b))





## [1.2.3](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@1.2.2...@loopback/openapi-v3@1.2.3) (2019-03-01)

**Note:** Version bump only for package @loopback/openapi-v3





## [1.2.2](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@1.2.1...@loopback/openapi-v3@1.2.2) (2019-02-25)

**Note:** Version bump only for package @loopback/openapi-v3





## [1.2.1](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@1.2.0...@loopback/openapi-v3@1.2.1) (2019-02-08)


### Bug Fixes

* update to the most recent lodash version ([65ee865](https://github.com/strongloop/loopback-next/commit/65ee865))





# [1.2.0](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@1.1.7...@loopback/openapi-v3@1.2.0) (2019-01-28)


### Features

* **repository-json-schema:** enumerate fields ([15ca819](https://github.com/strongloop/loopback-next/commit/15ca819))





## [1.1.7](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@1.1.6...@loopback/openapi-v3@1.1.7) (2019-01-15)

**Note:** Version bump only for package @loopback/openapi-v3





## [1.1.6](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@1.1.5...@loopback/openapi-v3@1.1.6) (2019-01-14)


### Bug Fixes

* rework tslint comments disabling "no-unused-variable" rule ([a18a3d7](https://github.com/strongloop/loopback-next/commit/a18a3d7))





## [1.1.5](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@1.1.4...@loopback/openapi-v3@1.1.5) (2018-12-20)

**Note:** Version bump only for package @loopback/openapi-v3





## [1.1.4](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@1.1.3...@loopback/openapi-v3@1.1.4) (2018-12-13)

**Note:** Version bump only for package @loopback/openapi-v3





## [1.1.3](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@1.1.2...@loopback/openapi-v3@1.1.3) (2018-11-26)

**Note:** Version bump only for package @loopback/openapi-v3





## [1.1.2](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@1.1.1...@loopback/openapi-v3@1.1.2) (2018-11-17)


### Bug Fixes

* **repository:** make sure model definition is built correctly ([2effa30](https://github.com/strongloop/loopback-next/commit/2effa30))





## [1.1.1](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@1.1.0...@loopback/openapi-v3@1.1.1) (2018-11-14)

**Note:** Version bump only for package @loopback/openapi-v3





<a name="1.1.0"></a>
# [1.1.0](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@1.0.1...@loopback/openapi-v3@1.1.0) (2018-11-08)


### Bug Fixes

* **openapi-v3:** generate schemas for x-ts-type ([07f0d6c](https://github.com/strongloop/loopback-next/commit/07f0d6c))


### Features

* **rest:** add support for form request body ([2d9e0a8](https://github.com/strongloop/loopback-next/commit/2d9e0a8))





<a name="1.0.1"></a>
## [1.0.1](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@1.0.0...@loopback/openapi-v3@1.0.1) (2018-10-17)

**Note:** Version bump only for package @loopback/openapi-v3





<a name="0.15.6"></a>
## [0.15.6](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@0.15.5...@loopback/openapi-v3@0.15.6) (2018-10-08)

**Note:** Version bump only for package @loopback/openapi-v3





<a name="0.15.5"></a>
## [0.15.5](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@0.15.4...@loopback/openapi-v3@0.15.5) (2018-10-06)

**Note:** Version bump only for package @loopback/openapi-v3





<a name="0.15.4"></a>
## [0.15.4](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@0.15.3...@loopback/openapi-v3@0.15.4) (2018-10-05)

**Note:** Version bump only for package @loopback/openapi-v3





<a name="0.15.3"></a>
## [0.15.3](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@0.15.2...@loopback/openapi-v3@0.15.3) (2018-10-03)

**Note:** Version bump only for package @loopback/openapi-v3





<a name="0.15.2"></a>
## [0.15.2](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@0.15.1...@loopback/openapi-v3@0.15.2) (2018-09-28)

**Note:** Version bump only for package @loopback/openapi-v3





<a name="0.15.1"></a>
## [0.15.1](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@0.15.0...@loopback/openapi-v3@0.15.1) (2018-09-27)

**Note:** Version bump only for package @loopback/openapi-v3





<a name="0.15.0"></a>
# [0.15.0](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@0.14.4...@loopback/openapi-v3@0.15.0) (2018-09-25)


### Features

* builders for Filter and Where schemas ([ca8d96e](https://github.com/strongloop/loopback-next/commit/ca8d96e))
* support built-in JavaScript/Node schema types ([d65a17f](https://github.com/strongloop/loopback-next/commit/d65a17f))





<a name="0.14.4"></a>
## [0.14.4](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@0.14.3...@loopback/openapi-v3@0.14.4) (2018-09-21)

**Note:** Version bump only for package @loopback/openapi-v3





<a name="0.14.3"></a>
## [0.14.3](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@0.14.2...@loopback/openapi-v3@0.14.3) (2018-09-19)

**Note:** Version bump only for package @loopback/openapi-v3





<a name="0.14.2"></a>
## [0.14.2](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@0.14.1...@loopback/openapi-v3@0.14.2) (2018-09-14)

**Note:** Version bump only for package @loopback/openapi-v3





<a name="0.14.1"></a>
## [0.14.1](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@0.14.0...@loopback/openapi-v3@0.14.1) (2018-09-14)

**Note:** Version bump only for package @loopback/openapi-v3





<a name="0.14.0"></a>
# [0.14.0](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@0.13.2...@loopback/openapi-v3@0.14.0) (2018-09-14)


### Features

* **openapi-v3:** add support for openapi responses ([0ecaecd](https://github.com/strongloop/loopback-next/commit/0ecaecd))





<a name="0.13.2"></a>
## [0.13.2](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@0.13.1...@loopback/openapi-v3@0.13.2) (2018-09-12)

**Note:** Version bump only for package @loopback/openapi-v3





<a name="0.13.1"></a>
## [0.13.1](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@0.13.0...@loopback/openapi-v3@0.13.1) (2018-09-10)

**Note:** Version bump only for package @loopback/openapi-v3





<a name="0.13.0"></a>
# [0.13.0](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@0.12.6...@loopback/openapi-v3@0.13.0) (2018-09-08)


### Features

* coerce object arguments from query strings ([d095693](https://github.com/strongloop/loopback-next/commit/d095693))





<a name="0.12.6"></a>
## [0.12.6](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@0.12.5...@loopback/openapi-v3@0.12.6) (2018-08-25)

**Note:** Version bump only for package @loopback/openapi-v3





<a name="0.12.5"></a>
## [0.12.5](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@0.12.4...@loopback/openapi-v3@0.12.5) (2018-08-24)


### Bug Fixes

* **openapi-v3:** set required to true for path parameters ([2b13247](https://github.com/strongloop/loopback-next/commit/2b13247))





<a name="0.12.4"></a>
## [0.12.4](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@0.12.3...@loopback/openapi-v3@0.12.4) (2018-08-15)




**Note:** Version bump only for package @loopback/openapi-v3

<a name="0.12.3"></a>
## [0.12.3](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@0.12.2...@loopback/openapi-v3@0.12.3) (2018-08-08)




**Note:** Version bump only for package @loopback/openapi-v3

<a name="0.12.2"></a>
## [0.12.2](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@0.12.1...@loopback/openapi-v3@0.12.2) (2018-07-21)




**Note:** Version bump only for package @loopback/openapi-v3

<a name="0.12.1"></a>
## [0.12.1](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@0.12.0...@loopback/openapi-v3@0.12.1) (2018-07-20)




**Note:** Version bump only for package @loopback/openapi-v3

<a name="0.12.0"></a>
# [0.12.0](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@0.11.3...@loopback/openapi-v3@0.12.0) (2018-07-20)




**Note:** Version bump only for package @loopback/openapi-v3

<a name="0.11.3"></a>
## [0.11.3](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@0.11.2...@loopback/openapi-v3@0.11.3) (2018-07-13)




**Note:** Version bump only for package @loopback/openapi-v3

<a name="0.11.2"></a>
## [0.11.2](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@0.11.1...@loopback/openapi-v3@0.11.2) (2018-07-11)




**Note:** Version bump only for package @loopback/openapi-v3

<a name="0.11.1"></a>
## [0.11.1](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@0.11.0...@loopback/openapi-v3@0.11.1) (2018-07-10)




**Note:** Version bump only for package @loopback/openapi-v3

<a name="0.11.0"></a>
# [0.11.0](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@0.10.12...@loopback/openapi-v3@0.11.0) (2018-07-09)


### Bug Fixes

* generate schema for requestBody only if not present ([caf66c2](https://github.com/strongloop/loopback-next/commit/caf66c2))


### Features

* body validation ([d284ad8](https://github.com/strongloop/loopback-next/commit/d284ad8))




<a name="0.10.12"></a>
## [0.10.12](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@0.10.11...@loopback/openapi-v3@0.10.12) (2018-06-28)




**Note:** Version bump only for package @loopback/openapi-v3

<a name="0.10.11"></a>
## [0.10.11](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@0.10.10...@loopback/openapi-v3@0.10.11) (2018-06-27)




**Note:** Version bump only for package @loopback/openapi-v3

<a name="0.10.10"></a>
## [0.10.10](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@0.10.9...@loopback/openapi-v3@0.10.10) (2018-06-20)




**Note:** Version bump only for package @loopback/openapi-v3

<a name="0.10.9"></a>
## [0.10.9](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@0.10.8...@loopback/openapi-v3@0.10.9) (2018-06-11)




**Note:** Version bump only for package @loopback/openapi-v3

<a name="0.10.8"></a>
## [0.10.8](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@0.10.6...@loopback/openapi-v3@0.10.8) (2018-06-09)




**Note:** Version bump only for package @loopback/openapi-v3

<a name="0.10.7"></a>
## [0.10.7](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@0.10.6...@loopback/openapi-v3@0.10.7) (2018-06-09)




**Note:** Version bump only for package @loopback/openapi-v3

<a name="0.10.6"></a>
## [0.10.6](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@0.10.5...@loopback/openapi-v3@0.10.6) (2018-06-08)


### Bug Fixes

* make the code compatible with TypeScript 2.9.x ([37aba50](https://github.com/strongloop/loopback-next/commit/37aba50))




<a name="0.10.5"></a>
## [0.10.5](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@0.10.4...@loopback/openapi-v3@0.10.5) (2018-05-28)




**Note:** Version bump only for package @loopback/openapi-v3

<a name="0.10.4"></a>
## [0.10.4](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@0.10.3...@loopback/openapi-v3@0.10.4) (2018-05-20)




**Note:** Version bump only for package @loopback/openapi-v3

<a name="0.10.3"></a>
## [0.10.3](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@0.10.2...@loopback/openapi-v3@0.10.3) (2018-05-14)


### Bug Fixes

* change index.d.ts files to point to dist8 ([42ca42d](https://github.com/strongloop/loopback-next/commit/42ca42d))




<a name="0.10.2"></a>
## [0.10.2](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@0.10.1...@loopback/openapi-v3@0.10.2) (2018-05-14)




**Note:** Version bump only for package @loopback/openapi-v3

<a name="0.10.1"></a>
## [0.10.1](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@0.10.0...@loopback/openapi-v3@0.10.1) (2018-05-08)




**Note:** Version bump only for package @loopback/openapi-v3

<a name="0.10.0"></a>
# [0.10.0](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@0.8.1...@loopback/openapi-v3@0.10.0) (2018-05-03)


### Features

* add helper package "dist-util" ([532f153](https://github.com/strongloop/loopback-next/commit/532f153))




<a name="0.9.0"></a>
# [0.9.0](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@0.8.1...@loopback/openapi-v3@0.9.0) (2018-05-03)


### Features

* add helper package "dist-util" ([532f153](https://github.com/strongloop/loopback-next/commit/532f153))




<a name="0.8.1"></a>
## [0.8.1](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@0.8.0...@loopback/openapi-v3@0.8.1) (2018-04-26)




**Note:** Version bump only for package @loopback/openapi-v3

<a name="0.8.0"></a>
# [0.8.0](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@0.7.0...@loopback/openapi-v3@0.8.0) (2018-04-25)


### Features

* upgrade to openapi3-ts@0.11.0 ([1ed79c9](https://github.com/strongloop/loopback-next/commit/1ed79c9))




<a name="0.7.0"></a>
# [0.7.0](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@0.6.0...@loopback/openapi-v3@0.7.0) (2018-04-16)




**Note:** Version bump only for package @loopback/openapi-v3

<a name="0.6.0"></a>
# [0.6.0](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@0.5.5...@loopback/openapi-v3@0.6.0) (2018-04-12)


### Features

* **metadata:** add strongly-typed metadata accessors ([45f9f80](https://github.com/strongloop/loopback-next/commit/45f9f80))




<a name="0.5.5"></a>
## [0.5.5](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@0.5.4...@loopback/openapi-v3@0.5.5) (2018-04-11)




**Note:** Version bump only for package @loopback/openapi-v3

<a name="0.5.4"></a>
## [0.5.4](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@0.5.2...@loopback/openapi-v3@0.5.4) (2018-04-11)


### Bug Fixes

* change file names to fit advocated naming convention ([0331df8](https://github.com/strongloop/loopback-next/commit/0331df8))




<a name="0.5.3"></a>
## [0.5.3](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@0.5.2...@loopback/openapi-v3@0.5.3) (2018-04-06)




**Note:** Version bump only for package @loopback/openapi-v3

<a name="0.5.2"></a>
## [0.5.2](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@0.5.1...@loopback/openapi-v3@0.5.2) (2018-04-04)




**Note:** Version bump only for package @loopback/openapi-v3

<a name="0.5.1"></a>
## [0.5.1](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@0.5.0...@loopback/openapi-v3@0.5.1) (2018-04-02)




**Note:** Version bump only for package @loopback/openapi-v3

<a name="0.5.0"></a>
# [0.5.0](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@0.4.1...@loopback/openapi-v3@0.5.0) (2018-03-29)


### Bug Fixes

* **metadata:** refine clone of decoration spec ([544052e](https://github.com/strongloop/loopback-next/commit/544052e))


### BREAKING CHANGES

* **metadata:** instances of user-defined classes are not cloned any more.

See https://github.com/strongloop/loopback-next/issues/1182. The root
cause is that DataSource instances are cloned incorrectly.




<a name="0.4.1"></a>
## [0.4.1](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@0.4.0...@loopback/openapi-v3@0.4.1) (2018-03-23)




**Note:** Version bump only for package @loopback/openapi-v3

<a name="0.4.0"></a>
# [0.4.0](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@0.3.3...@loopback/openapi-v3@0.4.0) (2018-03-21)




**Note:** Version bump only for package @loopback/openapi-v3

<a name="0.3.3"></a>
## [0.3.3](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@0.3.2...@loopback/openapi-v3@0.3.3) (2018-03-14)




**Note:** Version bump only for package @loopback/openapi-v3

<a name="0.3.2"></a>
## [0.3.2](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@0.3.1...@loopback/openapi-v3@0.3.2) (2018-03-13)




**Note:** Version bump only for package @loopback/openapi-v3

<a name="0.3.1"></a>
## [0.3.1](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@0.3.0...@loopback/openapi-v3@0.3.1) (2018-03-08)




**Note:** Version bump only for package @loopback/openapi-v3

<a name="0.3.0"></a>
# [0.3.0](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@0.2.0...@loopback/openapi-v3@0.3.0) (2018-03-06)


### Bug Fixes

* fix typo of `additional` ([2fd7610](https://github.com/strongloop/loopback-next/commit/2fd7610))


### Features

* upgrade from swagger 2 to openapi 3 ([71e5af1](https://github.com/strongloop/loopback-next/commit/71e5af1))




<a name="0.2.0"></a>
# [0.2.0](https://github.com/strongloop/loopback-next/compare/@loopback/openapi-v3@0.1.1...@loopback/openapi-v3@0.2.0) (2018-03-01)




**Note:** Version bump only for package @loopback/openapi-v3

<a name="0.1.1"></a>
## 0.1.1 (2018-03-01)


### Features

* add openapi-v3 ([#1046](https://github.com/strongloop/loopback-next/issues/1046)) ([45a4bdf](https://github.com/strongloop/loopback-next/commit/45a4bdf))
