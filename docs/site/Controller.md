---
lang: en
title: 'Controller'
keywords: LoopBack 4.0, LoopBack 4, Node.js, TypeScript, OpenAPI, Concepts
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Controller.html
redirect_from: /doc/en/lb4/Controllers.html
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

In the Operation example in [Routes](Route.md), the `greet()` operation was
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
  abstraction. See [Repositories](./Repository.md) for more.
- `HelloMessage` is the arbitrary object that `list` returns a list of.
- `@get('/messages')` automatically creates the
  [Paths Item Object](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#path-item-object)
  for OpenAPI spec, which also handles request routing.
- `@param.query.number` specifies in the spec being generated that the route
  takes a parameter via query which will be a number.

## Modifying Specifications Created by Controller Generator

You can run generator to create REST controllers with CRUD methods. The command
and prompts are explained in page
[controller-generator](./Controller-generator.md#rest-controller-with-crud-methods).
To modify the OpenAPI specifications of REST controllers, you can leverage the
[specification enhancers](Extending-OpenAPI-specification.md).

For example, the default naming convention for a path's `operationId` is
`${controllerName}.${methodName}`. To override the `operationId` with a custom
one `${controllerName}-${methodName}`, you can define an enhancer as:

```ts
import {injectable} from '@loopback/core';
import {
  mergeOpenAPISpec,
  asSpecEnhancer,
  OASEnhancer,
  OpenApiSpec,
} from '@loopback/rest';

/**
 * A spec enhancer to modify `operationId` in paths
 */
@injectable(asSpecEnhancer)
export class OperationSpecEnhancer implements OASEnhancer {
  name = 'operationIdEnhancer';
  // takes in the current spec, modifies it, and returns a new one
  modifySpec(spec: OpenApiSpec): OpenApiSpec {
    const paths = spec.paths;
    for (const path in paths) {
      for (const op in path) {
        const operationId = paths[path][op].operationId;
        // change operationId from 'MyController.MyMethod' to
        // 'MyController-MyMethod'
        if (operationId)
          paths[path][op].operationId = operationId.replace('.', '-');
      }
    }
    return spec;
  }
}
```

## Class factory to allow parameterized decorations

Since decorations applied on a top-level class cannot have references to
variables, you can create a class factory that allows parameterized decorations
as shown in the example below.

```ts
function createControllerClass(version: string, basePath: string) {
  @api({basePath: `${basePath}`})
  class Controller {
    @get(`/${version}`) find() {}
  }
}
```

For a complete example, see
[parameterized-decoration.ts](https://github.com/loopbackio/loopback-next/blob/master/examples/context/src/parameterized-decoration.ts)
.

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
  it('returns 422 Unprocessable Entity for non natural number limit', () => {
    const repo = new HelloRepository(testdb);
    const controller = new HelloController(repo);

    return expect(controller.list(0.4)).to.be.rejectedWith(HttpError, {
      message: 'limit is not a natural number',
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
    // throw an error when the parameter is not a natural number
    if (!Number.isInteger(limit) || limit < 1) {
      throw new HttpErrors.UnprocessableEntity('limit is not a natural number');
    } else if (limit > 100) {
      limit = 100;
    }
    return this.repo.find({limit});
  }
}
```

## Creating Controllers at Runtime

A controller can be created for a model at runtime using the
`defineCrudRestController` helper function from the `@loopback/rest-crud`
package. It accepts a Model class and a `CrudRestControllerOptions` object.
Dependency injection for the controller has to be configured by applying the
`inject` decorator manually as shown in the example below.

```ts
const basePath = '/' + bookDef.name;
const BookController = defineCrudRestController(BookModel, {basePath});
inject(repoBinding.key)(BookController, undefined, 0);
```

The controller is then attached to the app by calling the `app.controller()`
method.

```ts
app.controller(BookController);
```

The new CRUD REST endpoints for the model will be available on the app now.

If you want a customized controller, you can create a copy of
`defineCrudRestController`'s
[implementation](https://github.com/loopbackio/loopback-next/blob/00917f5a06ea8a51e1f452f228a6b0b7314809be/packages/rest-crud/src/crud-rest.controller.ts#L129-L269)
and modify it according to your requirements.

For details about `defineCrudRestController` and `CrudRestControllerOptions`,
refer to the [@loopback/rest-crud API documentation](./apidocs/rest-crud.html).
