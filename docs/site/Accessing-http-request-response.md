---
lang: en
title: 'Accessing HTTP request and response objects'
keywords: LoopBack 4.0, LoopBack 4, Node.js, TypeScript, OpenAPI
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Accessing-http-request-response.html
---

## Accessing HTTP request and response objects

To build REST APIs with LoopBack, it's highly recommended for applications to
not directly manipulate HTTP (Express) request/response objects. Instead, we
should use OpenAPI decorators to:

1. Describe operation parameters and body so that such values will be injected
   as part of request processing.

2. Return a value or promise for the response so that the framework can
   serialize it into HTTP responses.

For example:

```ts
import {get} from '@loopback/rest';
import {inject} from '@loopback/core';

export class PingController {
  constructor() {}

  // Map to `GET /ping`
  @get('/ping', {
    responses: {
      '200': {
        description: 'Ping Response',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              title: 'PingResponse',
              properties: {
                greeting: {type: 'string'},
                date: {type: 'string'},
              },
            },
          },
        },
      },
    },
  })
  ping(@param.query.string('message') msg: string): object {
    return {
      greeting: `[Pong] ${msg}`,
      date: new Date(),
    };
  }
}
```

There are obvious benefits to stick with the best practice:

1. Allow validation of input/output based on OpenAPI specs.
2. Allow strongly-typed access to input/output data.

But for some use cases, it's still desirable to access HTTP request and response
objects, as most Express middleware and routes do. Here are some examples:

- Access request headers that are not described by the OpenAPI spec
- Access the request stream
- Set status code of responses
- Set extra response headers that are not described by the OpenAPI spec

