---
lang: en
title: 'Advanced Recipes'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/core-tutorial-part10.html
---

There are a few advanced usages of the LoopBack core modules that are not
covered by the Greeter Extension and Greeter Application example.

# Create your own decorator

You can create your own
[decorator](https://loopback.io/doc/en/lb4/Decorators.html):

1. Create a new decorator from scratch by using `DecoratorFactory` from
   `@loopback/metadata`. See an example in
   [custom-inject-decorator.ts](https://github.com/strongloop/loopback-next/blob/master/examples/context/src/custom-inject-decorator.ts)

2. Create a sugar decorator for an existing decorator.

   ```ts
   export function globalInterceptor(group?: string) {
     bind({tags: [ContextTags.GLOBAL_INTERCEPTOR]});
   }
   ```

# Create your own injector

You can also create your own injector. See the
[dependency injection docs page](https://loopback.io/doc/en/lb4/Dependency-injection.html)
for more details.

```ts
export function env(name: string) {
  return inject('', {resolve: () => process.env[name]});
}
```

For a complete example, see
https://github.com/strongloop/loopback-next/blob/master/examples/context/src/custom-inject-decorator.ts.

# Class factory to allow parameterized decorations

Since decorations applied on a top-level class cannot have references to
variables, you might want to create a class factory that allows parameterized
decorations.

```ts
function createControllerClass(version: string, basePath: string) {
  @api({basePath: `${basePath}`})
  class Controller {
    @get(`/${version}`) find() {}
  }
}
```

For a complete example, see
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
return. When multiple dependencies are involved to resolve the value for a
binding, a `Promise` will be returned if at least one of the bindings produces a
`Promise`.

Using the `ChineseGreeter` as an example, it has a dependency of the
configuration object to be injected as instructed by `@config`.

```ts
/**
 * A greeter implementation for Chinese.
 */
@bind(asGreeter)
export class ChineseGreeter implements Greeter {
  language = 'zh';
  constructor(
    /**
     * Inject the configuration for ChineseGreeter
     */
    @config()
    private options: ChineseGreeterOptions = {nameFirst: true},
  ) {}
  greet(name: string) {
    if (this.options && this.options.nameFirst === false) {
      return `你好，${name}！`;
    }
    return `${name}，你好！`;
  }
}
```

There are two ways to configure the greeter.

**Option 1**

```ts
app.configure('greeters.ChineseGreeter').to({nameFirst: false});
```

We call `app.getSync('greeters.ChineseGreeter')` or
`app.get('greeters.ChineseGreeter')` to get the `ChineseGreeter`.

**Option 2**

```ts
app
  .configure('greeters.ChineseGreeter')
  .toDynamicValue(async () => ({nameFirst: false}));
```

We can only call `app.get('greeters.ChineseGreeter')` because the configuration
dependencies is asynchronous. Please note `app.getSync()` will throw an
exception to indicate that the ChineseGreeter binding cannot be resolved
synchronously.

# More examples

For more examples, refer to
https://github.com/strongloop/loopback-next/tree/master/examples/context.

---

Previous: [Part 9 - Boot by convention](./9-boot-by-convention.md)

Next: [Part 11 - Architectural summary](./11-summary.md)
