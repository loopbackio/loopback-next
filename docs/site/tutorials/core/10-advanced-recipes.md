---
lang: en
title: 'Advanced Recipes'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/core-tutorial-part9.html
---

There are a few advanced usage of the LoopBack core modules that are not covered
by the Greeter Extension and Greeter Application example.

# Create your own decorator

You can create your own decorator:

1. Create a new decorator from scratch by using `DecoratorFactory` from
   `@loopback/metadata`. See example from
   [custom-inject-decorator.ts](https://github.com/strongloop/loopback-next/blob/master/examples/context/src/custom-inject-decorator.ts)

2. Create a sugar decorator for an existing decorator.

   ```ts
   export function globalInterceptor(group?: string) {
     return bind({tags: {}});
   }
   ```

# Create your own injector

```ts
export function env(name: string) {
  return inject('', {resolve: () => process.env[name]});
}
```

# Class factory to allow parameterized decorations

```ts
function createControllerClass(version: string, basePath: string) {
  @api({basePath: `${basePath}`})
  class Controller {
    @get(`/${version}`) find() {}
  }
}
```

For complete example, see
[parameterized-decoration.ts](https://github.com/strongloop/loopback-next/blob/master/examples/context/src/parameterized-decoration.ts).

# Trigger dependency injection with an explicit context

```ts
class InjectionHelper {
  constructor(@inject(RestBindings.Http.REQUEST))
  public readonly request: Request) {}
}
const interceptor: Interceptor = (invocationCtx, next) => {
  const helper = instantiateClass(invocationCtx, InjectionHelper);
  const request = helper.request;
});
```

# Magic ValueOrPromise

For the dependency injection framework, there are two flavors: synchronous and
asynchronous.

`Context.getSync()` resolves a value synchronously, whereas `Context.get()`
allows you to resolve the value asynchronous and returns a `Promise`.

When `ValueOrPromise` is being used in a value provider, if the value is
produced synchronously, a value will be returned, otherwise a Promise will be
return. When you are chaining multiple value and if any of them is a Promise,
you'll be getting a Promise.

TODO:

example1: bind the key to a class and that class has dependneicnes, and the dep
can be resolved asynchronously. ChineseGreeter dep on configuration. config the
binding with a constant value -> ChineseGreeter class can be instantiated async

example 2: Class requires some value to be injected asynchronously. e.g. return
a promise from a configuration. ChineseGreeter cannot be instantiated async.

https://github.com/strongloop/loopback-next/blob/master/examples/context/src/value-promise.ts

# More examples

For more examples, refer to
https://github.com/strongloop/loopback-next/tree/master/examples/context.
