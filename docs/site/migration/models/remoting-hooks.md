---
lang: en
title: 'Migrating remoting hooks'
keywords: LoopBack 4.0, LoopBack 4, LoopBack 3, Migration
sidebar: lb4_sidebar
permalink: /doc/en/lb4/migration-models-remoting-hooks.html
---

## Introduction

In LoopBack 3, a [Remote hook](../../../lb3/Remote-hooks.md) enables you to
execute a function before or after a remote method is called by a client:

- `beforeRemote()` runs before the remote method.
- `afterRemote()` runs after the remote method has finished successfully.
- `afterRemoteError()` runs after the remote method has finished with an error.

Hooks can be configured to run for one or more methods using a wildcard
specifier. In general, there are three kinds of hook scopes:

- **Global hooks** are executed for _every_ remote method.

  These hooks are registered on the application object using a `**` wildcard.
  For example:

  ```js
  app.beforeRemote('**', handlerFn);
  ```

- **Model level hooks** are executed for every remote method of a given model
  class.

  These hooks are typically registered on the application object using
  `{model-name}.**` wildcard. For example, to run a hook for all methods of the
  `User` model:

  ```js
  app.beforeRemote('User.**', handlerFn);
  ```

- **Method level hooks** are executed only for a single method of a given model
  class.

  These hooks are typically registered on the model class. For example, to run a
  hook whenever `User.login` is called remotely:

  ```js
  User.beforeRemote('login', handlerFn);
  ```

LoopBack 4 provides [Interceptors](../../Interceptors.md) feature to enable
application developers to implement similar functionality.

