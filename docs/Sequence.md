---
lang: en
title: 'Sequence'
keywords: LoopBack 4.0, LoopBack 4
tags:
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Sequence.html
summary:
---

## What is a Sequence?

A `Sequence` is a stateless grouping of [Actions](#actions) that control how a
`Server` responds to requests.

The contract of a `Sequence` is simple: it must produce a response to a request.
Creating your own `Sequence` gives you full control over how your `Server`
instances handle requests and responses. The `DefaultSequence` looks like this:

<!--
  FIXME(kev): Should we be copying this logic into the docs directly?
  What if this code changes?
-->
```js
class DefaultSequence {
  async handle(request: ParsedRequest, response: ServerResponse) {
    try {
      const route = this.findRoute(request);
      const params = await this.parseParams(request, route);
      const result = await this.invoke(route, params);
      await this.send(response, result);
    } catch(err) {
      await this.reject(response, err);
    }
  }
}
```

## Elements

In the example above, `route`, `params`, and `result` are all Elements. When building sequences, you use LoopBack Elements to respond to a request:

- [`Route`](http://apidocs.loopback.io/@loopback%2frest/#Route)
- [`Request`](http://apidocs.strongloop.com/loopback-next/)  - (TBD) missing API docs link
- [`Response`](http://apidocs.strongloop.com/loopback-next/) - (TBD) missing API docs link
- [`OperationRetVal`](http://apidocs.loopback.io/@loopback%2frest/#OperationRetval)
- [`Params`](http://apidocs.strongloop.com/loopback-next/) - (TBD) missing API docs link
- [`OpenAPISpec`](http://apidocs.loopback.io/@loopback%2fopenapi-spec/)
- [`OperationError`](http://apidocs.strongloop.com/loopback-next/OperationError) - (TBD) missing API docs link
- [`OperationMeta`](http://apidocs.strongloop.com/loopback-next/OperationMeta) - (TBD) missing API docs link
- [`OperationRetMeta`](http://apidocs.strongloop.com/loopback-next/OperationRetMeta) - (TBD) missing API docs link

## Actions

Actions are JavaScript functions that only accept or return `Elements`. Since the input of one action (an Element) is the output of another action (Element) you can easily compose them. Below is an example that uses several built-in Actions:

```js
class MySequence extends DefaultSequence {
  async handle(request: ParsedRequest, response: ServerResponse) {
    // findRoute() produces an element
    const route = this.findRoute(request);
    // parseParams() uses the route element and produces the params element
    const params = await this.parseParams(request, route);
    // invoke() uses both the route and params elements to produce the result (OperationRetVal) element
    const result = await this.invoke(route, params);
    // send() uses the result element
    await this.send(response, result);
  }
}
```

## Custom Sequences

Most use cases can be accomplished with `DefaultSequence` or by slightly customizing it:

```js
class MySequence extends DefaultSequence {
  log(msg) {
    console.log(msg);
  }
  async handle(request, response) {
    this.log('before request');
    await super.handle(request, response);
    this.log('after request');
  }
}
```

In order for LoopBack to use your custom sequence, you must register it on any
applicable `Server` instances before starting your `Application`:

```js
import {RestApplication, RestServer} from '@loopback/rest';

const app = new RestApplication();

// or
(async function start() {
  const server = await app.getServer(RestServer);
  server.sequence(MySequence);
  await app.start();
})();
```

## Advanced topics

### Custom routing

A custom `Sequence` enables you to control exactly how requests are routed to endpoints such as `Controller` methods, plain JavaScript functions, Express applications, and so on.

This example demonstrates determining which endpoint (controller method) to invoke based on an API specification.

```ts
import {findRoute} from '@loopback/rest'

const API_SPEC = {
  basePath: '/',
  paths: {
    '/greet': {
      get: {
        'x-operation-name': "greet",
        responses: {
          200: {
            description: "greeting text",
            schema: { type: "string" }
          }
        }
      }
    }
  }
};

class MySequence extends DefaultSequence {
  async run(request) {
    const {methodName} = this.findRoute(request, API_SPEC);
    await this.sendResponse(methodName); // => greet
  }
}
```

### Customizing Sequence Actions

There might be scenarios where the default sequence _ordering_ is not something
you want to change, but rather the individual actions that the sequence will
execute.

To do this, you'll need to override one or more of the sequence action bindings
used by the `RestServer`, under the `RestBindings.SequenceActions` constants.

As an example, we'll implement a custom sequence action to replace the default
"send" action. This action is responsible for returning the response from a
controller to the client making the request.

To do this, we'll register a custom send action by binding a
[Provider](http://apidocs.strongloop.com/@loopback%2fcontext/#Provider) to the
`RestBindings.SequenceActions.SEND` key.

First, let's create our `CustomSendProvider` class, which will provide the
send function upon injection.

{% include code-caption.html content="/src/providers/custom-send-provider.ts" %}
**custom-send-provider.ts**
```ts
import {Send, ServerResponse} from "@loopback/rest";
import {Provider, BoundValue, inject} from "@loopback/context";
import {writeResultToResponse, RestBindings} from "@loopback/rest";

// Note: This is an example class; we do not provide this for you.
import {Formatter} from "../utils";

export class CustomSendProvider implements Provider<BoundValue> {
  // In this example, the injection key for formatter is simple
  constructor(
      @inject('utils.formatter') public formatter: Formatter,
      @inject(RestBindings.Http.REQUEST) public request: Request,
    ) {}

  value(): Send | Promise<Send> {
    // Use the lambda syntax to preserve the "this" scope for future calls!
    return (response, result) => {
      this.action(response, result);
    };
  }
  /**
   * Use the mimeType given in the request's Accept header to convert
   * the response object!
   * @param ServerResponse response The response object used to reply to the
   * client.
   * @param OperationRetVal result The result of the operation carried out by
   * the controller's handling function.
   */
  action(response: ServerResponse, result: OperationRetVal) {
    if (result) {
      // Currently, the headers interface doesn't allow arbitrary string keys!
      const headers = this.request.headers as any || {};
      const header = headers.accept || 'application/json';
      const formattedResult =
        this.formatter.convertToMimeType(result, header);
      response.setHeader('Content-Type', header);
      response.end(formattedResult);
    } else {
      response.end();
    }
  }
}
```

Our custom provider will automatically read the `Accept` header from the request
context, and then transform the result object so that it matches the specified
MIME type.

Next, in our application class, we'll inject this provider on the
`RestBindings.SequenceActions.SEND` key.

{% include code-caption.html content="/src/application.ts" %}
```ts
import {Application} from '@loopback/core';
import {RestApplication, RestBindings} from '@loopback/rest';
import {RepositoryMixin} from '@loopback/repository';
import {CustomSendProvider} from './providers/custom-send-provider';
import {Formatter} from './utils';
import {BindingScope} from '@loopback/context';

export class YourApp extends RepositoryMixin(RestApplication) {
  constructor() {
    super();
    // Assume your controller setup and other items are in here as well.
    this.bind('utils.formatter').toClass(Formatter)
      .inScope(BindingScope.SINGLETON);
    this.bind(RestBindings.SequenceActions.SEND).toProvider(CustomSendProvider);
  }
```

As a result, whenever the send action of the
[`DefaultSequence`](http://apidocs.strongloop.com/@loopback%2frest/#DefaultSequence)
is called, it will make use of your function instead! You can use this approach
to override any of the actions listed under the `RestBindings.SequenceActions`
namespace.

### Query string parameters

{% include content/tbd.html %}

How to get query string param values.

### Parsing Requests

{% include content/tbd.html %}

Parsing and validating arguments from the request url, headers, and body.

### Invoking controller methods

{% include content/tbd.html %}

 - How to use `invoke()` in simple and advanced use cases.
 - Explain what happens when you call `invoke()`
 - Mention caching use case
 - Can I call invoke multiple times?

### Writing the response

{% include content/tbd.html %}

 - Must call `sendResponse()` exactly once
 - Streams?

### Sending errors

{% include content/tbd.html %}

 - try/catch details

### Keeping your Sequences

{% include content/tbd.html %}

 - Try and use existing actions
 - Implement your own version of built in actions
 - Publish reusable actions to npm
