---
lang: en
title: 'Action based Sequence for REST Server'
keywords: LoopBack 4.0, LoopBack 4, Node.js, TypeScript, OpenAPI
sidebar: lb4_sidebar
permalink: /doc/en/lb4/REST-action-sequence.html
---

{% include warning.html content="Action-based sequence is now being phased out.
Please use [middleware-based sequence](REST-middleware-sequence.md)."%}

## What is a Sequence?

A `Sequence` is a stateless grouping of [Actions](#actions) that control how a
`Server` responds to requests.

The contract of a `Sequence` is simple: it must produce a response to a request.
Creating your own `Sequence` gives you full control over how your `Server`
instances handle requests and responses. The `DefaultSequence` looks like this:

```ts
export class DefaultSequence implements SequenceHandler {
  /**
   * Optional invoker for registered middleware in a chain.
   * To be injected via SequenceActions.INVOKE_MIDDLEWARE.
   */
  @inject(SequenceActions.INVOKE_MIDDLEWARE, {optional: true})
  protected invokeMiddleware: InvokeMiddleware = () => false;

  /**
   * Constructor: Injects findRoute, invokeMethod & logError
   * methods as promises.
   *
   * @param findRoute - Finds the appropriate controller method,
   *  spec and args for invocation (injected via SequenceActions.FIND_ROUTE).
   * @param parseParams - The parameter parsing function (injected
   * via SequenceActions.PARSE_PARAMS).
   * @param invoke - Invokes the method specified by the route
   * (injected via SequenceActions.INVOKE_METHOD).
   * @param send - The action to merge the invoke result with the response
   * (injected via SequenceActions.SEND)
   * @param reject - The action to take if the invoke returns a rejected
   * promise result (injected via SequenceActions.REJECT).
   */
  constructor(
    @inject(SequenceActions.FIND_ROUTE) protected findRoute: FindRoute,
    @inject(SequenceActions.PARSE_PARAMS) protected parseParams: ParseParams,
    @inject(SequenceActions.INVOKE_METHOD) protected invoke: InvokeMethod,
    @inject(SequenceActions.SEND) public send: Send,
    @inject(SequenceActions.REJECT) public reject: Reject,
  ) {}

  /**
   * Runs the default sequence. Given a handler context (request and response),
   * running the sequence will produce a response or an error.
   *
   * Default sequence executes these steps
   *  - Executes middleware for CORS, OpenAPI spec endpoints
   *  - Finds the appropriate controller method, swagger spec
   *    and args for invocation
   *  - Parses HTTP request to get API argument list
   *  - Invokes the API which is defined in the Application Controller
   *  - Writes the result from API into the HTTP response
   *  - Error is caught and logged using 'logError' if any of the above steps
   *    in the sequence fails with an error.
   *
   * @param context - The request context: HTTP request and response objects,
   * per-request IoC container and more.
   */
  async handle(context: RequestContext): Promise<void> {
    try {
      const {request, response} = context;
      // Invoke registered Express middleware
      const finished = await this.invokeMiddleware(context);
      if (finished) {
        // The response been produced by the middleware chain
        return;
      }
      const route = this.findRoute(request);
      const args = await this.parseParams(request, route);
      const result = await this.invoke(route, args);

      debug('%s result -', route.describe(), result);
      this.send(response, result);
    } catch (error) {
      this.reject(context, error);
    }
  }
}
```

## Elements

In the example above, `route`, `params`, and `result` are all Elements. When
building sequences, you use LoopBack Elements to respond to a request:

- [`InvokeMiddleware`](https://loopback.io/doc/en/lb4/apidocs.express.invokemiddleware.html)
- [`FindRoute`](https://loopback.io/doc/en/lb4/apidocs.rest.findroute.html)
- [`Request`](http://apidocs.strongloop.com/loopback-next/) - (TBD) missing API
  docs link
- [`Response`](http://apidocs.strongloop.com/loopback-next/) - (TBD) missing API
  docs link
- [`OperationRetVal`](https://loopback.io/doc/en/lb4/apidocs.rest.operationretval.html)
- [`ParseParams`](https://loopback.io/doc/en/lb4/apidocs.rest.parseparams.html)
- [`OpenAPISpec`](https://loopback.io/doc/en/lb4/apidocs.openapi-v3.openapispec.html)

## Actions

Actions are JavaScript functions that only accept or return `Elements`. Since
the input of one action (an Element) is the output of another action (Element)
you can easily compose them. Below is an example that uses several built-in
Actions:

```ts
class MySequence extends DefaultSequence {
  async handle(context: RequestContext) {
    try {
      // Invoke registered Express middleware
      const finished = await this.invokeMiddleware(context);
      if (finished) {
        // The response been produced by the middleware chain
        return;
      }
      // findRoute() produces an element
      const route = this.findRoute(context.request);
      // parseParams() uses the route element and produces the params element
      const params = await this.parseParams(context.request, route);
      // invoke() uses both the route and params elements to produce the result (OperationRetVal) element
      const result = await this.invoke(route, params);
      // send() uses the result element
      this.send(context.response, result);
    } catch (error) {
      this.reject(context, error);
    }
  }
}
```

{% include warning.html content="Starting from v4.0.0 of `@loopback/rest`. The
sequence adds an `InvokeMiddleware` action for CORS and OpenAPI spec endpoints
as well as other middleware. See [Middleware](Middleware.md) and
[Express Middleware](Express-middleware.md) for more details. For applications
generated using old version of `lb4`, the `src/sequence.ts` needs to be manually
updated with the code above." %}

## Custom Sequences

Most use cases can be accomplished with `DefaultSequence` or by slightly
customizing it. When an app is generated by the command `lb4 app`, a sequence
file extending `DefaultSequence` at `src/sequence.ts` is already generated and
bound for you so that you can easily customize it.

Here is an example where the application logs out a message before and after a
request is handled:

```ts
import {DefaultSequence, Request, Response} from '@loopback/rest';

class MySequence extends DefaultSequence {
  log(msg: string) {
    console.log(msg);
  }
  async handle(context: RequestContext) {
    this.log('before request');
    await super.handle(context);
    this.log('after request');
  }
}
```

In order for LoopBack to use your custom sequence, you must register it before
starting your `Application`:

```js
import {RestApplication} from '@loopback/rest';

const app = new RestApplication();
app.sequence(MySequencce);

app.start();
```

## Common Task

- [Working with Express Middleware](Working-with-express-middleware.md)
- [Advanced Sequence topics](Advanced-sequence-topics.md)
