# @loopback/express

This package adds middleware support for LoopBack 4 and allows Express
middleware to be plugged into LoopBack seamlessly. It's used by `@loopback/rest`
to support Express middleware with `InvokeMiddleware` action within the REST
sequence.

See [documentation](https://loopback.io/doc/en/lb4/Express-middleware.html) for
more details.

## Overview

This module provides the following APIs:

- Helper

- new custom routing engine (special thanks to @bajtos)!
- tools for defining your application routes
- OpenAPI 3.0 spec (`openapi.json`/`openapi.yaml`) generation using
  `@loopback/openapi-v3`
- a default sequence implementation to manage the request and response lifecycle

## Installation

To use this package, you'll need to install `@loopback/express`.

```sh
npm i @loopback/express
```

## Basic Use

1. Adapt an Express middleware

The registration can happen in the constructor of an application.

{% include code-caption.html content="src/application.ts" %}

```ts
import morgan from 'morgan';

export class MyApplication extends RestApplication {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Register `morgan` express middleware
    this.expressMiddleware('middleware.morgan', morgan('combined'));
  }
}
```

2. Create your own middleware

The LoopBack middleware is defined as a function with the following signature:

```ts
(context: MiddlewareContext, next: Next) => ValueOrPromise<InvocationResult>;
```

It's very easy to write a simple logging middleware using `async/await`:

```ts
const log: Middleware = async (middlewareCtx, next) => {
  const {request} = middlewareCtx;
  console.log('Request: %s %s', request.method, request.originalUrl);
  try {
    // Proceed with next middleware
    await next();
    // Process response
    console.log(
      'Response received for %s %s',
      request.method,
      request.originalUrl,
    );
  } catch (err) {
    // Catch errors from downstream middleware
    console.error(
      'Error received for %s %s',
      request.method,
      request.originalUrl,
    );
    throw err;
  }
};
```

3. Use Express middleware as interceptors

With the ability to wrap Express middleware as LoopBack 4 interceptors, we can
use the same programming model to register middleware as global interceptors or
local interceptors denoted by `@intercept` decorators at class and method
levels.

The middleware interceptor function can be directly referenced by `@intercept`.

```ts
import morgan from 'morgan';
const morganInterceptor = toInterceptor(morgan('combined'));
class MyController {
  @intercept(morganInterceptor)
  hello(msg: string) {
    return `Hello, ${msg}`;
  }
}
```

It's also possible to bind the middleware to a context as a local or global
interceptor.

```ts
// Register `morgan` express middleware
// Create a middleware factory wrapper for `morgan(format, options)`
const morganFactory = (config?: morgan.Options) => morgan('combined', config);
const binding = registerExpressMiddlewareInterceptor(
  app,
  morganFactory,
  {}, // morgan options
  {
    // As a global interceptor
    global: true,
  },
);
```

For a bound local interceptor with `{global: false}`, the binding key can now be
used with `@intercept`.

```ts
@intercept('interceptors.morgan')
class MyController {
  hello(msg: string) {
    return `Hello, ${msg}`;
  }
}
```

## Contributions

- [Guidelines](https://github.com/loopbackio/loopback-next/blob/master/docs/CONTRIBUTING.md)
- [Join the team](https://github.com/loopbackio/loopback-next/issues/110)

## Tests

Run `npm test` from the root folder.

## Contributors

See
[all contributors](https://github.com/loopbackio/loopback-next/graphs/contributors).

## License

MIT
