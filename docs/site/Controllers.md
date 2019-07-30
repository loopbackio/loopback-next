---
lang: en
title: 'Controllers'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Controllers.html
---

## Overview

A `Controller` is a class that implements operations defined by an application's
API. It implements an application's business logic and acts as a bridge between
the HTTP/REST API and domain/database models. Decorations are added to a
`Controller` class and its members to map the API operations of the application
to the corresponding controller's operations. A `Controller` operates only on
processed input and abstractions of backend services / databases.

This page will only cover a `Controller`'s usage with REST APIs.

## Operations

In the Operation example in [Routes](Routes.md), the `greet()` operation was
defined as a plain JavaScript function. The example below shows this as a
Controller method in TypeScript.

```ts
// plain function Operation
function greet(name: string) {
  return `hello ${name}`;
}

// Controller method Operation
class MyController {
  greet(name: string) {
    return `hello ${name}`;
  }
}
```

## Routing to Controllers

This is a basic API Specification used in the following examples. It is an
[Operation Object](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#operationObject).

```ts
const spec = {
  parameters: [{name: 'name', schema: {type: 'string'}, in: 'query'}],
  responses: {
    '200': {
      description: 'greeting text',
      content: {
        'application/json': {
          schema: {type: 'string'},
        },
      },
    },
  },
};
```

There are several ways to define `Routes` to Controller methods. The first
example defines a route to the Controller without any magic.

```ts
// ... in your application constructor
this.route('get', '/greet', spec, MyController, 'greet');
```

Decorators allow you to annotate your Controller methods with routing metadata,
so LoopBack can call the `app.route()` function for you.

```ts
import {get} from '@loopback/rest';

class MyController {
  @get('/greet', spec)
  greet(name: string) {
    return `hello ${name}`;
  }
}

// ... in your application constructor
this.controller(MyController);
```

## Specifying Controller APIs

For larger LoopBack applications, you can organize your routes into API
Specifications using the OpenAPI specification. The `@api` decorator takes a
spec with type `ControllerSpec` which comprises of a string `basePath` and a
[Paths Object](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#paths-object)
Note that it is _not_ the full
[OpenAPI](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#oasObject)
specification.

```ts
// ... in your application constructor
this.api({
  openapi: '3.0.0',
  info: {
    title: 'Hello World App',
    version: '1.0.0',
  },
  paths: {
    '/greet': {
      get: {
        'x-operation-name': 'greet',
        'x-controller-name': 'MyController',
        parameters: [{name: 'name', schema: {type: 'string'}, in: 'query'}],
        responses: {
          '200': {
            description: 'greeting text',
            content: {
              'application/json': {
                schema: {type: 'string'},
              },
            },
          },
        },
      },
    },
  },
});
this.controller(MyController);
```

The `@api` decorator allows you to annotate your Controller with a
specification, so LoopBack can call the `app.api()` function for you.

```ts
@api({
  openapi: '3.0.0',
  info: {
    title: 'Hello World App',
    version: '1.0.0',
  },
  paths: {
    '/greet': {
      get: {
        'x-operation-name': 'greet',
        'x-controller-name': 'MyController',
        parameters: [{name: 'name', schema: {type: 'string'}, in: 'query'}],
        responses: {
          '200': {
            description: 'greeting text',
            content: {
              'application/json': {
                schema: {type: 'string'},
              },
            },
          },
        },
      },
    },
  },
})
class MyController {
  greet(name: string) {
    return `hello ${name}`;
  }
}
app.controller(MyController);
```

## Writing Controller methods

Below is an example Controller that uses several built in helpers (decorators).
These helpers give LoopBack hints about the Controller methods.

```ts
import {HelloRepository} from '../repositories';
import {HelloMessage} from '../models';
import {get, param} from '@loopback/rest';
import {repository} from '@loopback/repository';

export class HelloController {
  constructor(
    @repository(HelloRepository) protected repository: HelloRepository,
  ) {}

  // returns a list of our objects
  @get('/messages')
  async list(@param.query.number('limit') limit = 10): Promise<HelloMessage[]> {
    if (limit > 100) limit = 100; // your logic
    return this.repository.find({limit}); // a CRUD method from our repository
  }
}
```

- `HelloRepository` extends from `Repository`, which is LoopBack's database
  abstraction. See [Repositories](./Repositories.md) for more.
- `HelloMessage` is the arbitrary object that `list` returns a list of.
- `@get('/messages')` automatically creates the
  [Paths Item Object](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#path-item-object)
  for OpenAPI spec, which also handles request routing.
- `@param.query.number` specifies in the spec being generated that the route
  takes a parameter via query which will be a number.

## Handling Errors in Controllers

In order to specify errors for controller methods to throw, the class
`HttpErrors` is used. `HttpErrors` is a class that has been re-exported from
[http-errors](https://www.npmjs.com/package/http-errors), and can be found in
the `@loopback/rest` package.

Listed below are some of the most common error codes. The full list of supported
codes is found
[here](https://github.com/jshttp/http-errors#list-of-all-constructors).

| Status Code | Error               |
| ----------- | ------------------- |
| 400         | BadRequest          |
| 401         | Unauthorized        |
| 403         | Forbidden           |
| 404         | NotFound            |
| 500         | InternalServerError |
| 502         | BadGateway          |
| 503         | ServiceUnavailable  |
| 504         | GatewayTimeout      |

The example below shows the previous controller revamped with `HttpErrors` along
with a test to verify that the error is thrown properly.

{% include code-caption.html content="src/__tests__/integration/controllers/hello.controller.integration.ts" %}

```ts
import {HelloController} from '../../../controllers';
import {HelloRepository} from '../../../repositories';
import {testdb} from '../../fixtures/datasources/testdb.datasource';
import {expect} from '@loopback/testlab';
import {HttpErrors} from '@loopback/rest';

const HttpError = HttpErrors.HttpError;

describe('Hello Controller', () => {
  it('returns 422 Unprocessable Entity for non-positive limit', () => {
    const repo = new HelloRepository(testdb);
    const controller = new HelloController(repo);

    return expect(controller.list(0.4)).to.be.rejectedWith(HttpError, {
      message: 'limit is non-positive',
      statusCode: 422,
    });
  });
});
```

{% include code-caption.html content="src/controllers/hello.controller.ts" %}

```ts
import {HelloRepository} from '../repositories';
import {HelloMessage} from '../models';
import {get, param, HttpErrors} from '@loopback/rest';
import {repository} from '@loopback/repository';

export class HelloController {
  constructor(@repository(HelloRepository) protected repo: HelloRepository) {}

  // returns a list of our objects
  @get('/messages')
  async list(@param.query.number('limit') limit = 10): Promise<HelloMessage[]> {
    // throw an error when the parameter is not a non-positive integer
    if (!Number.isInteger(limit) || limit < 1) {
      throw new HttpErrors.UnprocessableEntity('limit is non-positive');
    } else if (limit > 100) {
      limit = 100;
    }
    return this.repo.find({limit});
  }
}
```
