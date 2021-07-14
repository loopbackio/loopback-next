---
lang: en
title: 'Route'
keywords: LoopBack 4.0, LoopBack 4, Node.js, TypeScript, OpenAPI
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Route.html
redirect_from: /doc/en/lb4/Routes.html
---

## Overview

A `Route` is the mapping between your API specification and an Operation. It
tells LoopBack which Operation to `invoke()` given an HTTP request.

The `Route` object and its associated types are provided as a part of the
[`@loopback/rest`](https://github.com/strongloop/loopback-next/blob/master/packages/rest)
package.

## Operations

Operations are functions that accept Parameters. They can be implemented as
plain JavaScript/TypeScript functions (like http handler functions) or as
methods in [Controllers](Controller.md).

```ts
// greet is a basic operation
function greet(name: string) {
  return `hello ${name}`;
}
```

## Parameters

In the example above, `name` is a Parameter. Parameters are values which are
usually parsed from a `Request` by a `Sequence` and then passed as arguments to
an Operation. Parameters are defined as part of a `Route` using the OpenAPI
specification. They can be parsed from the following parts of the `Request`:

- `body`
- `form data`
- `query` string
- `header`
- `path` (url)

## Creating REST Routes

There are three distinct approaches for defining your REST Routes:

- With an OpenAPI specification object
- Using partial OpenAPI spec fragments with the `Route` constructor
- Using route decorators on controller methods

### Declaring REST Routes with API specifications

Below is an example of an
[Open API Specification](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#oasObject)
that defines the same operation as the example above. This is the declarative
approach to defining operations. The `x-operation` field in the example below
references the handler JavaScript function for the API operation, and should not
be confused with `x-operation-name`, which is a string for the Controller method
name.

```ts
import {OpenApiSpec, RestApplication} from '@loopback/rest';

function greet(name: string) {
  return `hello ${name}`;
}

const spec: OpenApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'LoopBack Application',
    version: '1.0.0',
  },
  paths: {
    '/': {
      get: {
        'x-operation': greet,
        parameters: [{name: 'name', in: 'query', schema: {type: 'string'}}],
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
};

const app = new RestApplication();
app.api(spec);
```

### Using partial OpenAPI spec fragments

The example below defines a `Route` that will be matched for `GET /`. When the
`Route` is matched, the `greet` Operation (above) will be called. It accepts an
OpenAPI
[OperationObject](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#operationObject)
which is defined using `spec`. The route is then attached to a valid server
context running underneath the application.

```ts
import {OperationObject, RestApplication, Route} from '@loopback/rest';

const spec: OperationObject = {
  parameters: [{name: 'name', in: 'query', schema: {type: 'string'}}],
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

// greet is a basic operation
function greet(name: string) {
  return `hello ${name}`;
}

const app = new RestApplication();
app.route('get', '/', spec, greet); // attaches route to RestServer

app.start();
```

### Using Route decorators with controller methods

You can decorate your controller functions using the verb decorator functions
within `@loopback/rest` to determine which routes they will handle.

{% include code-caption.html content="src/controllers/greet.controller.ts" %}

```ts
import {get, param} from '@loopback/rest';

export class GreetController {
  // Note that we can still use OperationObject fragments with the
  // route decorators for fine-tuning their definitions and behaviours.
  // This could simply be `@get('/')`, if desired.
  @get('/', {
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
  })
  greet(@param.query.string('name') name: string) {
    return `hello ${name}`;
  }
}
```

{% include code-caption.html content="src/index.ts" %}

```ts
import {RestApplication} from '@loopback/rest';
import {GreetController} from './src/controllers/greet.controller';

const app = new RestApplication();

app.controller(GreetController);

app.start();
```

## Invoking operations using Routes

This example breaks down how [`Sequences`](Sequence.md) determine and call the
matching operation for any given request.

```js
class MySequence extends DefaultSequence {
  async handle(request, response) {
    // find the route that matches this request
    const route = this.findRoute(request);

    // params is created by parsing the request using the route
    const params = this.parseParams(request, route);

    // invoke() uses both route and params to execute the operation specified by the route
    const result = await this.invoke(route, params);

    await this.send(response, result);
  }
}
```

## Related guides

- [Implementing HTTP redirects](Customizing-routes.md#implementing-http-redirects)
- [Mounting an Express Router](Customizing-routes.md#mounting-an-express-router)
