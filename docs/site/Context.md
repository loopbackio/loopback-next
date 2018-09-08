---
lang: en
title: 'Context'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Context.html
---

## What is Context?

- An abstraction of all state and dependencies in your application
- LoopBack uses context to manage everything
- A global registry for anything/everything in your app (all configs, state,
  dependencies, classes, etc)
- An [inversion of control](https://en.wikipedia.org/wiki/Inversion_of_control)
  container used to inject dependencies into your code

### Why is it important?

- You can use the context as a way to give loopback more "info" so that other
  dependencies in your app may retrieve it. It works as a centralized place/
  global built-in/in-memory storage mechanism.
- LoopBack can help "manage" your resources automatically (through
  [Dependency Injection](Dependency-injection.md) and decorators).
- You have full access to updated/real-time application and request state at all
  times.

## How to create a context?

A context can be created with an optional parent and an optional name. If the
name is not provided, a UUID will be generated as the value. Context instances
can be chained using the `parent` to form a hierarchy. For example, the code
below creates a chain of three contexts: `reqCtx -> serverCtx -> rootCtx`.

```ts
import {Context} from '@loopback/context';

const rootCtx = new Context('root-ctx'); // No parent
const serverCtx = new Context(rootCtx, 'server-ctx'); // rootCtx as the parent
const reqCtx = new Context(serverCtx); // No explicit name, a UUID will be generated
```

LoopBack's context system allows an unlimited amount of Context instances, each
of which may have a parent Context.

An application typically has three "levels" of context: application-level,
server-level, and request-level.

## Application-level context (global)

- Stores all the initial and modified app states throughout the entire life of
  the app (while the process is alive)
- Generally configured when the application is created (though the context may
  be modified while running)

Here is a simple example:

```ts
import {Application} from '@loopback/core';

// Please note `Application` extends from `Context`
const app = new Application(); // `app` is a "Context"
class MyController {}
app.controller(MyController);
```

In this case, you are using the `.controller` helper method to register a new
controller. The important point to note is `MyController` is actually registered
into the Application Context (`app` is a Context).

## Server-level context

Server-level context:

- Is a child of application-level context
- Holds configuration specific to a particular server instance

Your application will typically contain one or more server instances, each of
which will have the application-level context as its parent. This means that any
bindings that are defined on the application will also be available to the
server(s), unless you replace these bindings on the server instance(s) directly.

For example,
[`@loopback/rest`](https://github.com/strongloop/loopback-next/blob/master/packages/rest)
has the `RestServer` class, which sets up a running HTTP/S server on a port, as
well as defining routes on that server for a REST API. To set the port binding
for the `RestServer`, you would bind the `RestBindings.PORT` key to a number.

We can selectively re-bind this value for certain server instances to change
what port they use:

```ts
// src/application.ts
async start() {
  // publicApi will use port 443, since it inherits this binding from the app.
  app.bind(RestBindings.PORT).to(443);
  const publicApi = await app.getServer<RestServer>('public');
  const privateApi = await app.getServer<RestServer>('private');
  // privateApi will be bound to 8080 instead.
  privateApi.bind(RestBindings.PORT).to(8080);
  await super.start();
}
```

## Request-level context (request)

Using
[`@loopback/rest`](https://github.com/strongloop/loopback-next/blob/master/packages/rest)
as an example, we can create custom sequences that:

- are dynamically created for each incoming server request
- extend the application level context to give you access to application-level
  dependencies during the request/response lifecycle
- are garbage-collected once the response is sent for memory management

Let's see this in action:

```ts
import {DefaultSequence, RestBindings, RequestContext} from '@loopback/rest';

class MySequence extends DefaultSequence {
  async handle(context: RequestContext) {
    // RequestContext provides request/response properties for convenience
    // and performance, but they are still available in the context too
    const req = await this.ctx.get(RestBindings.Http.REQUEST);
    const res = await this.ctx.get(RestBindings.Http.RESPONSE);
    this.send(res, `hello ${req.query.name}`);
  }
}
```

- `this.ctx` is available to your sequence
- allows you to craft your response using resources from the app in addition to
  the resources available to the request in real-time (right when you need it)

## Storing and retrieving items from a Context

Items in the Context are indexed via a key and bound to a `ContextValue`. A
`ContextKey` is simply a string value and is used to look up whatever you store
along with the key. For example:

```ts
// app level
const app = new Application();
app.bind('hello').to('world'); // ContextKey='hello', ContextValue='world'
console.log(app.getSync<string>('hello')); // => 'world'
```

In this case, we bind the 'world' string ContextValue to the 'hello' ContextKey.
When we fetch the ContextValue via `getSync`, we give it the ContextKey and it
returns the ContextValue that was initially bound (we can do other fancy things
too -- ie. instantiate your classes, etc)

The process of registering a ContextValue into the Context is known as
_binding_. Sequence-level bindings work the same way.

For a list of the available functions you can use for binding, visit the
[Context API Docs](http://apidocs.loopback.io/@loopback%2fdocs/context.html).

### Encoding value types in binding keys

Consider the example from the previous section:

```ts
app.bind('hello').to('world');
console.log(app.getSync<string>('hello'));
```

The code obtaining the bound value is explicitly specifying the type of this
value. Such solution is far from ideal:

1.  Consumers have to know the exact name of the type that's associated with
    each binding key and also where to import it from.
2.  Consumers must explicitly provide this type to the compiler when calling
    ctx.get in order to benefit from compile-type checks.
3.  It's easy to accidentally provide a wrong type when retrieving the value and
    get a false sense of security.

The third point is important because the bugs can be subtle and difficult to
spot.

Consider the following REST binding key:

```ts
export const HOST = 'rest.host';
```

The binding key does not provide any indication that `undefined` is a valid
value for the HOST binding. Without that knowledge, one could write the
following code and get it accepted by TypeScript compiler, only to learn at
runtime that HOST may be also undefined and the code needs to find the server's
host name using a different way.:

```ts
const resolve = promisify(dns.resolve);

const host = await ctx.get<string>(RestBindings.HOST);
const records = await resolve(host);
// etc.
```

To address this problem, LoopBack provides a templated wrapper class allowing
binding keys to encode the value type too. The `HOST` binding described above
can be defined as follows:

```ts
export const HOST = new BindingKey<string | undefined>('rest.host');
```

Context methods like `.get()` and `.getSync()` understand this wrapper and use
the value type from the binding key to describe the type of the value they are
returning themselves. This allows binding consumers to omit the expected value
type when calling `.get()` and `.getSync()`.

When we rewrite the failing snippet resolving HOST names to use the new API, the
TypeScript compiler immediatelly tells us about the problem:

```ts
const host = await ctx.get(RestBindings.HOST);
const records = await resolve(host);
// Compiler complains:
// - cannot convert string | undefined to string
//  - cannot convert undefined to string
```

## Dependency injection

- Many configs are adding to the Context during app instantiation/boot time by
  you/developer.
- When things are registered, the Context provides a way to use your
  dependencies during runtime.

How you access these things is via low level helpers like `app.getSync` or the
`sequence` class that is provided to you as shown in the example in the previous
section.

However, when using classes, LoopBack provides a better way to get at stuff in
the context via the `@inject` decorator:

```ts
import {inject} from '@loopback/context';
import {Application} from '@loopback/core';

const app = new Application();
app.bind('defaultName').to('John');

export class HelloController {
  constructor(@inject('defaultName') private name: string) {}

  greet(name?: string) {
    return `Hello ${name || this.name}`;
  }
}
```

Notice we just use the default name as though it were available to the
constructor. Context allows LoopBack to give you the necessary information at
runtime even if you do not know the value when writing up the Controller. The
above will print `Hello John` at run time.

{% include note.html content="
`@inject` decorator is not able to leverage the value-type information
associated with a binding key yet, therefore the TypeScript compiler will not
check that the injection target (e.g. a constructor argument) was declared
with a type that the bound value can be assigned to.
" %}

Please refer to [Dependency injection](Dependency-injection.md) for further
details.

## Context metadata and sugar decorators

Other interesting decorators can be used to help give LoopBack hints to
additional metadata you may want to provide in order to automatically set things
up. For example, let's take the previous example and make it available on the
`GET /greet` route using decorators provided by
[`@loopback/rest`](https://github.com/strongloop/loopback-next/blob/master/packages/rest):

```ts
class HelloController {
  // tell LoopBack you want this controller method
  // to be available at the GET /greet route
  @get('/greet')
  greet(
    // tell LoopBack you want to accept
    // the name parameter as a string from
    // the query string
    @param.query.string('name') name: string,
  ) {
    return `Hello ${name}`;
  }
}
```

These "sugar" decorators allow you to quickly build up your application without
having to code up all the additional logic by simply giving LoopBack hints (in
the form of metadata) to your intent.
