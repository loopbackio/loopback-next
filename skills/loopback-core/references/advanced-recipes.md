# Advanced Recipes

## Table of Contents

- [TypeScript Decorator Configuration](#typescript-decorator-configuration)
- [Custom Decorators](#custom-decorators)
- [Custom Injectors](#custom-injectors)
- [Parameterized Class Factories](#parameterized-class-factories)
- [Explicit Context DI in Interceptors](#explicit-context-di-in-interceptors)
- [Sync vs Async Resolution](#sync-vs-async-resolution)
- [Application Scaffolding Pattern](#application-scaffolding-pattern)

## TypeScript Decorator Configuration

LoopBack 4 decorators (`@inject`, `@injectable`, `@lifeCycleObserver`, etc.)
require these tsconfig settings:

```jsonc
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
  },
}
```

- **`experimentalDecorators`** — enables `@decorator` syntax (required for all
  LoopBack DI)
- **`emitDecoratorMetadata`** — emits type metadata at runtime so LoopBack can
  resolve injection targets by type

Without these, decorators either cause compile errors or silently fail at
runtime.

## Custom Decorators

Create a sugar decorator wrapping `@inject`:

```ts
import {BindingKey, inject} from '@loopback/core';

const CURRENT_USER = BindingKey.create<string>('currentUser');

function whoAmI() {
  return inject(CURRENT_USER);
}

class Greeter {
  constructor(@whoAmI() private userName: string) {}
  hello() {
    return `Hello, ${this.userName}`;
  }
}
```

Create a decorator using `DecoratorFactory`:

See `@loopback/example-context/src/custom-inject-decorator.ts`.

## Custom Injectors

Inject with custom resolve logic:

```ts
export function env(name: string) {
  return inject('', {resolve: () => process.env[name]});
}

class MyService {
  constructor(@env('DATABASE_URL') private dbUrl: string) {}
}
```

## Parameterized Class Factories

When top-level decorators can't reference variables, use a class factory:

```ts
import {
  BindingAddress,
  BindingTag,
  Constructor,
  Context,
  createBindingFromClass,
  inject,
  injectable,
} from '@loopback/core';

interface Greeter {
  hello(): string;
}

function createClassWithDecoration(
  bindingKeyForName: BindingAddress<string>,
  ...tags: BindingTag[]
): Constructor<Greeter> {
  @injectable({tags})
  class GreeterTemplate implements Greeter {
    constructor(@inject(bindingKeyForName) private userName: string) {}
    hello() {
      return `Hello, ${this.userName}`;
    }
  }
  return GreeterTemplate;
}

// Usage:
const ctx = new Context();
ctx.bind('name1').to('John');
const MyGreeter = createClassWithDecoration('name1', {tags: {prefix: '1'}});
ctx.add(createBindingFromClass(MyGreeter, {key: 'greeter1'}));
const greeter = await ctx.get<Greeter>('greeter1');
```

## Explicit Context DI in Interceptors

Use `instantiateClass` to trigger DI within interceptors or any context where
you need to create a class instance with injection:

```ts
import {inject, instantiateClass} from '@loopback/core';

class InjectionHelper {
  constructor(@inject('services.Logger') public readonly logger: Logger) {}
}

const interceptor: Interceptor = async (invocationCtx, next) => {
  const helper = await instantiateClass(InjectionHelper, invocationCtx);
  helper.logger.info('intercepting...');
  return next();
};
```

## Sync vs Async Resolution

- `Context.getSync()` — resolves synchronously (throws if any dependency is
  async)
- `Context.get()` — resolves asynchronously (returns Promise)

When `ValueOrPromise` is used, the framework auto-detects: returns a plain value
if all deps are sync, otherwise returns a `Promise`.

## Application Scaffolding Pattern

Standalone application with shutdown handling:

```ts
import {Application, ApplicationConfig} from '@loopback/core';

export class MyApplication extends Application {
  constructor(config?: ApplicationConfig) {
    super({shutdown: {signals: ['SIGINT']}, ...config});
    this.component(CoreComponent);
  }

  async main() {
    await this.start();
    const service = await this.get(GREETING_SERVICE);
    console.log(await service.greet('en', 'World'));
  }
}
```

Layered application with conditional components:

```ts
export class BaseApplication extends Application {
  constructor(config?: ApplicationConfig) {
    super({shutdown: {signals: ['SIGINT']}, ...config});
    this.component(BaseComponent);
  }
}

export class MessagingApplication extends BaseApplication {
  constructor() {
    super();
    this.component(MessagingComponent);
  }
}

// Entry point
export async function main() {
  const app = new MessagingApplication();
  app.component(PluginComponent); // add dynamically
  app.configure(MY_SERVICE_KEY).to({port: 3000}); // configure before start
  await app.start();
  return app;
}
```
