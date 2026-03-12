---
name: loopback-core
description:
  Build large-scale, extensible Node.js applications and frameworks using
  LoopBack 4 core patterns. Use when building TypeScript/Node.js projects that
  need IoC containers, dependency injection, extension point/extension patterns,
  interceptors, life cycle observers, or component-based architecture. Triggers
  on tasks involving @loopback/core, @loopback/context, Context, Binding,
  @inject, @injectable, @extensionPoint, @extensions, LifeCycleObserver,
  Interceptor, or Component patterns. Also use when the user asks about
  structuring large-scale Node.js projects for extensibility and composability.
---

# Build Large-Scale Node.js Projects with LoopBack 4 Core

LoopBack 4 core provides an IoC container and DI framework in TypeScript
designed for async-first, large-scale Node.js applications. Import from
`@loopback/core` (not `@loopback/context`). This skill covers only
`@loopback/core` — not REST, repositories, or other LoopBack modules.

## Architecture Decision Tree

1. **Need to manage artifacts and their dependencies?** -> Context & Bindings
   ([context-and-bindings.md](references/context-and-bindings.md))
2. **Need loose coupling between artifact construction and behavior?** ->
   Dependency Injection
   ([dependency-injection.md](references/dependency-injection.md))
3. **Need a pluggable system where others can add capabilities?** -> Extension
   Point/Extension ([extension-points.md](references/extension-points.md))
4. **Need cross-cutting concerns (caching, logging, tracing)?** -> Interceptors
   ([interceptors-and-observers.md](references/interceptors-and-observers.md))
5. **Need to hook into app start/stop?** -> Life Cycle Observers
   ([interceptors-and-observers.md](references/interceptors-and-observers.md))
6. **Need runtime-configurable artifacts?** -> Configuration
   ([configuration.md](references/configuration.md))
7. **Need custom decorators, parameterized classes, or advanced patterns?** ->
   Advanced Recipes ([advanced-recipes.md](references/advanced-recipes.md))

## Quick Start: Minimal Extensible Application

```ts
import {
  Application,
  BindingKey,
  Component,
  Binding,
  createBindingFromClass,
  extensionPoint,
  extensions,
  BindingTemplate,
  extensionFor,
  injectable,
  Getter,
  config,
} from '@loopback/core';

// 1. Define the extension contract
export interface Greeter {
  language: string;
  greet(name: string): string;
}

export const GREETER_EXTENSION_POINT_NAME = 'greeters';

export const asGreeter: BindingTemplate = binding => {
  extensionFor(GREETER_EXTENSION_POINT_NAME)(binding);
  binding.tag({namespace: 'greeters'});
};

// 2. Define the extension point
@extensionPoint(GREETER_EXTENSION_POINT_NAME)
export class GreetingService {
  constructor(
    @extensions() private getGreeters: Getter<Greeter[]>,
    @config() public readonly options?: {color: string},
  ) {}
  async greet(language: string, name: string): Promise<string> {
    const greeters = await this.getGreeters();
    const greeter = greeters.find(g => g.language === language);
    return greeter ? greeter.greet(name) : `Hello, ${name}!`;
  }
}

// 3. Implement extensions
@injectable(asGreeter)
export class EnglishGreeter implements Greeter {
  language = 'en';
  greet(name: string) {
    return `Hello, ${name}!`;
  }
}

@injectable(asGreeter)
export class ChineseGreeter implements Greeter {
  language = 'zh';
  greet(name: string) {
    return `${name}，你好！`;
  }
}

// 4. Bundle into a component
export const GREETING_SERVICE = BindingKey.create<GreetingService>(
  'services.GreetingService',
);

export class GreetingComponent implements Component {
  bindings: Binding[] = [
    createBindingFromClass(GreetingService, {key: GREETING_SERVICE}),
    createBindingFromClass(EnglishGreeter),
    createBindingFromClass(ChineseGreeter),
  ];
}

// 5. Compose components via nesting
export class CoreComponent implements Component {
  // services: auto-registered service/provider classes
  services = [SomeUtilityService];
}

export class AppComponent implements Component {
  // components: nested components (registered recursively)
  components = [CoreComponent, GreetingComponent];
  // services: additional services for this layer
  services = [AppSpecificService];
}

// 6. Wire up the application
export class MyApp extends Application {
  constructor() {
    super({shutdown: {signals: ['SIGINT']}});
    this.component(AppComponent);
  }
  async main() {
    const svc = await this.get(GREETING_SERVICE);
    console.log(await svc.greet('en', 'World'));
  }
}
```

