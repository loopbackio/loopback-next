---
lang: en
title: 'Using Express middleware'
keywords: LoopBack 4.0, LoopBack 4, Express, Middleware
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Express-middleware.html
---

## Overview

Express is the most popular web framework for Node.js developers. As quoted
below from the
[Express web site](https://expressjs.com/en/guide/using-middleware.html),
middleware are the basic building blocks for Express applications.

> Express is a routing and middleware web framework that has minimal
> functionality of its own: An Express application is essentially a series of
> middleware function calls.

LookBack 4 leverages Express behind the scenes for its REST server
implementation. We decided to not expose middleware capabilities to users while
we pursue an elegant and non-invasive way to fit Express middleware into the
LoopBack 4 programming model nicely. Meanwhile, we have received various
requests and questions from our users on how to use Express middleware with
LoopBack 4 or migrate their usage of Express middleware from LoopBack 3 to
LoopBack 4.

## Use cases

The following use cases are identified to allow Express middleware to work with
LoopBack 4:

### For application developers

1. Invoke one or more Express middleware handler functions in the REST sequence
   before, after, or between existing actions.
2. Apply Express middleware globally to all controllers, or locally to certain
   controller classes and methods.
3. Migrate LoopBack 3 applications that use Express middleware
4. Be able to separate Express middleware configuration from its registration
   and allow configuration changes at runtime to be effective without restarting
   the application.

### For extension developers

1. Allow new actions to be added to the REST sequence without requiring code
   changes to the application as long as the extension component is mounted to
   the application. For example, `@loopback/authentication` contributes an
   `Authenticate` action. It should be possible to build an extension module for
   [`Helmet`](https://helmetjs.github.io/) to provide better protection for
   LoopBack.
2. Allow actions to be invoked in a configurable order.
3. Allow extensions to leverage LoopBack's dependency injection and extension
   point/extension capabilities.

Let's start with a few examples to illustrate how we can bring Express
middleware to LoopBack applications with minimal effort.

## Use Express middleware within the sequence of actions

Express middleware can now be plugged into the REST sequence with an
`InvokeMiddleware` action being injected to the default sequence.

### Invoke Express middleware explicitly in the sequence

The custom sequence class below invokes two Express middleware
([`helmet`](https://helmetjs.github.io/) and
[`morgan`](https://github.com/expressjs/morgan)) handler functions as the first
step.

{% include code-caption.html content="src/sequence.ts" %}

```ts
import helmet from 'helmet'; // For security
import morgan from 'morgan'; // For http access logging

const middlewareList: ExpressRequestHandler[] = [
  helmet({}), // options for helmet is fixed and cannot be changed at runtime
  morgan('combined', {}), // options for morgan is fixed and cannot be changed at runtime
];

export class MySequence extends DefaultSequence {
  async handle(context: RequestContext): Promise<void> {
    try {
      const {request, response} = context;
      // `this.invokeMiddleware` is an injected function to invoke a list of
      // Express middleware handler functions
      const finished = await this.invokeMiddleware(context, middlewareList);
      if (finished) {
        // The http response has already been produced by one of the Express
        // middleware. We should not call further actions.
        return;
      }
      const route = this.findRoute(request);
      const args = await this.parseParams(request, route);
      const result = await this.invoke(route, args);

      this.send(response, result);
    } catch (error) {
      this.reject(context, error);
    }
  }
}
```

### Register Express middleware to be executed by `InvokeMiddleware` actions

While the explicit Express middleware invocation is easy and simple, there are
some limitations.

1. The list of Express middleware has to be hard-coded in `src/sequence.ts`.
   It's not easy to plug in a new middleware.
2. The configuration of Express middleware is fixed unless we use dependency
   injections for such values in `src/sequence.ts`.

We provide another option to make invocation of Express middleware more flexible
and extensible. The `InvokeMiddleware` actions within the sequence can discover
registered middleware and invoke them in a chain.

We first register middleware against the default or a named chain using APIs
from `RestApplication`. It can happen in the constructor of an application.

{% include code-caption.html content="src/application.ts" %}

```ts
import morgan from 'morgan';
import {ApplicationConfig} from '@loopback/core';
import {RestApplication} from '@loopback/rest';

export class MyApplication extends RestApplication {
  constructor(config: ApplicationConfig) {
    this.expressMiddleware(
      morgan,
      {}, // default config
      {
        // Allow configuration to be injected to allow dynamic changes to
        // morgan logging by configuring `middleware.morgan` to a new value
        injectConfiguration: 'watch',
        key: 'middleware.morgan',
      },
    );
  }
}
```

## Use Express middleware as interceptors for controllers

The LoopBack global and local interceptors now also serve as an avenue to attach
middleware logic to specific points of controller invocations, such as global,
class, or method levels.

There are a few options to wrap an Express middleware module into an LoopBack 4
interceptor.

- toInterceptor: wraps an Express handler function to a LoopBack interceptor
  function
- createInterceptor: creates a LoopBack interceptor function from an Express
  factory function with configuration
- defineInterceptorProvider: creates a LoopBack provider class for interceptors
  from an Express factory function with configuration. This is only necessary
  that injection and/or change of configuration is needed. The provider class
  then needs to be bound to the application context hierarchy as a global or
  local interceptor.

Let's walk through a few examples:

### Adapt an Express middleware handler function to an interceptor

If the Express middleware only exposes the handler function without a factory or
a single instance is desired, use `toInterceptor`.

```ts
import {toInterceptor} from '@loopback/express';
import morgan from 'morgan';

const morganInterceptor = toInterceptor(morgan('combined'));
```

### Create an interceptor from Express middleware factory function and configuration

When the Express middleware module exports a factory function that takes an
optional argument for configuration, use `createInterceptor`.

```ts
import {createInterceptor} from '@loopback/express';
import helmet, {IHelmetConfiguration} from 'helmet';
const helmetConfig: IHelmetConfiguration = {};
const helmetInterceptor = createInterceptor(helmet, helmetConfig);
```

If the Express middleware module does not expose a factory function conforming
to the `ExpressMiddlewareFactory` signature, a wrapper can be created. For
example:

```ts
import morgan from 'morgan';

// Register `morgan` express middleware
// Create a middleware factory wrapper for `morgan(format, options)`
const morganFactory = (config?: morgan.Options) => morgan('combined', config);
```

### Define a provider class for middleware-based interceptor

It's often desirable to allow dependency injection of middleware configuration
for the middleware. We can use `defineInterceptorProvider` to simplify
definition of such provider classes.

```ts
import {defineInterceptorProvider} from '@loopback/express';
import helmet, {IHelmetConfiguration} from 'helmet';

const helmetProviderClass = defineInterceptorProvider<IHelmetConfiguration>(
  helmet,
  {}, // default config
);
```

Alternatively, we can create a subclass of
`ExpressMiddlewareInterceptorProvider`.

```ts
import {config} from '@loopback/context';
import {
  ExpressMiddlewareInterceptorProvider,
  createMiddlewareInterceptorBinding,
} from '@loopback/express';
import helmet, {IHelmetConfiguration} from 'helmet';

class HelmetInterceptorProvider extends ExpressMiddlewareInterceptorProvider<
  IHelmetConfiguration
> {
  constructor(@config() helmetConfig?: IHelmetConfiguration) {
    super(helmet, helmetConfig);
  }
}
```

The provider class can then be registered to the application. For example, the
code below can be used in the constructor of your `Application` subclass.

```ts
const binding = createMiddlewareInterceptorBinding(HelmetInterceptorProvider);
this.add(binding);
```

### Apply Express middleware as invocation interceptors

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
import helmet, {IHelmetConfiguration} from 'helmet';
const binding = registerExpressMiddlewareInterceptor(
  app,
  helmet,
  {},
  {
    // As a global interceptor
    global: true,
    key: 'interceptors.helmet',
  },
);
```

For a bound local interceptor, the binding key can now be used with
`@intercept`.

```ts
@intercept('interceptors.helmet')
class MyController {
  hello(msg: string) {
    return `Hello, ${msg}`;
  }
}
```

### Use `lb4 interceptor` command to create interceptors for Express middleware

The `lb4 interceptor` can be used to generate a skeleton implementation of
global or local interceptors. We can update the generated code to plug in
Express middleware. For example, to add
[helmet](https://github.com/helmetjs/helmet) as the security middleware:

```sh
lb4 interceptor
? Interceptor name: Helmet
? Is it a global interceptor? Yes
? Group name for the global interceptor: ('') middleware
   create src/interceptors/helmet.interceptor.ts
   update src/interceptors/index.ts

Interceptor Helmet was created in src/interceptors/
```

Let's update `src/interceptors/helmet.interceptor.ts:

```ts
import {config, globalInterceptor} from '@loopback/core';
import helmet, {IHelmetConfiguration} from 'helmet';
import {ExpressMiddlewareInterceptorProvider} from '@loopback/express';

@globalInterceptor('middleware', {tags: {name: 'Helmet'}})
export class MorganInterceptor extends ExpressMiddlewareInterceptorProvider<
  IHelmetConfiguration
> {
  constructor(
    @config()
    options: IHelmetConfiguration = {
      hidePoweredBy: true,
    },
  ) {
    super(helmet, options);
  }
}
```

## What's behind the scenes

`Middleware` and `Interceptor` are key concepts that allow Express middleware
into LoopBack seamlessly. Please read the following pages to better understand
the architecture.

- [Interceptors](Interceptors.md)
- [Middleware](Middleware.md)
