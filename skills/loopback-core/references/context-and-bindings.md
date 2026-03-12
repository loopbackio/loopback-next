# Context and Bindings

## Table of Contents

- [Creating a Context](#creating-a-context)
- [Registering Artifacts](#registering-artifacts)
- [Binding Value Types](#binding-value-types)
- [Binding Scopes](#binding-scopes)
- [Finding and Resolving Bindings](#finding-and-resolving-bindings)
- [Context Hierarchy](#context-hierarchy)
- [Context Views and Observation](#context-views-and-observation)
- [Strongly-Typed Binding Keys](#strongly-typed-binding-keys)
- [Components](#components)

## Creating a Context

```ts
import {Context} from '@loopback/core';
const ctx = new Context();
```

## Registering Artifacts

```ts
import {Context} from '@loopback/core';
import {GreetingController} from './controllers';
import {CACHING_SERVICE, GREETING_SERVICE} from './keys';
import {CachingService} from './caching-service';
import {GreetingService} from './greeting-service';

const ctx = new Context();
ctx.bind('controllers.GreetingController').toClass(GreetingController);
ctx.bind(CACHING_SERVICE).toClass(CachingService);
ctx.bind(GREETING_SERVICE).toClass(GreetingService);
```

## Binding Value Types

### 1. Constant value

```ts
ctx.bind('currentUser').to('John');
```

### 2. Factory function (dynamic value)

```ts
ctx.bind('currentDate').toDynamicValue(() => new Date());
```

### 3. Class instantiation

```ts
ctx.bind('greeter').toClass(Greeter);
```

### 4. Provider class (factory with DI support)

```ts
class RequestIdProvider implements Provider<string> {
  constructor(@inject('url') private url: string) {}
  value() {
    return `${this.url}#${Date.now()}`;
  }
}
ctx.bind('requestId').toProvider(RequestIdProvider);
```

### 5. Alias

```ts
ctx.bind('hello').toAlias(GREETER);
```

## Binding Scopes

- **Transient** — new instance per resolution (default)
- **Singleton** — single shared instance
- **Context** — one instance per context in the hierarchy

```ts
import {BindingScope, injectable} from '@loopback/core';

@injectable({scope: BindingScope.SINGLETON})
export class CachingService {
  /* ... */
}

// Or via binding API:
ctx
  .bind('services.CachingService')
  .toClass(CachingService)
  .inScope(BindingScope.SINGLETON);
```

## Finding and Resolving Bindings

```ts
// By key
const greeter = await ctx.get<Greeter>('greeter');
const greeterSync = ctx.getSync<Greeter>('greeter');

// By binding key object
const greeter = await ctx.get(GREETING_SERVICE);

// Find by pattern
const bindings = ctx.find('*.EnglishGreeter');
const bindings = ctx.find(/\w+\.EnglishGreeter$/);

// Find by tag
const greeters = ctx.findByTag('greeter');

// Find by filter function
import {filterByTag} from '@loopback/core';
const greeters = ctx.find(filterByTag('greeter'));

// Custom filter
const greeterFilter: BindingFilter = binding =>
  binding.tagMap['greeter'] != null;
const greeters = ctx.find(greeterFilter);
```

## Context Hierarchy

Parent-child contexts enable scoped resolution. Child contexts inherit bindings
from parents but can override them.

```ts
const appCtx = new Context('app');
const requestCtx = new Context(appCtx, 'request');

// Binding in appCtx is visible from requestCtx
appCtx.bind('prefix').to('app');

// requestCtx can override
requestCtx.bind('prefix').to('request');
```

### Custom Context Subclasses

Extend `Context` to add domain-specific metadata and behavior:

```ts
import {Context} from '@loopback/core';

export class UserContext extends Context {
  readonly userId: string;
  lastUsed: number;
  readonly createdAt: number;

  constructor(parent: Context, userId: string) {
    super(parent, `user:${userId}`);
    this.userId = userId;
    this.createdAt = Date.now();
    this.lastUsed = Date.now();
  }

  touch(): void {
    this.lastUsed = Date.now();
  }
  isInactive(timeoutMs: number): boolean {
    return Date.now() - this.lastUsed > timeoutMs;
  }
}
```

Use custom contexts for per-user or per-request isolation. Bindings in the
parent (e.g., Application) are inherited; bindings in the child can shadow them.

### Injecting the Application

Use `CoreBindings.APPLICATION_INSTANCE` to inject the Application context
itself:

```ts
import {CoreBindings, inject} from '@loopback/core';

class MyRegistry {
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    private app: Application,
  ) {}
}
```

### Tag-Based Discovery

Use `ContextTags.KEY` to tag bindings with a stable key for lookup:

```ts
import {BindingScope, ContextTags, injectable} from '@loopback/core';

@injectable({
  scope: BindingScope.SINGLETON,
  tags: {[ContextTags.KEY]: MY_SERVICE_KEY},
})
export class MyService {
  /* ... */
}
```

Discover bindings by custom tags:

```ts
const MY_TAG = 'my:service';

// Tag a binding
ctx
  .bind(key)
  .to(value)
  .tag(MY_TAG)
  .tag({[MY_ID_TAG]: id});

// Discover by tag
const bindings = ctx.findByTag(MY_TAG);
```

## Context Views and Observation

Watch for binding additions/removals dynamically:

```ts
import {filterByTag, filterByKey} from '@loopback/core';

// Subscribe to events
appCtx.subscribe({
  filter: filterByTag('greeter'),
  observe: (eventType, binding) => {
    console.log('%s %s', eventType, binding.key);
  },
});

// Create a view (auto-refreshes)
const greetersView = ctx.createView(filterByKey(/^greeters\./));
greetersView.on('refresh', () => {
  console.log(
    'bindings changed:',
    greetersView.bindings.map(b => b.key),
  );
});
```

## Strongly-Typed Binding Keys

```ts
import {BindingKey} from '@loopback/core';
import {GreetingService} from './greeting-service';

export const GREETING_SERVICE = BindingKey.create<GreetingService>(
  'services.GreetingService',
);
```

## Components

A component bundles related artifacts. Register via `app.component()`.

### Component Properties

```ts
import {
  Binding,
  Component,
  Class,
  ServiceOrProviderClass,
  createBindingFromClass,
} from '@loopback/core';

export class MyComponent implements Component {
  // Nested components — registered recursively (order matters)
  components?: Class<Component>[];
  // Service/provider classes — auto-registered by class name
  services?: ServiceOrProviderClass[];
  // Custom bindings — for fine-grained control
  bindings?: Binding[];
}
```

### Hierarchical Composition

Build layered applications by nesting components:

```ts
// Layer 1: Core services
export class CoreComponent implements Component {
  services = [LoggingService, ConfigService];
}

// Layer 2: Feature-specific
export class FeatureComponent implements Component {
  services = [GreetingService];
  bindings = [
    createBindingFromClass(EnglishGreeter),
    createBindingFromClass(ChineseGreeter),
  ];
}

// Layer 3: Composed application component
export class AppComponent implements Component {
  components = [CoreComponent, FeatureComponent];
  services = [AppSpecificService];
}

// Application wires up the top-level component
export class MyApp extends Application {
  constructor() {
    super();
    this.component(AppComponent);
  }
}
```

When `app.component(AppComponent)` is called, LoopBack recursively registers all
nested `components`, then `services`, then `bindings`.

### Conditional Composition

Add components dynamically based on runtime conditions:

```ts
export class MyApp extends Application {
  constructor() {
    super();
    this.component(CoreComponent);
    if (process.env.ENABLE_MESSAGING) {
      this.component(MessagingComponent);
    }
  }
}
```
