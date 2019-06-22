# @loopback/openapi-spec-builder

Make it easy to create OpenAPI specification documents in your tests using the
builder pattern.

## Overview

Creating a full OpenAPI spec document in automated tests is rather cumbersome,
long JSON-like objects pollute the test test code and make it difficult for
readers to distinguish between what's important in the test and what's just
shared OpenAPI boilerplate.

OpenApiSpecBuilder utilizes
[Test Data Builder pattern](http://www.natpryce.com/articles/000714.html) to
provide a TypeScript/JavaScript API allowing users to create full OpenAPI Spec
documents in few lines of code.

## Installation

```sh
npm install --save-dev @loopback/openapi-spec-builder
```

_This package is typically used in tests, save it to `devDependencies` via
`--save-dev`._

## Basic use

```ts
import {
  anOpenApiSpec,
  OpenApiSpecBuilder,
} from '@loopback/openapi-spec-builder';

const spec = anOpenApiSpec()
  .withOperationReturningString('get', '/hello', 'greet')
  .build();

// which is equivalent to the following longer form
const spec = new OpenApiSpecBuilder()
  .withOperation('get', '/hello', {
    'x-operation-name': 'greet',
    responses: {
      '200': {
        description: 'The string result.',
        content: {
          'text/plain': {
            schema: {
              type: 'string',
            },
          },
        },
      },
    },
  })
  .build();

// the spec
const spec = {
  openapi: '3.0.0',
  info: {title: 'LoopBack Application', version: '1.0.0'},
  servers: [
    {
      url: '/',
    },
  ],
  paths: {
    '/hello': {
      get: {
        'x-operation-name': 'greet',
        responses: {
          '200': {
            description: 'The string result.',
            content: {
              'text/plain': {
                schema: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
  },
};
```

## Related resources

See <https://www.openapis.org/> and
[version 3.0.0](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md)
of OpenAPI Specification.

## Contributions

- [Guidelines](https://github.com/strongloop/loopback-next/blob/master/docs/CONTRIBUTING.md)
- [Join the team](https://github.com/strongloop/loopback-next/issues/110)

## Tests

Run `npm test` from the root folder.

## Contributors

See
[all contributors](https://github.com/strongloop/loopback-next/graphs/contributors).

## License

MIT
