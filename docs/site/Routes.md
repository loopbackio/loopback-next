---
lang: en
title: 'Routes'
keywords: LoopBack 4.0, LoopBack 4
tags:
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Routes.html
summary:
---

## Overview

A `Route` is the mapping between your API specification and an Operation (JavaScript implementation). It tells LoopBack which function to `invoke()` given an HTTP request.

The `Route` object and its associated types are provided as a part of the
[(`@loopback/rest`)](https://github.com/strongloop/loopback-next/blob/master/packages/rest) package.

## Operations

Operations are JavaScript functions that accept Parameters. They can be implemented as plain JavaScript functions or as methods in [Controllers](Controllers.md).

```js
// greet is a basic operation
function greet(name) {
  return `hello ${name}`;
}
```

## Parameters

In the example above, `name` is a Parameter. Parameters are values, usually parsed from a `Request` by a `Sequence`, passed as arguments to an Operation. Parameters are defined as part of a `Route` using the OpenAPI specification. They can be parsed from the following parts of the `Request`:

 - `body`
 - `query` string
 - `header`
 - `path` (url)

## Creating REST Routes

There are three distinct approaches for defining your REST Routes:
- With an OpenAPI specification object
- Using partial OpenAPI spec fragments with the `Route` constructor
- Using route decorators on controller methods

### Declaring REST Routes with API specifications

Below is an example [Open API Specification](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#swagger-object) that defines the same operation as the example above. This a declarative approach to defining operations. The `x-operation` field in the example below references the handler JavaScript function for the API operation, and should not be confused with `x-operation-name`, which is a string for the Controller method name.

```js

const server = await app.getServer(RestServer);
const spec = {
  basePath: '/',
  paths: {
    '/': {
      get: {
        'x-operation': greet,
        parameters: [{name: 'name', in: 'query', type: 'string'}],
        responses: {
          '200': {
            description: 'greeting text',
            schema: {type: 'string'},
          }
        }
      }
    }
  }
};

server.api(spec);
```

### Using partial OpenAPI spec fragments

The example below defines a `Route` that will be matched for `GET /`. When the `Route` is matched, the `greet` Operation (above) will be called. It accepts an OpenAPI [OperationObject](https://github.com/OAI/OpenAPI-Specification/blob/0e51e2a1b2d668f434e44e5818a0cdad1be090b4/versions/2.0.md#operationObject) which is defined using `spec`.
The route is then attached to a valid server context running underneath the
application.
```ts
import {RestApplication, RestServer, Route} from '@loopback/rest';
import {OperationObject} from '@loopback/openapi-spec';

const spec: OperationObject = {
  parameters: [{name: 'name', in: 'query', type: 'string'}],
  responses: {
    '200': {
      description: 'greeting text',
      schema: {type: 'string'}
    }
  }
};

// greet is a basic operation
function greet(name: string) {
  return `hello ${name}`;
}

const app = new RestApplication();
const route = new Route('get', '/', spec, greet);
app.route(route); // attaches route to RestServer

app.start();
```

### Using Route decorators with controller methods

You can decorate your controller functions using the verb decorator functions
within `@loopback/rest` to determine which routes they will handle.

{% include code-caption.html content="/src/controllers/greet.controller.ts" %}
```ts
import { get, param } from '@loopback/rest';

export class GreetController {
  // Note that we can still use OperationObject fragments with the
  // route decorators for fine-tuning their definitions and behaviours.
  // This could simply be `@get('/')`, if desired.
  @get('/', {
    responses: {
      '200': {
        description: 'greeting text',
        schema: { type: 'string' }
      }
    }
  })
  @param.query.string('name')
  greet(name: string) {
    return `hello ${name}`;
  }
}
```

{% include code-caption.html content="index.ts" %}
```ts
import { RestApplication } from '@loopback/rest';
import { GreetController } from './src/controllers/greet.controller';

const app = new RestApplication();

app.controller(GreetController);

app.start();
```

## Invoking operations using Routes

This example breaks down how `Sequences` determine and call the matching operation for any given request.

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
