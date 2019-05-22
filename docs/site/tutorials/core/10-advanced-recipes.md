# Recipes

https://github.com/strongloop/loopback-next/tree/master/examples/context

# Create your own decorator

1. Use DecoratorFactory from `@loopback/metadata`.

2. Use an existing decorator

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
