---
lang: en
title: 'Working with Express Middleware'
keywords:
  LoopBack 4.0, LoopBack 4, Node.js, TypeScript, OpenAPI, Express Middleware
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Working-with-express-middleware.html
---

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

```

```