## Core Patterns Summary

| Pattern           | Key APIs                                                                                      | When to Use                                   |
| ----------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------- |
| Context & Binding | `Context`, `bind()`, `toClass()`, `toDynamicValue()`, `toProvider()`                          | Managing artifacts and their dependencies     |
| DI                | `@inject()`, `@inject.getter()`, `@inject.view()`                                             | Decoupling construction from behavior         |
| Extension Point   | `@extensionPoint()`, `@extensions()`, `@extensions.list()`, `extensionFor()`, `@injectable()` | Pluggable, open-ended feature sets            |
| Interceptor       | `@injectable(asGlobalInterceptor())`, `Provider<Interceptor>`                                 | Cross-cutting concerns                        |
| Observer          | `@lifeCycleObserver('group')`, `LifeCycleObserver`                                            | Startup/shutdown hooks (group controls order) |
| Configuration     | `@config()`, `@config.view()`, `app.configure()`                                              | Runtime-configurable behavior                 |
| Component         | `Component`, `components[]`, `services[]`, `bindings[]`                                       | Composable packaging of artifacts             |

## Key Rules

- Always import from `@loopback/core`, not `@loopback/context`
- Use `BindingKey.create<T>()` for strongly-typed keys
- Extension injection: `@extensions()` returns `Getter<T[]>` (lazy, picks up
  dynamic additions); `@extensions.list()` returns `T[]` (eager, simpler when
  extensions are static at startup)
- Use `@config()` for artifact configuration, `app.configure(key).to(value)` to
  set it
- Use `@injectable(bindingTemplate)` to decorate extension classes — can combine
  scope and extension:
  `@injectable({scope: BindingScope.SINGLETON}, extensionFor(POINT))`
- Use `createBindingFromClass()` to create bindings that respect `@injectable`
  metadata
- Compose components hierarchically: `components[]` for nesting, `services[]`
  for auto-registration, `bindings[]` for custom bindings
- Use `BindingScope.SINGLETON` for shared stateful services
- Use `CoreBindings.APPLICATION_INSTANCE` to inject the Application itself
- Use `ContextTags.KEY` to tag bindings with a stable key:
  `tags: {[ContextTags.KEY]: MY_KEY}`
- Lifecycle observer groups are sorted alphabetically — use numbered prefixes
  (e.g., `'03-setup'`, `'10-app'`) to control startup order

## References

- **Context & Bindings**:
  [references/context-and-bindings.md](references/context-and-bindings.md) —
  creating contexts, binding types, scopes, finding bindings, context hierarchy,
  views, components
- **Dependency Injection**:
  [references/dependency-injection.md](references/dependency-injection.md) —
  constructor/property/method injection, getters, views, custom decorators,
  custom injectors
- **Extension Points**:
  [references/extension-points.md](references/extension-points.md) — defining
  contracts, extension point classes, implementing/registering extensions,
  configuration
- **Interceptors & Observers**:
  [references/interceptors-and-observers.md](references/interceptors-and-observers.md)
  — global interceptors, interceptor proxies, life cycle observers, dynamic
  config via ContextView
- **Configuration**: [references/configuration.md](references/configuration.md)
  — `@config()`, `@config.view()`, dynamic config, custom resolvers, sync vs
  async
- **Advanced Recipes**:
  [references/advanced-recipes.md](references/advanced-recipes.md) — custom
  decorators, custom injectors, parameterized class factories, application
  scaffolding