{% include note.html content="
Eventually, we would like to implement first-class
support for controllers to set response status code and headers without having
to access the Express response object. The feature request is tracked by
[github issue #436](https://github.com/loopbackio/loopback-next/issues/436)
" %}

In `@loopback/rest`, we wrap Express HTTP request/response into a
[`RequestContext`](https://loopback.io/doc/en/lb4/apidocs.rest.requestcontext.html)
object and bind it to
[`RestBindings.Http.CONTEXT`](https://loopback.io/doc/en/lb4/apidocs.rest.restbindings.http.html)
key. This makes it possible to access Express request/response objects via
dependency injection for controllers, services, and other artifacts.

### Inject HTTP request

The [Express/Http request object](http://expressjs.com/en/4x/api.html#req) can
be injected via `RestBindings.Http.REQUEST`.

```ts
import {Request, RestBindings} from '@loopback/rest';
import {inject} from '@loopback/core';

export class PingController {
  constructor(@inject(RestBindings.Http.REQUEST) private request: Request) {}

  ping(): object {
    // Access the request object via `this.request`
    const = url: this.request.url,
    const headers = {...this.request.headers};
    // ...
  }
}
```

In order to receive injection of `RestBinding.Http.REQUEST`,
`RestBinding.Http.RESPONSE`, or `RestBinding.Http.CONTEXT`, the controller class
needs to have binding scope set to `BindingScope.TRANSIENT` (which is the
default if not set). Alteratively, a controller can receive HTTP
request/response/context objects via method parameter injection.

```ts
import {Request, RestBindings} from '@loopback/rest';
import {injectable, inject, BindingScope} from '@loopback/core';

@injectable({scope: BindingScope.SINGLETON})
export class PingController {

  ping(
    // Inject via
    @inject(RestBindings.Http.REQUEST) request: Request,
  ): object {
    // Access the request object via `request`
    const = url: request.url,
    const headers = {...request.headers};
    // ...
  }
}
```

### Inject HTTP response

The [Express/Http response object](http://expressjs.com/en/4x/api.html#res) can
be injected via `RestBindings.Http.RESPONSE`.

```ts
import {Response, RestBindings} from '@loopback/rest';
import {inject} from '@loopback/core';

export class PingController {
  constructor(@inject(RestBindings.Http.RESPONSE) private response: Response) {}

  @get('/ping')
  ping(): Response {
    // Access the response object via `this.response`
    this.response.status(200).send({
      greeting: 'Hello from LoopBack',
      date: new Date(),
    });
    // Return the HTTP response object so that LoopBack framework skips the
    // generation of HTTP response
    return this.response;
  }

  @get('/header')
  header(): string {
    // Set custom http response header
    this.response.set('x-custom-res-header', 'xyz');
    return 'Hello';
  }
}
```

### Inject HTTP request context

The Express/Http request/response object can be injected via
`RestBindings.Http.CONTEXT`.

```ts
import {RequestContext, RestBindings} from '@loopback/rest';
import {inject} from '@loopback/core';

export class PingController {
  constructor(
    @inject(RestBindings.Http.CONTEXT) private requestCtx: RequestContext,
  ) {}

  ping(): Response {
    const {request, response} = this.requestCtx;
    this.response.status(200).send({
      greeting: 'Hello from LoopBack',
      date: new Date(),
      url: this.req.url,
      headers: Object.assign({}, this.req.headers),
    });
    // Return the HTTP response object so that LoopBack framework skips the
    // generation of HTTP response
    return response;
  }
}
```

### Use middleware to access HTTP request/response

[REST middleware-based sequence](https://loopback.io/doc/en/lb4/REST-middleware-sequence.html)
allows middleware to access HTTP request context as follows:

```ts
import {Middleware, MiddlewareContext} from '@loopback/rest';
import {debugFactory} from 'debug';
import {v1} from 'uuid';
const trace = debugFactory('trace:request-response');

/**
 * An middleware for tracing HTTP requests/responses
 * @param ctx - Context object
 * @param next - Downstream middleware/handlers
 */
export const tracingMiddleware: Middleware = async (ctx, next) => {
  setupRequestId(ctx);
  const {request, response} = ctx;
  try {
    if (trace.enabled) {
      const reqObj = {
        method: request.method,
        originalUrl: request.originalUrl,
        headers: request.headers,
        // Body is not available yet before `parseParams`
      };
      trace('Request: %s', reqObj);
    }
    const result = await next();
    if (trace.enabled) {
      const resObj = {
        statusCode: response.statusCode,
        headers: response.getHeaders(),
      };
      trace('Response: %s', resObj);
    }
    return result;
  } catch (err) {
    if (trace.enabled) {
      trace('Error: %s', err);
    }
    throw err;
  }
};

function setupRequestId(ctx: MiddlewareContext) {
  let requestId = ctx.request?.get('X-Request-ID');
  debug(
    'RequestID for %s %s: %s',
    ctx.request.method,
    ctx.request.originalUrl,
    requestId,
  );
  if (requestId == null) {
    requestId = v1();
    debug(
      'A new RequestID is generated for %s %s: %s',
      ctx.request.method,
      ctx.request.originalUrl,
      requestId,
    );
  }

  // Bind `request.id` so that it is available for injection in downstream
  // controllers/services
  ctx.bind('request.id').to(requestId);
}
```

## Using interceptors to access HTTP request/response

[Interceptors](Interceptor.md) can access HTTP request context as follows:

```ts
import {Interceptor, InvocationContext} from '@loopback/core';
import {RestBinding} from '@loopback/rest';

/**
 * An interceptor to access HTTP requests/responses
 * @param ctx - Invocation Context object
 * @param next - Downstream interceptors
 */
export const myInterceptor: Interceptor = async (ctx, next) => {
  const reqCtx = await ctx.get(RestBinding.Http.CONTEXT);
  // ...
};
```

Interceptors can be wrapped into a provider class to allow dependency injections
so that http request/response/context objects can be injected as follows:

```ts
export class MyInterceptorProvider implements Provider<Middleware> {
  constructor(
    @inject(RestBindings.Http.CONTEXT) private requestCtx: RequestContext,
  ) {}

  value(): Interceptor {
    return async (ctx, next) => {
      // Access RequestContext via `this.requestCtx`
      // ...
    };
  }
}
```
