# @loopback/express-middleware

[Express middleware](https://expressjs.com/en/guide/using-middleware.html) are
key building blocks for Express applications. Simple APIs are provided by
Express to set up middleware. It works for applications where the middleware
chain registration can be centralized, such as:

```js
app.use(middlewareHandler1);
app.use(middlewareHandler2);
// ...
app.use(middlewareHandlerN);
```

The middleware handlers will be executed by Express in the order of `app.use()`
is called. There are obvious limitations of this approach if your application
allows multiple modules to contribute middleware.

1. It's hard to align middleware in the right order
2. It's hard to separate configuration of middleware

This module introduces a simple extension that utilizes LoopBack 4's inversion
of controller (Ioc) dependency injection (DI) container offered by
`@loopback/context`.

## Overview

We introduce `MiddlewareRegistry` to manage middleware registration and provide
a handler function for Express applications.

1. `MiddlewareRegistry` allows us to bind middleware handlers with optional
   settings such as `path` and `phase` as tags. Each binding is tagged with
   `middleware` so that it can be discovered.

2. `MiddlewareRegistry` sorts the middleware entries using `phase`. The order of
   phases can be configured.

3. `MiddlewareRegistry` exposes `requestHandler` function which is an Express
   middleware handler function that can be mounted to Express applications.

4. `MiddlewareRegistry` observes binding events to keep track of latest list of
   middleware and rebuilds the chain if necessary.

## Installation

To use this package, you'll need to install `@loopback/express-middleware`.

```sh
npm i @loopback/express-middleware
```

## Basic Use

### Register middleware handler

Handler functions compatible with Express middleware can be registered as
follows:

```ts
const middlewareRegistry = new MiddlewareRegistry();
middlewareRegistry.middleware(cors(), {phase: 'cors'});
const helloRoute: RequestHandler = (req, res, next) => {
  res.setHeader('content-type', 'text/plain');
  res.send('Hello world!');
};
middlewareRegistry.middleware(helloRoute, {phase: 'route', path: '/api'});
```

Please note we allow `phase` to be set for a given middleware.

### Register middleware provider class

To leverage dependency injection, middleware can be wrapped as a provider class.
For example:

```ts
@middleware({phase: 'log', name: 'logger'})
class LogMiddlewareProvider implements Provider<RequestHandler> {
  constructor(
    @config()
    private options: Record<string, string> = {},
  ) {}

  value(): RequestHandler {
    /** We use wrap existing express middleware here too
     * such as:
     * const m = require('existingExpressMiddleware');
     * return m(this.options);
     */
    return (req, res, next) => {
      recordReq(req, this.options.name || 'logger');
      next();
    };
  }
}
```

Then it can be configured and registered to the express context:

```ts
middlewareRegistry.middlewareProvider(LogMiddlewareProvider);
middlewareRegistry.configure('middleware.logger').to({name: 'my-logger'});
```

### Mount to Express application

```ts
const expressApp = express();
expressApp.use(middlewareRegistry.requestHandler);
```

## Contributions

- [Guidelines](https://github.com/strongloop/loopback-next/blob/master/docs/CONTRIBUTING.md)
- [Join the team](https://github.com/strongloop/loopback-next/issues/110)

## Tests

Run `npm test` from the root folder.

## Contributors

See
[all contributors](https://github.com/strongloop/loopback-next/graphs/contributors).

## License

MIT