- [**Global interceptors**](../../Interceptors.md#global-interceptors) are
  executed for _every_ request handled by a LoopBack 4 controller method or a
  LoopBack 4 route handler. They correspond to LoopBack 3 **global hooks**.
- [**Class level interceptors**](../../Interceptors.md#class-level-interceptors)
  are executed for requests handled by the given
  [Controller](../../Controllers.md) class. They correspond to LoopBack 3
  **model level hooks**.
- [**Method level interceptors**](../../Interceptors.md#method-level-interceptors)
  are executed only for request handled by the given controller method. They
  correspond to LoopBack 3 **method level hooks**.

{% include note.html content=" In LoopBack 3, a model class has three
responsibilities: a model describing shape of data, a repository providing
data-access APIs, and a controller implementing REST API. Both remoting hooks
(invoked by REST layer) and operation hooks (invoked by ORM/data-access layer)
are registered for models.

In LoopBack 4, the REST API is implemented by controllers that are decoupled
from models, therefore interceptors are registered and invoked on controller
classes/methods, not on model classes/methods. " %}

In the following sections, we will first explain how to rewrite a LoopBack 3
hook implementation to a LoopBack 4 interceptor implementation. Then we show how
to create interceptors replacing LoopBack 3 remoting hooks registered at global,
model (class) level and method level.

## Rewriting a LoopBack 3 hook to a LoopBack 4 interceptor

Let's take a look at a typical implementation of a LoopBack 4 interceptor:

```ts
async function intercept(
  invocationCtx: InvocationContext,
  next: () => ValueOrPromise<InvocationResult>,
) {
  try {
    // Add pre-invocation logic here
    const result = await next();
    // Add post-invocation logic here
    return result;
  } catch (err) {
    // Add error handling logic here
    throw err;
  }
}
```

Every interceptor contains three parts, each corresponding to one of the
remoting hooks:

- Code from a `beforeRemote` hook belongs to the first section that's executed
  before the target method is invoked.
- Code from an `afterRemote` hook belongs to the second section.
- Code from an `afterRemoteError` hook belongs to the third section inside the
  `catch` block.

{% include tip.html content=" In LoopBack 3, hooks can be written in one of the
following three styles:

- A function accepting a callback as the last argument.
- A function returning a promise, often using
  [Bluebird](http://bluebirdjs.com/docs/getting-started.html) APIs.
- An async function using `await` statements for asynchronous flow control.

In LoopBack 4, interceptors are written as async functions using `await`
statements. "%}

### Example: from a hook to an interceptor

Consider the following set of LoopBack 3 remoting hooks implementing a very
simple request logger. We are registering the hooks at global level to keep this
example simple, but the same approach works for model level and method level
hooks too.

```js
app.beforeRemote('**', function logBefore(ctx, next) {
  console.log('About to invoke a method.');
  next();
});

app.afterRemote('**', function logAfter(ctx, next) {
  console.log('Method finished.');
  next();
});

app.afterRemoteError('**', function logAfterError(ctx, next) {
  console.log('Method failed: ', ctx.error);
});
```

These three hooks can be converted into a single interceptor in LoopBack 4.

```ts
try {
  // Add pre-invocation logic here
  // Code from beforeRemote hooks go here
  console.log('About to invoke a method.');
  const result = await next();
  // Add post-invocation logic here
  // Code from afterRemote hooks go here
  console.log('Method finished.');
  return result;
} catch (err) {
  // Add error handling logic here
  // Code from afterRemoteError hooks go here
  console.log('Method failed: ', err);
  throw err;
}
```

The example above is intentionally simple and does not access any data from the
context argument. See [Accessing context data](#accessing-context-data) for
instructions on how to map LoopBack 3 context properties to LoopBack 4.

## Migrating global hooks

Global remoting hooks should be rewritten to
[global interceptors](../../Interceptors.md#global-interceptors). You can use
[Interceptor generator CLI](../../Interceptor-generator.md) to create the
necessary infrastructure for each hook.

First, run `lb4 interceptor` to create a new interceptor. Pick an interceptor
name (e.g. `GlobalLogger`) and make sure to ask the generator to scaffold a
global interceptor. You can pick an empty interceptor group (`''`) when
prompted.

```
$ lb4 interceptor
? Interceptor name: GlobalLogger
? Is it a global interceptor? Yes

Global interceptors are sorted by the order of an array of group names
bound to ContextBindings.GLOBAL_INTERCEPTOR_ORDERED_GROUPS.
See https://loopback.io/doc/en/lb4/Interceptors.md#order-of-invocation-for-interceptors.

? Group name for the global interceptor: ('')
  create src/interceptors/global-logger.interceptor.ts
  update src/interceptors/index.ts

Interceptor GlobalLogger was created in src/interceptors/
```

Next, open the generated interceptor file and replace the default implementation
of `intercept` method with the code adopted from your original LoopBack 3 hooks,
as explained in
[Rewriting a LoopBack 3 hook to a LoopBack 4 interceptor](#rewriting-a-loopback-3-hook-to-a-loopback-4-interceptor).
See [Accessing context data](#accessing-context-data) for instructions on how to
map LoopBack 3 context properties to LoopBack 4.

## Migrating model level hooks

Model level hooks should be rewritten to
[class interceptors](../../Interceptors.md#class-level-interceptors). You can
use [Interceptor generator CLI](../../Interceptor-generator.md) to create the
necessary infrastructure for each hook.

{% include tip.html content=" In LoopBack 3, we use the term _model level_ hook,
while in LoopBack 4 we use the term _class level_ interceptor. " %}

First, run `lb4 interceptor` to create a new interceptor. Pick an interceptor
name (e.g. `ProductLogger`) and make sure to ask the generator to scaffold a
non-global interceptor.

```
$ lb4 interceptor
? Interceptor name: ProductLogger
? Is it a global interceptor? No
   create src/interceptors/product-logger.interceptor.ts
   update src/interceptors/index.ts

Interceptor ProductLogger was created in src/interceptors/
```

Next, open the generated interceptor file and replace the default implementation
of `intercept` method with the code adopted from your original LoopBack 3 hooks,
as explained in
[Rewriting a LoopBack 3 hook to a LoopBack 4 interceptor](#rewriting-a-loopback-3-hook-to-a-loopback-4-interceptor).
See [Accessing context data](#accessing-context-data) for instructions on how to
map LoopBack 3 context properties to LoopBack 4.

Finally, register the new interceptor to be invoked for all methods of the
target controller class.

For example:

```ts
import {inject, intercept} from '@loopback/core';
// ...

@intercept(ProductLoggerInterceptor.BINDING_KEY)
export class ProductController {
  // ...
}
```

## Migrating method level hooks

Method level hooks should be rewritten to
[method interceptors](../../Interceptors.md#method-level-interceptors). You can
use [Interceptor generator CLI](../../Interceptor-generator.md) to create the
necessary infrastructure for each hook.

First, run `lb4 interceptor` to create a new interceptor. Pick an interceptor
name (e.g. `CreationLogger`) and make sure to ask the generator to scaffold a
non-global interceptor.

```
$ lb4 interceptor
? Interceptor name: CreationLogger
? Is it a global interceptor? No
   create src/interceptors/creation-logger.interceptor.ts
   update src/interceptors/index.ts

Interceptor CreationLogger was created in src/interceptors/
```

Next, open the generated interceptor file and replace the default implementation
of `intercept` method with the code adopted from your original LoopBack 3 hooks,
as explained in
[Rewriting a LoopBack 3 hook to a LoopBack 4 interceptor](#rewriting-a-loopback-3-hook-to-a-loopback-4-interceptor).
See [Accessing context data](#accessing-context-data) for instructions on how to
map LoopBack 3 context properties to LoopBack 4.

Finally, register the new interceptor to be invoked for the selected methods of
the target controller class.

For example:

```ts
import {inject, intercept} from '@loopback/core';
// ...

export class ProductController {
  // ...

  @intercept(CreationLoggerInterceptor.BINDING_KEY)
  @post('/todos', {
    responses: {
      '200': {
        description: 'Todo model instance',
        content: {'application/json': {schema: getModelSchemaRef(Todo)}},
      },
    },
  })
  async create(/*...*/): Promise<Product> {
    // ...
  }
}
```

## Accessing context data

In LoopBack 3, a remoting hook receives a context object providing:

- Transport-specific data like the HTTP request & response objects.
- Transport-independent data, for example the array of input arguments for the
  remote method and the result of remote method invocation.

In LoopBack 4, interceptors receive an instance of `InvocationContext` class.
This class is similar to LoopBack 3 remoting context in the sense that it holds
different pieces of data related to method invocation, but it's also different
in the way how these properties are accessed.

LoopBack 3 uses regular property access, for example `ctx.req` is used to access
the current HTTP request.

In LoopBack 4, `InvocationContext` is a part of [Context](../../Context.md)
hierarchy starting from application level context, including request level
context and finally the invocation context.

Invocation-specific properties can be accessed directly on the invocation
context object, see
[InvocationContext API docs](../../apidocs/context.invocationcontext.md) for the
complete list. Other context properties (e.g. the current HTTP request) are
usually accessed via
[Dependency Injection](../../decorators/Decorators_inject.md).

For example, the current HTTP request can be accessed as follows:

```ts
// other imports skipped for brevity
import {Request, RestBindings} from '@loopback/rest';

export class LoggingInterceptor implements Provider<Interceptor> {
  constructor(@inject(RestBindings.Http.REQUEST) private request: Request) {}

  // ...

  async intercept(
    invocationCtx: InvocationContext,
    next: () => ValueOrPromise<InvocationResult>,
  ) {
    console.log('%s %s', this.request.method, this.request.url);
    return next();
  }
}
```

### Context properties

The following table maps commonly used LoopBack 3 context properties to their
LoopBack 4 counter-parts.

| LoopBack 3            | LoopBack 4                                                          |
| --------------------- | ------------------------------------------------------------------- |
| `ctx.req`             | inject `RestBindings.Http.REQUEST`                                  |
| `ctx.res`             | inject `RestBindings.Http.RESPONSE`                                 |
| `ctx.args`            | `invocationCtx.args`                                                |
| `ctx.result`          | the value returned by `await next()`                                |
| `ctx.error`           | use `catch` to receive errors thrown by `await next()`              |
| `ctx.req.accessToken` | see [Accessing the current user](#accessing-the-current-user) below |
| `ctx.methodString`    | `invocationCtx.targetName`                                          |

## Modifying request parameters

It is possible to modify arguments passed to the controller method before the
method is invoked.

{% include warning.html content="
If your interceptor is registered for more than a single method, then extra care
is needed to ensure your interceptor is making valid assumptions about the arguments
accepted by the target controller method.
" %}

Consider the following LoopBack 3 remoting hook executed for `Comment.create`
method to add `postedFromIpAddress` field to every new comment posted:

```js
Comment.afterRemote('create', function(ctx, next) {
  ctx.args[0].postedFromIpAddress = ctx.req.remoteAddress;
  next();
});
```

This remoting hook can be rewritten to a LoopBack 4 interceptor as follows:

```ts
class AddRemoteAddressInterceptor implements Provider<Interceptor> {
  constructor(@inject(RestBindings.Http.REQUEST) private request: Request) {}

  // ...

  async intercept(
    invocationCtx: InvocationContext,
    next: () => ValueOrPromise<InvocationResult>,
  ) {
    invocationCtx.args[0].postedFromIpAddress = this.request.socket.remoteAddress;
    return next();
  }
}
```

## Modifying the response

You can transform the value returned by `await next()` before returning it from
the interceptor, thus modifying the final response returned to the client.

Consider the following example from LoopBack 3 documentation:

```js
// prevent password hashes from being sent to clients
Customer.afterRemote('**', function(ctx, user, next) {
  if (ctx.result) {
    if (Array.isArray(ctx.result)) {
      ctx.result.forEach(function(result) {
        result.unsetAttribute('password');
      });
    } else {
      ctx.result.unsetAttribute('password');
    }
  }

  next();
});
```

This remoting hook can be rewritten to a LoopBack 4 interceptor as follows:

```ts
async function intercept(
  invocationCtx: InvocationContext,
  next: () => ValueOrPromise<InvocationResult>,
) {
  const result = await next();
  if (Array.isArray(result)) {
    result.forEach(it => delete it.password);
  } else {
    delete result.password;
  }
  return result;
}
```

## Rejecting requests

In order to reject a request and return an error HTTP response, just throw an
error from your interceptor. As explained in
[Handling errors in controllers](../../Controllers.md#handling-errors-in-controllers),
you can use one of `HttpErrors` constructors to control the HTTP status code of
the response.

Consider the following LoopBack 3 example rejecting requests from non-local
addresses:

```js
Customer.beforeRemote('**', function(ctx, next) {
  if (ctx.req.remoteAddress !== '127.0.0.1') {
    next(new HttpErrors.Forbidden());
  } else {
    next();
  }
});
```

This remoting hook can be rewritten to a LoopBack 4 interceptor as follows:

```ts
class AddRemoteAddressInterceptor implements Provider<Interceptor> {
  constructor(@inject(RestBindings.Http.REQUEST) private request: Request) {}

  // ...

  async intercept(
    invocationCtx: InvocationContext,
    next: () => ValueOrPromise<InvocationResult>,
  ) {
    if (this.request.socket.remoteAddress !== '127.0.0.1') {
      throw new HttpErrors.Forbidden();
    }
    return next();
  }
}
```

## Accessing the current user

LoopBack 4 does not provide authentication layer out of the box; it relies on
extensions to implement authentication features. Please refer to the
documentation for your authentication component to learn how to access data
about the current user.

If you are using the official
[LoopBack Authentication Extension](../../Loopback-component-authentication.md),
then you can access profile of the currently authenticated user via the binding
`SecurityBindings.USER`.

Please note the value for the binding may be bound later in the request handling
cycle, therefore it's best to use `@inject.getter()` to defer resolution of the
value until the intercept method is invoked.

Consider the following LoopBack 3 example printing a warning whenever an
anonymous (unauthenticated) request is made:

```js
Customer.beforeRemote('*.save', function(ctx, unused, next) {
  if (!ctx.req.accessToken) {
    console.warn('anonymous request!');
  }
  next();
});
```

This remoting hook can be rewritten to a LoopBack 4 interceptor as follows:

```ts
class WarnAnonymousInterceptor implements Provider<Interceptor> {
  constructor(
    @inject.getter(SecurityBindings.USER, {optional: true})
    private getCurrentUser: Getter<UserProfile>,
  ) {}

  async intercept(
    invocationCtx: InvocationContext,
    next: () => ValueOrPromise<InvocationResult>,
  ) {
    const currentUser = await this.getCurrentUser();
    if (!currentUser) {
      console.warn('anonymous request!');
    }
    return next();
  }
}
```

Please note the current user must be injected as an optional value, because the
value is available for authenticated endpoints only. In a typical application,
not all endpoints are decorated with the `@authenticate` decorator. If you leave
the injection as required (that's the default), then you will get a binding
error when an unauthenticated endpoint is accessed. See
[Using the Authentication Decorator](../../Loopback-component-authentication.md#using-the-authentication-decorator)
for more details.
