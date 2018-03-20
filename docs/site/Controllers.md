---
lang: en
title: 'Controllers'
keywords: LoopBack 4.0, LoopBack 4
tags:
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Controllers.html
summary:
---

## Overview

A `Controller` is a class that implements operations defined by application's
REST API. It implements an application's business logic and acts as a bridge
between the HTTP/REST API and domain/database models. A `Controller` operates
only on processed input and abstractions of backend services / databases.

### Review questions

{% include content/tbd.html %}

Simplest possible example of a Controller

* app.controller()
* a few methods
* no usage of @api

How to create a basic `Controller` (beyond the hello world)

* Using DI (@inject)
* Using annotations (eg. @authenticate)
* Defining routes via sugar annoations (@get, @post, @all)
* Errors
* Using `async` / `await` and `Promise`s

## Operations

In the previous Operation example, the `greet()` operation was defined as a
plain JavaScript function. The example below shows this as a Controller method.

```js
// plain function Operation
function greet(name) {
  return `hello ${name}`;
}

// Controller method Operation
class MyController {
  greet(name) {
    return `hello ${name}`;
  }
}
```

## Routing to Controllers

This is a basic API Specification used in the following examples. It is an
[Operation Object](https://github.com/OAI/OpenAPI-Specification/blob/0e51e2a1b2d668f434e44e5818a0cdad1be090b4/versions/2.0.md#operation-object).

```js
const spec = {
  parameters: [{name: 'name', type: 'string', in: 'query'}],
  responses: {
    '200': {
      description: 'greeting text',
      schema: {type: 'string'},
    },
  },
};
```

There are several ways to define `Routes` to Controller methods. The first
example defines a route to the Controller without any magic.

```js
app.route('get', '/greet', spec, MyController, 'greet');
```

Decorators allow you to annotate your Controller methods with routing metadata,
so LoopBack can call the `app.route()` function for you.

```js
class MyController {
  @get('/greet', spec)
  greet(name) {}
}

app.controller(MyController);
```

## Specifying Controller APIs

For larger LoopBack applications, you can organize your routes into API
Specifications using the OpenAPI specification. The `@api` decorator takes a
spec with type `ControllerSpec` which comprises of a string `basePath` and a
[Paths Object](https://github.com/OAI/OpenAPI-Specification/blob/0e51e2a1b2d668f434e44e5818a0cdad1be090b4/versions/2.0.md#paths-object).
It is _not_ a full
[Swagger](https://github.com/OAI/OpenAPI-Specification/blob/0e51e2a1b2d668f434e44e5818a0cdad1be090b4/versions/2.0.md#swagger-object)
specification.

```js
app.api({
  basePath: '/',
  paths: {
    '/greet': {
      get: {
        'x-operation-name': 'greet',
        'x-controller-name': 'MyController',
        parameters: [{name: 'name', type: 'string', in: 'query'}],
        responses: {
          '200': {
            description: 'greeting text',
            schema: {type: 'string'},
          },
        },
      },
    },
  },
});
app.controller(MyController);
```

The `@api` decorator allows you to annotate your Controller with a
specification, so LoopBack can call the `app.api()` function for you.

```js
@api({
  basePath: '/',
  paths: {
    '/greet': {
      get: {
        'x-operation-name': 'greet',
        'x-controller-name': 'MyController',
        parameters: [{name: 'name', type: 'string', in: 'query'}],
        responses: {
          '200': {
            description: 'greeting text',
            schema: {type: 'string'},
          },
        },
      },
    },
  },
})
class MyController {
  greet(name) {}
}
app.controller(MyController);
```

## Writing Controller methods

Below is an example Controller that uses several built in helpers (decorators).
These helpers give LoopBack hints about the Controller methods.

```js
import 'HelloRepostory' from 'path.to.repository';
import 'HelloMessage' from 'path.to.type';

class HelloController {
  constructor() {
    this.repository = new HelloRepository(); // our repository
  }
  @get('/messages')
  @param.query.number('limit')
  async list(limit = 10): Promise<HelloMessage[]> { // returns a list of our objects
    if (limit > 100) limit = 100; // your logic
    return await this.repository.find({limit}); // a CRUD method from our repository
  }
}
```

* `HelloRepository` extends from `Repository`, which is LoopBack's database
  abstraction. See [Repositories](./Repositories.md) for more.
* `HelloMessage` is the arbitrary object that `list` returns a list of.
* `@get('/messages')` creates the `Route` for the Operation using `app.route()`.
* `@param.query.number` adds a `number` param with a source of `query`.

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

```js
// the test
import {HelloController} from 'path.to.controller';
import {HttpErrors, expect} from '@loopback/testlab';

describe('Hello Controller', () => {
  it('returns 422 Unprocessable Entity for non-positive limit', async () => {
    const controller = new HelloController();
    let errCaught: Error;
    try {
      await controller.list(0.4); // an HttpError should be thrown here
    } catch (err) {
      errCaught = err;
    }
    // the test fails here if the error was not thrown
    expect(errCaught).to.have.property('statusCode', 422);
    expect(errCaught.message).to.match(/non-positive/i);
  });
});
```

```js
// the controller
import 'HttpErrors' from '@loopback/rest';
import 'HelloRepostory' from 'path.to.repository';
import 'HelloMessage' from 'path.to.type';

class HelloController {
  repository: HelloRepository; // see Dependency Injection for a better practice
  constructor() {
    this.repository = new HelloRepository();
  }
  @get('/messages')
  @param.query.number('limit')
  async list(limit = 10): Promise<HelloMessage[]>{
    // throw an error when the parameter is not a non-positive integer
    if (!Number.isInteger(limit) || limit < 1)
      throw new HttpErrors.UnprocessableEntity('limit is non-positive'));
    else if (limit > 100)
      limit = 100;
    return await this.repository.find({limit});
  }
}
```
