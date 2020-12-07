# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [9.1.1](https://github.com/strongloop/loopback-next/compare/@loopback/rest@9.1.0...@loopback/rest@9.1.1) (2020-12-07)


### Bug Fixes

* **rest:** fix incomplete hostname in regexp ([dd5c210](https://github.com/strongloop/loopback-next/commit/dd5c210c6ce1c74f27b3ac4a95d3a311ffcfe582))





# [9.1.0](https://github.com/strongloop/loopback-next/compare/@loopback/rest@9.0.0...@loopback/rest@9.1.0) (2020-11-18)


### Features

* **express:** set up MIDDLEWARE_CONTEXT for request object in constructor ([e086e7b](https://github.com/strongloop/loopback-next/commit/e086e7bcf64a8aa651490784502adfe787156eef))





# [9.0.0](https://github.com/strongloop/loopback-next/compare/@loopback/rest@8.0.0...@loopback/rest@9.0.0) (2020-11-05)


### Bug Fixes

* allow array query parameter for a single value ([08c4a1a](https://github.com/strongloop/loopback-next/commit/08c4a1a2046db606fa28b17410c19bf609abddb6))


### Code Refactoring

* **rest:** use dynamic value provider for actions ([3a32290](https://github.com/strongloop/loopback-next/commit/3a322902bd47f664efcb0c14c4de96133301672c))


### Features

* **rest:** further sanitize json parsing by rejecting prohibited keys ([b38f0fd](https://github.com/strongloop/loopback-next/commit/b38f0fda4c1c78339de5f02c2f42bbfce32113c9))
* **rest:** reword the message printed by REST LogError action ([3fc2bc1](https://github.com/strongloop/loopback-next/commit/3fc2bc1ecdd8efe1747050a63dbfefac7216e476))


### BREAKING CHANGES

* **rest:** Message printed by REST LogError action changed from
`Unhandled error` to `Request failed`. Message pattern rules
(e.g. alerting rules) based on this pattern need to be updated accordingly.
* **rest:** If you use one of the built-in action providers as the base
class, this commit will break you as the signature of the base class has
changed. Otherwise the code should be backward compatible for existing
applications.





# [8.0.0](https://github.com/strongloop/loopback-next/compare/@loopback/rest@7.0.1...@loopback/rest@8.0.0) (2020-10-07)


### Features

* **context:** introduce new binding scopes ([9916cfd](https://github.com/strongloop/loopback-next/commit/9916cfd4449a870f7a3378e2e674957aed7c1626))
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





## [7.0.1](https://github.com/strongloop/loopback-next/compare/@loopback/rest@7.0.0...@loopback/rest@7.0.1) (2020-09-17)

**Note:** Version bump only for package @loopback/rest





# [7.0.0](https://github.com/strongloop/loopback-next/compare/@loopback/rest@6.2.0...@loopback/rest@7.0.0) (2020-09-15)


### Bug Fixes

* **rest:** do not override customized openapi spec info object ([acae2a3](https://github.com/strongloop/loopback-next/commit/acae2a39d6ede327a1c1af53d33bd9e4c23b9626))
* **rest:** make sure OpenAPI parameters with simple types are validated by AJV ([987c103](https://github.com/strongloop/loopback-next/commit/987c1033a7ff28e4f2b9188a854c6479ed2365f9))


### Features

* **rest:** use sington binding scope to cache REST middleware ([5783f54](https://github.com/strongloop/loopback-next/commit/5783f5471e1e16aface22d8db4d300366f6b06d3))
* move framework packages to `devDependencies` ([e2c61ce](https://github.com/strongloop/loopback-next/commit/e2c61ce79aa68d76f6e7138642034160b50063f0))
* **rest:** add AJV formats for OpenAPI spec data type formats ([3f2ccbf](https://github.com/strongloop/loopback-next/commit/3f2ccbf98c8cca92666c9a9931ad741d274a76b6))
* **rest:** expose RequestContext to Express request object ([50448cb](https://github.com/strongloop/loopback-next/commit/50448cb215cc94b8bd2459d7f9487aa03149fe3d))


### BREAKING CHANGES

* components no longer install core framework packages as
their own dependencies, they use the framework packages provided by the
target application instead.

If you are getting `npm install` errors after upgrade, then make sure
your project lists all dependencies required by the extensions you are
using.





# [6.2.0](https://github.com/strongloop/loopback-next/compare/@loopback/rest@6.1.0...@loopback/rest@6.2.0) (2020-08-27)


### Features

* **rest:** add more debugging statements for middleware ([de2f5be](https://github.com/strongloop/loopback-next/commit/de2f5bee6415d55c53ca14cdf989cb37b06c7f47))
* **rest:** improve route description to include verb and path ([3b7fcca](https://github.com/strongloop/loopback-next/commit/3b7fccafa57cfb7fd2ee1495dc81dbc87ab6e94e))
* **rest:** make sure rest options are passed to http-server ([e9af196](https://github.com/strongloop/loopback-next/commit/e9af1961dfe2aaae3c07e3100f6fe538797943e0))





# [6.1.0](https://github.com/strongloop/loopback-next/compare/@loopback/rest@6.0.0...@loopback/rest@6.1.0) (2020-08-19)


### Bug Fixes

* **repository:** apply `[@model](https://github.com/model)` to generated model class ([9a1b1e4](https://github.com/strongloop/loopback-next/commit/9a1b1e4324516bc1351e08943b8b0c5a00e75992))


### Features

* **express:** add middleware view to watch registered middleware ([205d948](https://github.com/strongloop/loopback-next/commit/205d948cb91cf48d187ce247ee5e77b1204be35e))
* **rest:** add the ability to validate sorted middleware groups ([227dbf8](https://github.com/strongloop/loopback-next/commit/227dbf8045990536ac1437ea4a7ae1f1a1e571bb))
* **rest:** improve validation errors for invalid parameter value ([54f762c](https://github.com/strongloop/loopback-next/commit/54f762c845912b45811f6481518a100f10c5e1e6))
* **rest:** optimize middleware sequence to reuse middleware binding keys ([0041a24](https://github.com/strongloop/loopback-next/commit/0041a246df89f7dbff179ed7c5e08a65ec5bcbda))





# [6.0.0](https://github.com/strongloop/loopback-next/compare/@loopback/rest@5.2.1...@loopback/rest@6.0.0) (2020-08-05)


### Bug Fixes

* **rest:** code block in interface apidoc ([1f79de5](https://github.com/strongloop/loopback-next/commit/1f79de56fed717b85da996c0cdc23da6214f4410))
* **rest:** preserve the bound value for API_SPCE binding from api() ([18fedf3](https://github.com/strongloop/loopback-next/commit/18fedf37fe3db266e9222191e20e1bf6fdcaa8ec))
* **rest:** register component for apispec ([7ac2081](https://github.com/strongloop/loopback-next/commit/7ac208153b5986fc346d81a410c18ec97c223b2e))
* enable default AJV custom validation and error messages ([d7c385e](https://github.com/strongloop/loopback-next/commit/d7c385ee24f14e187655a68e2a08cff68c5142a9))


### Features

* **rest:** add a note to mention the middleware-based sequence ([8d06f62](https://github.com/strongloop/loopback-next/commit/8d06f62ce66a258d62b2d42febbd947c186b73f0))
* **rest:** add middleware for REST actions and MiddlewareSequence ([80b667c](https://github.com/strongloop/loopback-next/commit/80b667c3592bcbd5c835854ddffde97c7e66fac4))


### BREAKING CHANGES

* **rest:** A middleware-based sequence has been introduced to have
a middleware chain with discovered middleware to process REST requests
and responses. The action-based sequence is kept for backward compatibility.
Please check out https://loopback.io/doc/en/lb4/Sequence.html for more details.





## [5.2.1](https://github.com/strongloop/loopback-next/compare/@loopback/rest@5.2.0...@loopback/rest@5.2.1) (2020-07-20)


### Bug Fixes

* ensure delete only applies to optional properties ([89cd43f](https://github.com/strongloop/loopback-next/commit/89cd43f1a455983f120d9bb9c869eac36adc7ad7))
* nested scope filter ([b29d6d7](https://github.com/strongloop/loopback-next/commit/b29d6d7938b0d07e927b0939745b76cfff91272b))
* **repository-json-schema:** added type 'object' to model json schema ([5c5f9ef](https://github.com/strongloop/loopback-next/commit/5c5f9efcfdea7788503d74610e7ce64f31abc7cd)), closes [#3804](https://github.com/strongloop/loopback-next/issues/3804)





# [5.2.0](https://github.com/strongloop/loopback-next/compare/@loopback/rest@5.1.2...@loopback/rest@5.2.0) (2020-06-30)


### Bug Fixes

* **rest:** fix typing to be compatible with latest @types/js-yaml ([5ac39e4](https://github.com/strongloop/loopback-next/commit/5ac39e44827ef74c9d2bccb1797a9da125c249e3))


### Features

* coerce query object with schema ([ccea25f](https://github.com/strongloop/loopback-next/commit/ccea25fc382457f9436adfc0d8f6ce3a2d029c5e))
* **rest:** expose types from strong-error-handler ([b6f5595](https://github.com/strongloop/loopback-next/commit/b6f559549518c839a2898f1b968fc6a7901a6c6b))





## [5.1.2](https://github.com/strongloop/loopback-next/compare/@loopback/rest@5.1.1...@loopback/rest@5.1.2) (2020-06-23)


### Bug Fixes

* set node version to >=10.16 to support events.once ([e39da1c](https://github.com/strongloop/loopback-next/commit/e39da1ca47728eafaf83c10ce35b09b03b6a4edc))





## [5.1.1](https://github.com/strongloop/loopback-next/compare/@loopback/rest@5.1.0...@loopback/rest@5.1.1) (2020-06-11)

**Note:** Version bump only for package @loopback/rest





# [5.1.0](https://github.com/strongloop/loopback-next/compare/@loopback/rest@5.0.1...@loopback/rest@5.1.0) (2020-05-28)


### Features

* **rest:** add `exportOpenAPISpec` to export the OpenAPI spec to a file ([6e669f6](https://github.com/strongloop/loopback-next/commit/6e669f62ec6b87d3e857f57787bc694cc7af47ac))





## [5.0.1](https://github.com/strongloop/loopback-next/compare/@loopback/rest@5.0.0...@loopback/rest@5.0.1) (2020-05-20)

**Note:** Version bump only for package @loopback/rest





# [5.0.0](https://github.com/strongloop/loopback-next/compare/@loopback/rest@4.0.0...@loopback/rest@5.0.0) (2020-05-19)


### Bug Fixes

* **rest:** check if the middleware chain has already produce a response ([be290dc](https://github.com/strongloop/loopback-next/commit/be290dc7088eddeecd79288ccb6c70f4da9956fd))
* use unknown type for err argument for Express hander ([b13b338](https://github.com/strongloop/loopback-next/commit/b13b3386a06332b71b33a64f5bc2ab9b4544cc8a))


### Features

* **openapi-v3:** relax `[@api](https://github.com/api)` to make `paths` optional with `{}` as the default ([ef3c415](https://github.com/strongloop/loopback-next/commit/ef3c4151efb2c88daa2b5abb37c6086b91860c92))
* **rest:** remove bindElement and getFromContext ([d6d830f](https://github.com/strongloop/loopback-next/commit/d6d830f8161fbb408f75df69402144dc2ca7cc48))


### BREAKING CHANGES

* **rest:** usage of `BindElement` and `GetFromContext` should be
replaced with `@inject.setter`, `@inject.binding`, and `@inject.getter`.

See https://loopback.io/doc/en/lb4/Decorators_inject.html





# [4.0.0](https://github.com/strongloop/loopback-next/compare/@loopback/rest@3.3.2...@loopback/rest@4.0.0) (2020-05-07)


### Features

* **rest:** use @loopback/express for sequence, cors, and OpenAPI spec ([19e2510](https://github.com/strongloop/loopback-next/commit/19e25107da7eaadcdf29a04b2bb295d51555a050))


### BREAKING CHANGES

* **rest:** `basePath` now also applies to endpoints that serve OpenAPI
specs. For example, the OpenAPI specs are available at `/api/openapi.json`
or `/api/openapi.yaml` if the base path is set to `/api`.





## [3.3.2](https://github.com/strongloop/loopback-next/compare/@loopback/rest@3.3.1...@loopback/rest@3.3.2) (2020-04-29)

**Note:** Version bump only for package @loopback/rest





## [3.3.1](https://github.com/strongloop/loopback-next/compare/@loopback/rest@3.3.0...@loopback/rest@3.3.1) (2020-04-23)

**Note:** Version bump only for package @loopback/rest





# [3.3.0](https://github.com/strongloop/loopback-next/compare/@loopback/rest@3.2.1...@loopback/rest@3.3.0) (2020-04-22)


### Features

* **rest:** ensure OpenAPI spec components are merged ([2efa27b](https://github.com/strongloop/loopback-next/commit/2efa27b283d86258fe705914c557536abaf2c435))
* migrate loopback-example-passport repo as lb4 example ([dd3c328](https://github.com/strongloop/loopback-next/commit/dd3c328a138621bb3f6ae770b4db83ba21ecc2d6))
* update package.json and .travis.yml for builds ([cb2b8e6](https://github.com/strongloop/loopback-next/commit/cb2b8e6a18616dda7783c0193091039d4e608131))
* **rest:** add openapi schema consolidation ([6a039ed](https://github.com/strongloop/loopback-next/commit/6a039edd4e056089bca8cf2acd4ed7ddab55d55e))





## [3.2.1](https://github.com/strongloop/loopback-next/compare/@loopback/rest@3.2.0...@loopback/rest@3.2.1) (2020-04-11)

**Note:** Version bump only for package @loopback/rest





# [3.2.0](https://github.com/strongloop/loopback-next/compare/@loopback/rest@3.1.0...@loopback/rest@3.2.0) (2020-04-08)


### Bug Fixes

* passport strategy adapter must support oauth2 flows ([67c2f02](https://github.com/strongloop/loopback-next/commit/67c2f02f74c08ee037827c0045e1f225d6ca8ede))


### Features

* **rest:** improve Ajv validation to allow extensions of keywords and formats ([afdee34](https://github.com/strongloop/loopback-next/commit/afdee346f5b56932d59ff600478116b75eac797d))
* **rest:** use the description field in Openapi ([4ca321c](https://github.com/strongloop/loopback-next/commit/4ca321c01a128b14dcbc5336901899ee61ff1460))
* support any type ([03ce221](https://github.com/strongloop/loopback-next/commit/03ce221bb41a2ecd296ba235fe342d488fa2d639))





# [3.1.0](https://github.com/strongloop/loopback-next/compare/@loopback/rest@3.0.1...@loopback/rest@3.1.0) (2020-03-24)


### Bug Fixes

* **rest:** allow async custom keyword by setting {$async: true} to referenced schemas ([ede4bbd](https://github.com/strongloop/loopback-next/commit/ede4bbdba4d0bca3a558309118bc97924f48fd6e))
* update package locks ([cd2f6fa](https://github.com/strongloop/loopback-next/commit/cd2f6fa7a732afe4a16f4ccf8316ff3142959fe8))


### Features

* **rest:** add info spec enhancer to build `info` for OpenAPI spec from application metadata ([a440ae2](https://github.com/strongloop/loopback-next/commit/a440ae248f8a51abb573ee3f1246be82e1d38817))





## [3.0.1](https://github.com/strongloop/loopback-next/compare/@loopback/rest@3.0.0...@loopback/rest@3.0.1) (2020-03-17)

**Note:** Version bump only for package @loopback/rest





# [3.0.0](https://github.com/strongloop/loopback-next/compare/@loopback/rest@2.0.0...@loopback/rest@3.0.0) (2020-03-05)


### Bug Fixes

* **cli:** extract messages for generators ([2f572bd](https://github.com/strongloop/loopback-next/commit/2f572bd75883420e38bfaa780bc38445aec92e65))
* **rest:** improves error handling for express middleware ([02d0c91](https://github.com/strongloop/loopback-next/commit/02d0c91abb97830fd8652dde69ac4153720f3e75))


### chore

* remove support for Node.js v8.x ([4281d9d](https://github.com/strongloop/loopback-next/commit/4281d9df50f0715d32879e1442a90b643ec8f542))


### Code Refactoring

* **rest:** make getApiSpec() async ([fe3df1b](https://github.com/strongloop/loopback-next/commit/fe3df1b85904ee8b8a005fa6eddf150d28ad2a08))


### Features

* **rest:** add async validation support ([5b9a1ef](https://github.com/strongloop/loopback-next/commit/5b9a1efe03a9728dc707eb050c24b0ac7e23a1ec))
* **rest:** add openapi enhancer service ([62d55eb](https://github.com/strongloop/loopback-next/commit/62d55ebd956910cbb487611673f21ec7088f3dcc)), closes [#4380](https://github.com/strongloop/loopback-next/issues/4380)
* **rest:** add support for ajv-errors ([d151475](https://github.com/strongloop/loopback-next/commit/d151475d8fc91b4b02e0067c1db7069620143dd2))
* **rest:** allow controllers/routes to be added/removed after server is started ([b604563](https://github.com/strongloop/loopback-next/commit/b6045636885268d9ea5d31287351ddbf0da53a7c))
* add `tslib` as dependency ([a6e0b4c](https://github.com/strongloop/loopback-next/commit/a6e0b4ce7b862764167cefedee14c1115b25e0a4)), closes [#4676](https://github.com/strongloop/loopback-next/issues/4676)
* **rest:** bind controller routes to the context ([a645b17](https://github.com/strongloop/loopback-next/commit/a645b17d0338e56f8182437d6ade20f27577203d))
* **rest:** fixed AjvErrorOptions type & added test for ajvErrors: Object ([aa711d0](https://github.com/strongloop/loopback-next/commit/aa711d068b476292cdf27f673228746d21999c52))


### BREAKING CHANGES

* **rest:** Api specifications are now emitted as a Promise instead
of a value object.  Calls to getApiSpec function must switch from
the old style to new style as follows:

1. Old style

```ts
function() {
  // ...
  const spec = restApp.restServer.getApiSpec();
  // ...
}
```

2. New style

```ts
async function() {
  // ...
  const spec = await restApp.restServer.getApiSpec();
  // ...
}
```
* **rest:** `validateRequestBody` is now an async function to allow asynchronous validations by custom Ajv keywords and formats. See https://ajv.js.org/#asynchronous-validation
for more details.
* Node.js v8.x is now end of life. Please upgrade to version
10 and above. See https://nodejs.org/en/about/releases.





# [2.0.0](https://github.com/strongloop/loopback-next/compare/@loopback/rest@1.26.1...@loopback/rest@2.0.0) (2020-02-06)


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





## [1.26.1](https://github.com/strongloop/loopback-next/compare/@loopback/rest@1.26.0...@loopback/rest@1.26.1) (2020-02-05)

**Note:** Version bump only for package @loopback/rest





# [1.26.0](https://github.com/strongloop/loopback-next/compare/@loopback/rest@1.25.1...@loopback/rest@1.26.0) (2020-01-27)


### Features

* **context:** index bindings by tag to speed up matching by tag ([566b9d9](https://github.com/strongloop/loopback-next/commit/566b9d9a35ce52d9aeefe17e36f91c9714616b21))





## [1.25.1](https://github.com/strongloop/loopback-next/compare/@loopback/rest@1.25.0...@loopback/rest@1.25.1) (2020-01-07)

**Note:** Version bump only for package @loopback/rest





# [1.25.0](https://github.com/strongloop/loopback-next/compare/@loopback/rest@1.24.0...@loopback/rest@1.25.0) (2019-12-09)


### Features

* **context:** make it possible to set source information for interceptions ([2a1ccb4](https://github.com/strongloop/loopback-next/commit/2a1ccb409a889d8b30b03ddf3284c9e9d5554e27))





# [1.24.0](https://github.com/strongloop/loopback-next/compare/@loopback/rest@1.23.0...@loopback/rest@1.24.0) (2019-11-25)


### Features

* **rest:** upgrade to path-to-regexp 6.x and improve error messages ([ad44209](https://github.com/strongloop/loopback-next/commit/ad4420954e3d3c18d4a52ca7511985d026efcdc6))





# [1.23.0](https://github.com/strongloop/loopback-next/compare/@loopback/rest@1.22.0...@loopback/rest@1.23.0) (2019-11-12)


### Bug Fixes

* **rest:** improve null check to avoid compilation errors with TypeScript 3.7 ([ab47ef6](https://github.com/strongloop/loopback-next/commit/ab47ef63adc01b170ddc537ca973da631c5a8d8f))


### Features

* **rest:** bind operation spec to the request context ([55311df](https://github.com/strongloop/loopback-next/commit/55311df23e8b4a22968b5c0edd826323538ba163))





# [1.22.0](https://github.com/strongloop/loopback-next/compare/@loopback/rest@1.21.0...@loopback/rest@1.22.0) (2019-10-24)


### Bug Fixes

* **openapi-v3:** preserve `additionalProperties: false` ([bc7691b](https://github.com/strongloop/loopback-next/commit/bc7691b0963ee297922bd4d9652a0eccf763f085))


### Features

* improve debug logs for schema generators ([da88cdf](https://github.com/strongloop/loopback-next/commit/da88cdf9c75b0ca498b86f7cd5729f78a4b160f7))
* simplify model schema with excluded properties ([b554ac8](https://github.com/strongloop/loopback-next/commit/b554ac8a08a518f112d111ebabcac48279ada7f8))





# [1.21.0](https://github.com/strongloop/loopback-next/compare/@loopback/rest@1.20.1...@loopback/rest@1.21.0) (2019-10-07)


### Features

* **rest:** add listenOnStart flag to control http listening for a rest server ([2c5a131](https://github.com/strongloop/loopback-next/commit/2c5a131))





## [1.20.1](https://github.com/strongloop/loopback-next/compare/@loopback/rest@1.20.0...@loopback/rest@1.20.1) (2019-09-28)

**Note:** Version bump only for package @loopback/rest





# [1.20.0](https://github.com/strongloop/loopback-next/compare/@loopback/rest@1.19.0...@loopback/rest@1.20.0) (2019-09-27)


### Features

* **rest:** added support for sockets and pipes to RestServer ([e48ebb8](https://github.com/strongloop/loopback-next/commit/e48ebb8))
* **rest:** allow developers to transform AJV error objects ([8c05b57](https://github.com/strongloop/loopback-next/commit/8c05b57))
* self host oas spec by default on relative path in explorer ([887556e](https://github.com/strongloop/loopback-next/commit/887556e))





# [1.19.0](https://github.com/strongloop/loopback-next/compare/@loopback/rest@1.18.1...@loopback/rest@1.19.0) (2019-09-17)


### Features

* **eslint-config:** enable "no-misused-promises" rule ([88d5494](https://github.com/strongloop/loopback-next/commit/88d5494))





## [1.18.1](https://github.com/strongloop/loopback-next/compare/@loopback/rest@1.18.0...@loopback/rest@1.18.1) (2019-09-06)

**Note:** Version bump only for package @loopback/rest





# [1.18.0](https://github.com/strongloop/loopback-next/compare/@loopback/rest@1.17.0...@loopback/rest@1.18.0) (2019-09-03)


### Bug Fixes

* make givenHttpServerConfig typing compatible with TypeScript 3.6 ([1edbc0b](https://github.com/strongloop/loopback-next/commit/1edbc0b))


### Features

* **core:** allow application to accept a parent context ([ee50007](https://github.com/strongloop/loopback-next/commit/ee50007))





# [1.17.0](https://github.com/strongloop/loopback-next/compare/@loopback/rest@1.16.8...@loopback/rest@1.17.0) (2019-08-19)


### Features

* **rest:** add support for ajv-keywords ([f7bb80d](https://github.com/strongloop/loopback-next/commit/f7bb80d))





## [1.16.8](https://github.com/strongloop/loopback-next/compare/@loopback/rest@1.16.7...@loopback/rest@1.16.8) (2019-08-15)

**Note:** Version bump only for package @loopback/rest





## [1.16.7](https://github.com/strongloop/loopback-next/compare/@loopback/rest@1.16.6...@loopback/rest@1.16.7) (2019-08-15)

**Note:** Version bump only for package @loopback/rest





## [1.16.6](https://github.com/strongloop/loopback-next/compare/@loopback/rest@1.16.5...@loopback/rest@1.16.6) (2019-07-31)

**Note:** Version bump only for package @loopback/rest





## [1.16.5](https://github.com/strongloop/loopback-next/compare/@loopback/rest@1.16.4...@loopback/rest@1.16.5) (2019-07-26)

**Note:** Version bump only for package @loopback/rest





## [1.16.4](https://github.com/strongloop/loopback-next/compare/@loopback/rest@1.16.3...@loopback/rest@1.16.4) (2019-07-17)


### Bug Fixes

* **rest:** correctly handle basePath set via basePath() API ([2118d80](https://github.com/strongloop/loopback-next/commit/2118d80))





## [1.16.3](https://github.com/strongloop/loopback-next/compare/@loopback/rest@1.16.2...@loopback/rest@1.16.3) (2019-06-28)


### Bug Fixes

* **rest:** honor options for AJV validator caching ([1fd52a3](https://github.com/strongloop/loopback-next/commit/1fd52a3))
* address violations of "no-floating-promises" rule ([0947531](https://github.com/strongloop/loopback-next/commit/0947531))





## [1.16.2](https://github.com/strongloop/loopback-next/compare/@loopback/rest@1.16.1...@loopback/rest@1.16.2) (2019-06-21)

**Note:** Version bump only for package @loopback/rest





## [1.16.1](https://github.com/strongloop/loopback-next/compare/@loopback/rest@1.16.0...@loopback/rest@1.16.1) (2019-06-20)

**Note:** Version bump only for package @loopback/rest





# [1.16.0](https://github.com/strongloop/loopback-next/compare/@loopback/rest@1.15.0...@loopback/rest@1.16.0) (2019-06-17)


### Features

* **rest:** expose request body validation options to be configurable ([00ec6df](https://github.com/strongloop/loopback-next/commit/00ec6df))
* **rest:** set nullable to true by default for AJV validations ([73ad6ad](https://github.com/strongloop/loopback-next/commit/73ad6ad))





# [1.15.0](https://github.com/strongloop/loopback-next/compare/@loopback/rest@1.14.0...@loopback/rest@1.15.0) (2019-06-06)


### Features

* **testlab:** add generic helper `skipOnTravis` ([3221d9f](https://github.com/strongloop/loopback-next/commit/3221d9f))





# [1.14.0](https://github.com/strongloop/loopback-next/compare/@loopback/rest@1.13.1...@loopback/rest@1.14.0) (2019-06-03)


### Features

* replace tslint with eslint ([44185a7](https://github.com/strongloop/loopback-next/commit/44185a7))





## [1.13.1](https://github.com/strongloop/loopback-next/compare/@loopback/rest@1.13.0...@loopback/rest@1.13.1) (2019-05-31)

**Note:** Version bump only for package @loopback/rest





# [1.13.0](https://github.com/strongloop/loopback-next/compare/@loopback/rest@1.12.0...@loopback/rest@1.13.0) (2019-05-30)


### Bug Fixes

* specify the type for handler ([9e0119d](https://github.com/strongloop/loopback-next/commit/9e0119d))


### Features

* helpers for building JSON/OpenAPI schema referencing shared definitions ([bf07ff9](https://github.com/strongloop/loopback-next/commit/bf07ff9))





# [1.12.0](https://github.com/strongloop/loopback-next/compare/@loopback/rest@1.11.2...@loopback/rest@1.12.0) (2019-05-23)


### Features

* **context:** leave local bindings and parent unchanged during close ([198af88](https://github.com/strongloop/loopback-next/commit/198af88))





## [1.11.2](https://github.com/strongloop/loopback-next/compare/@loopback/rest@1.11.1...@loopback/rest@1.11.2) (2019-05-14)

**Note:** Version bump only for package @loopback/rest





## [1.11.1](https://github.com/strongloop/loopback-next/compare/@loopback/rest@1.11.0...@loopback/rest@1.11.1) (2019-05-10)

**Note:** Version bump only for package @loopback/rest





# [1.11.0](https://github.com/strongloop/loopback-next/compare/@loopback/rest@1.10.5...@loopback/rest@1.11.0) (2019-05-09)


### Bug Fixes

* **rest:** assign all component properties to target spec ([af06b69](https://github.com/strongloop/loopback-next/commit/af06b69))


### Features

* **context:** add support for method interceptors ([293188d](https://github.com/strongloop/loopback-next/commit/293188d))





## [1.10.5](https://github.com/strongloop/loopback-next/compare/@loopback/rest@1.10.4...@loopback/rest@1.10.5) (2019-05-06)


### Bug Fixes

* **rest:** aggressive redirection to Swagger UI ([9f0d8ca](https://github.com/strongloop/loopback-next/commit/9f0d8ca))





## [1.10.4](https://github.com/strongloop/loopback-next/compare/@loopback/rest@1.10.3...@loopback/rest@1.10.4) (2019-04-26)

**Note:** Version bump only for package @loopback/rest





## [1.10.3](https://github.com/strongloop/loopback-next/compare/@loopback/rest@1.10.2...@loopback/rest@1.10.3) (2019-04-20)


### Bug Fixes

* **rest:** fix a variable in sample code for README.md ([2bad701](https://github.com/strongloop/loopback-next/commit/2bad701))





## [1.10.2](https://github.com/strongloop/loopback-next/compare/@loopback/rest@1.10.1...@loopback/rest@1.10.2) (2019-04-11)

**Note:** Version bump only for package @loopback/rest





## [1.10.1](https://github.com/strongloop/loopback-next/compare/@loopback/rest@1.10.0...@loopback/rest@1.10.1) (2019-04-09)


### Bug Fixes

* **rest:** a small typo fix in code comments ([81d19bb](https://github.com/strongloop/loopback-next/commit/81d19bb))





# [1.10.0](https://github.com/strongloop/loopback-next/compare/@loopback/rest@1.9.1...@loopback/rest@1.10.0) (2019-04-05)


### Bug Fixes

* **rest:** make sure basePath is included in RestServer.url ([705bce4](https://github.com/strongloop/loopback-next/commit/705bce4))


### Features

* **context:** pass resolution options into binding.getValue() ([705dcd5](https://github.com/strongloop/loopback-next/commit/705dcd5))
* **rest:** add mountExpressRouter ([be21cde](https://github.com/strongloop/loopback-next/commit/be21cde))





## [1.9.1](https://github.com/strongloop/loopback-next/compare/@loopback/rest@1.9.0...@loopback/rest@1.9.1) (2019-03-22)

**Note:** Version bump only for package @loopback/rest





# [1.9.0](https://github.com/strongloop/loopback-next/compare/@loopback/rest@1.8.0...@loopback/rest@1.9.0) (2019-03-22)


### Features

* **context:** honor binding scope from [@bind](https://github.com/bind) ([3b30f01](https://github.com/strongloop/loopback-next/commit/3b30f01))
* **context:** tidy up context for resolving injections of a singleton binding ([f5bf43c](https://github.com/strongloop/loopback-next/commit/f5bf43c))
* **rest:** add `requestedBaseUrl` API to RequestContext ([912bece](https://github.com/strongloop/loopback-next/commit/912bece))
* **testlab:** add dummy HTTPS config ([a32c885](https://github.com/strongloop/loopback-next/commit/a32c885))





# [1.8.0](https://github.com/strongloop/loopback-next/compare/@loopback/rest@1.7.0...@loopback/rest@1.8.0) (2019-03-12)


### Features

* **openapi-v3:** add operationId based on controller/method names ([89f905b](https://github.com/strongloop/loopback-next/commit/89f905b))
* **rest:** add strict option for routers ([c3c5dab](https://github.com/strongloop/loopback-next/commit/c3c5dab))
* **rest:** add support for redirect routes ([53bce7f](https://github.com/strongloop/loopback-next/commit/53bce7f))





# [1.7.0](https://github.com/strongloop/loopback-next/compare/@loopback/rest@1.6.0...@loopback/rest@1.7.0) (2019-03-01)


### Features

* **rest:** allow express settings to be customized ([962f1cb](https://github.com/strongloop/loopback-next/commit/962f1cb))





# [1.6.0](https://github.com/strongloop/loopback-next/compare/@loopback/rest@1.5.5...@loopback/rest@1.6.0) (2019-02-25)


### Bug Fixes

* **rest:** only return matched trie nodes with values ([669ede1](https://github.com/strongloop/loopback-next/commit/669ede1))


### Features

* **context:** introduce async context observers for bind/unbind events ([e5e5fc4](https://github.com/strongloop/loopback-next/commit/e5e5fc4))
* **rest:** add `disabled` option for OpenAPI spec endpoints ([af5b16a](https://github.com/strongloop/loopback-next/commit/af5b16a))
* **rest:** allow rest-server to be mounted on a path to express ([de8f626](https://github.com/strongloop/loopback-next/commit/de8f626))
* **rest:** introduce requestBodyParser options in RestServerOptions ([c7f59ba](https://github.com/strongloop/loopback-next/commit/c7f59ba))





## [1.5.5](https://github.com/strongloop/loopback-next/compare/@loopback/rest@1.5.4...@loopback/rest@1.5.5) (2019-02-08)


### Bug Fixes

* **rest:** sanitize json for JSON.parse() ([5042698](https://github.com/strongloop/loopback-next/commit/5042698))
* update to the most recent lodash version ([65ee865](https://github.com/strongloop/loopback-next/commit/65ee865))





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
