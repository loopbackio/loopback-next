# @loopback/openapi-spec-builder

Make it easy to create OpenAPI (Swagger) specification documents in your
tests using the builder pattern.

## Overview

Creating a full OpenAPI spec document in automated tests is rather cumbersome,
long JSON-like objects pollute the test test code and make it difficult
for readers to distinguish between what's important in the test and what's just
shared swagger boilerplate.

OpenApiSpecBuilder utilizes
[Test Data Builder pattern](http://www.natpryce.com/articles/000714.html)
to provide a TypeScript/JavaScript API allowing users to create
full OpenAPI Spec documents in few lines of code.

## Installation

```shell
$ npm install --save-dev @loopback/openapi-spec-builder
```

_This package is typically used in tests, save it to `devDependencies` via `--save-dev`._

## Basic use

```ts
import {anOpenApiSpec, OpenApiSpecBuilder} from '@loopback/openapi-spec-builder';

const spec = anOpenApiSpec()
  .withOperationReturningString('get', '/hello', 'greet')
  .build();

// which is equivalent to the following longer form

const spec = new OpenApiSpecBuilder()
  .withOperation('get', '/hello', {
    'x-operation-name': 'greet',
    responses: {
      '200': { type: 'string' },
    },
  })
  .build();

// the spec

const spec = {
  basePath: '/',
  swagger: '2.0',
  info: { title: 'LoopBack Application', version: '1.0.0' },
  paths: {
    '/hello': {
      get: {
        'x-operation-name': 'greet',
        responses: {
          '200': {
            description: 'The string result.',
            schema: {
              type: 'string'
            }
            },
        },
      }
    }
  }
};
```

## Related resources

See https://www.openapis.org/ and [version 2.0](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md)
of OpenAPI Specification.

## Contributions

IBM/StrongLoop is an active supporter of open source and welcomes contributions to our projects as well as those of the Node.js community in general. For more information on how to contribute please refer to the [Contribution Guide](https://loopback.io/doc/en/contrib/index.html).

# Tests

run `npm test` from the root folder.

# Contributors

See [all contributors](https://github.com/strongloop/loopback-next/graphs/contributors).

# License

MIT
