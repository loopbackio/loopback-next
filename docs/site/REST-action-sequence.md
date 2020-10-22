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

## Advanced topics

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
[Provider](https://loopback.io/doc/en/lb4/apidocs.context.provider.html) to the
`RestBindings.SequenceActions.SEND` key.

First, let's create our `CustomSendProvider` class, which will provide the send
function upon injection.

{% include code-caption.html content="/src/providers/custom-send.provider.ts" %}
**custom-send.provider.ts**

```ts
import {Send, Response} from '@loopback/rest';
import {Provider, BoundValue, inject} from '@loopback/core';
import {writeResultToResponse, RestBindings, Request} from '@loopback/rest';

// Note: This is an example class; we do not provide this for you.
import {Formatter} from '../utils';

export class CustomSendProvider implements Provider<Send> {
  // In this example, the injection key for formatter is simple
  constructor(
    @inject('utils.formatter') public formatter: Formatter,
    @inject(RestBindings.Http.REQUEST) public request: Request,
  ) {}

  value() {
    // Use the lambda syntax to preserve the "this" scope for future calls!
    return (response: Response, result: OperationRetval) => {
      this.action(response, result);
    };
  }
  /**
   * Use the mimeType given in the request's Accept header to convert
   * the response object!
   * @param response - The response object used to reply to the  client.
   * @param result - The result of the operation carried out by the controller's
   * handling function.
   */
  action(response: Response, result: OperationRetval) {
    if (result) {
      // Currently, the headers interface doesn't allow arbitrary string keys!
      const headers = (this.request.headers as any) || {};
      const header = headers.accept || 'application/json';
      const formattedResult = this.formatter.convertToMimeType(result, header);
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
import {RestApplication, RestBindings} from '@loopback/rest';
import {
  RepositoryMixin,
  Class,
  Repository,
  juggler,
} from '@loopback/repository';
import {CustomSendProvider} from './providers/custom-send.provider';
import {Formatter} from './utils';
import {BindingScope} from '@loopback/core';

export class YourApp extends RepositoryMixin(RestApplication) {
  constructor() {
    super();
    // Assume your controller setup and other items are in here as well.
    this.bind('utils.formatter')
      .toClass(Formatter)
      .inScope(BindingScope.SINGLETON);
    this.bind(RestBindings.SequenceActions.SEND).toProvider(CustomSendProvider);
  }
}
```

As a result, whenever the send action of the
[`DefaultSequence`](https://loopback.io/doc/en/lb4/apidocs.rest.defaultsequence.html)
is called, it will make use of your function instead! You can use this approach
to override any of the actions listed under the `RestBindings.SequenceActions`
namespace.

### Query string parameters and path parameters

OAI 3.0.x describes the data from a request’s header, query and path in an
operation specification’s parameters property. In a Controller method, such an
argument is typically decorated by @param(). We've made multiple shortcuts
available to the `@param()` decorator in the form of
`@param.<http_source>.<OAI_primitive_type>`. Using this notation, path
parameters can be described as `@param.path.string`. Here is an example of a
controller method which retrieves a Note model instance by obtaining the `id`
from the path object.

```ts
@get('/notes/{id}', {
  responses: {
    '200': {
      description: 'Note model instance',
      content: {
        'application/json': {
          schema: getModelSchemaRef(Note, {includeRelations: true}),
        },
      },
    },
  },
})
async findById(
  @param.path.string('id') id: string,
  @param.filter(Note, {exclude: 'where'}) filter?: FilterExcludingWhere<Note>
): Promise<Note> {
  return this.noteRepository.findById(id, filter);
}
```

(Notice: the filter for `findById()` method only supports the `include` clause
for now.)

You can also specify a parameter which is an object value encoded as a JSON
string or in multiple nested keys. For a JSON string, a sample value would be
`location={"lang": 23.414, "lat": -98.1515}`. For the same `location` object, it
can also be represented as `location[lang]=23.414&location[lat]=-98.1515`. Here
is the equivalent usage for `@param.query.object()` decorator. It takes in the
name of the parameter and an optional schema or reference object for it.

```ts
@param.query.object('location', {
  type: 'object',
  properties: {lat: {type: 'number', format: 'float'}, long: {type: 'number', format: 'float'}},
})
```

The parameters are retrieved as the result of `parseParams` Sequence action.
Please note that deeply nested properties are not officially supported by OAS
yet and is tracked by
[OAI/OpenAPI-Specification#1706](https://github.com/OAI/OpenAPI-Specification/issues/1706).
Therefore, our REST API Explorer does not allow users to provide values for such
parameters and unfortunately has no visible indication of that. This problem is
tracked and discussed in
[swagger-api/swagger-js#1385](https://github.com/swagger-api/swagger-js/issues/1385).

### Parsing Requests

Parsing and validating arguments from the request url, headers, and body. See
page [Parsing requests](Parsing-requests.md).

### Invoking controller methods

The `invoke` sequence action simply takes the parsed request parameters from the
`parseParams` action along with non-decorated arguments, calls the corresponding
controller method or route handler method, and returns the value from it. The
default implementation of
[invoke](https://github.com/strongloop/loopback-next/blob/6bafa0774662991199090219913c3dc77ad5b149/packages/rest/src/providers/invoke-method.provider.ts)
action calls the handler function for the route with the request specific
context and the arguments for the function. It is important to note that
controller methods use `invokeMethod` from `@loopback/core` and can be used with
global and custom interceptors. See
[Interceptor docs](Interceptor.md#use-invokemethod-to-apply-interceptors) for
more details. The request flow for two route flavours is explained below.

For controller methods:

- A controller instance is instantiated from the context. As part of the
  instantiation, constructor and property dependencies are injected. The
  appropriate controller method is invoked via the chain of interceptors.
- Arguments decorated with `@param` are resolved using data parsed from the
  request. Arguments decorated with `@inject` are resolved from the context.
  Arguments with no decorators are set to undefined, which is replaced by the
  argument default value if it's provided.

For route handlers, the handler function is invoked via the chain of
interceptors. The array of method arguments is constructed using OpenAPI spec
provided at handler registration time (either via `.api()` for full schema or
`.route()` for individual route registration).

### Writing the response

The
[send](https://github.com/strongloop/loopback-next/blob/6bafa0774662991199090219913c3dc77ad5b149/packages/rest/src/providers/send.provider.ts)
sequence action is responsible for writing the result of the `invoke` action to
the HTTP response object. The default sequence calls send with (transformed)
data. Under the hood, send performs all steps required to send back the
response, from content-negotiation to serialization of the response body. In
Express, the handler is responsible for setting response status code, headers
and writing the response body. In LoopBack, controller methods and route
handlers return data describing the response and it's the responsibility of the
Sequence to send that data back to the client. This design makes it easier to
transform the response before it is sent.

LoopBack 4 does not yet provide first-class support for streaming responses, see
[Issue#2230](https://github.com/strongloop/loopback-next/issues/2230). As a
short-term workaround, controller methods are allowed to send the response
directly, effectively bypassing send action. The default implementation of send
is prepared to handle this case
[here](https://github.com/strongloop/loopback-next/blob/bf07ff959a1f90577849b61221b292d3127696d6/packages/rest/src/writer.ts#L22-L26).

### Handling errors

There are many reasons why the application may not be able to handle an incoming
request:

- The requested endpoint (method + URL path) was not found.
- Parameters provided by the client were not valid.
- A backend database or a service cannot be reached.
- The response object cannot be converted to JSON because of cyclic
  dependencies.
- A programmer made a mistake and a `TypeError` is thrown by the runtime.
- And so on.

In the Sequence implementation described above, all errors are handled by a
single `catch` block at the end of the sequence, using the Sequence Action
called `reject`.

The default implementation of `reject` does the following steps:

- Call
  [strong-error-handler](https://github.com/strongloop/strong-error-handler) to
  send back an HTTP response describing the error.
- Log the error to `stderr` if the status code was 5xx (an internal server
  error, not a bad request).

To prevent the application from leaking sensitive information like filesystem
paths and server addresses, the error handler is configured to hide error
details.

- For 5xx errors, the output contains only the status code and the status name
  from the HTTP specification. For example:

  ```json
  {
    "error": {
      "statusCode": 500,
      "message": "Internal Server Error"
    }
  }
  ```

- For 4xx errors, the output contains the full error message (`error.message`)
  and the contents of the `details` property (`error.details`) that
  `ValidationError` typically uses to provide machine-readable details about
  validation problems. It also includes `error.code` to allow a machine-readable
  error code to be passed through which could be used, for example, for
  translation.

  ```json
  {
    "error": {
      "statusCode": 422,
      "name": "Unprocessable Entity",
      "message": "Missing required fields",
      "code": "MISSING_REQUIRED_FIELDS"
    }
  }
  ```

During development and testing, it may be useful to see all error details in the
HTTP response returned by the server. This behavior can be enabled by enabling
the `debug` flag in error-handler configuration as shown in the code example
below. See strong-error-handler
[docs](https://github.com/strongloop/strong-error-handler#options) for a list of
all available options.

```ts
app.bind(RestBindings.ERROR_WRITER_OPTIONS).to({debug: true});
```

An example error message when the debug mode is enabled:

```json
{
  "error": {
    "statusCode": 500,
    "name": "Error",
    "message": "ENOENT: no such file or directory, open '/etc/passwords'",
    "errno": -2,
    "syscall": "open",
    "code": "ENOENT",
    "path": "/etc/passwords",
    "stack": "Error: a test error message\n    at Object.openSync (fs.js:434:3)\n    at Object.readFileSync (fs.js:339:35)"
  }
}
```

### Keeping your Sequences

For most use cases, the
[default](https://github.com/strongloop/loopback-next/blob/6bafa0774662991199090219913c3dc77ad5b149/packages/rest/src/sequence.ts)
sequence supplied with LoopBack 4 applications is good enough for
request-response handling pipeline. Check out
[Custom Sequences](#custom-sequences) on how to extend it and implement custom
actions.

## Working with Express middleware

{% include warning.html content="First-class support for Express middleware has
been added to LoopBack since v4.0.0 of `@loopback/rest`. Please refer to
[Using Express Middleware](Express-middleware.md). The following information
only applies to earlier versions of `@loopback/rest`." %}

Under the hood, LoopBack leverages [Express](https://expressjs.com) framework
and its concept of middleware. To avoid common pitfalls, it is not possible to
mount Express middleware directly on a LoopBack application. Instead, LoopBack
provides and enforces a higher-level structure.

In a typical Express application, there are four kinds of middleware invoked in
the following order:

1. Request-preprocessing middleware like
   [cors](https://www.npmjs.com/package/cors) or
   [body-parser](https://www.npmjs.com/package/body-parser).
2. Route handlers handling requests and producing responses.
3. Middleware serving static assets (files).
4. Error handling middleware.

In LoopBack, we handle the request in the following steps:

1. The built-in request-preprocessing middleware is invoked.
2. The registered Sequence is started. The default implementation of `findRoute`
   and `invoke` actions will try to match the incoming request against the
   following resources:
   1. Native LoopBack routes (controller methods, route handlers).
   2. External Express routes (registered via `mountExpressRouter` API)
   3. Static assets
3. Errors are handled by the Sequence using `reject` action.

Let's see how different kinds of Express middleware can be mapped to LoopBack
concepts:

### Request-preprocessing middleware

At the moment, LoopBack does not provide API for mounting arbitrary middleware,
we are discussing this feature in issues
[#1293](https://github.com/strongloop/loopback-next/issues/1293) and
[#2035](https://github.com/strongloop/loopback-next/issues/2035). Please up-vote
them if you are interested in using Express middleware in LoopBack applications.

All applications come with [cors](https://www.npmjs.com/package/cors) enabled,
this middleware can be configured via RestServer options - see
[Customize CORS](Server.md#customize-cors).

While it is not possible to add additional middleware to a LoopBack application,
it is possible to mount the entire LoopBack application as component of a parent
top-level Express application where you can add arbitrary middleware as needed.
You can find more details about this approach in
[Creating an Express Application with LoopBack REST API](express-with-lb4-rest-tutorial.md)

### Route handlers

In Express, a route handler is a middleware function that serves the response
and does not call `next()`. Handlers can be registered using APIs like
`app.get()`, `app.post()`, but also a more generic `app.use()`.

In LoopBack, we typically use [Controllers](Controller.md) and
[Route handlers](Route.md) to implement request handling logic.

To support interoperability with Express, it is also possible to take an Express
Router instance and add it to a LoopBack application as an external router - see
[Mounting an Express Router](Route.md#mounting-an-express-router). This way it
is possible to implement server endpoints using Express APIs.

### Static files

LoopBack provides native API for registering static assets as described in
[Serve static files](Application.md#serve-static-files). Under the hood, static
assets are served by [serve-static](https://www.npmjs.com/package/serve-static)
middleware from Express.

The main difference between LoopBack and vanilla Express applications: LoopBack
ensures that static-asset middleware is always invoked as the last one, only
when no other route handled the request. This is important for performance
reasons to avoid costly filesystem calls.

### Error handling middleware

In Express, errors are handled by a special form of middleware, one that's
accepting four arguments: `err`, `request`, `response`, `next`. It's up to the
application developer to ensure that error handler is registered as the last
middleware in the chain, otherwise not all errors may be routed to it.

In LoopBack, we use async functions instead of callbacks and thus can use simple
`try`/`catch` flow to receive both sync and async errors from individual
sequence actions. A typical Sequence implementation then passes these errors to
the Sequence action `reject`.

You can learn more about error handling in [Handling errors](#handling-errors).
