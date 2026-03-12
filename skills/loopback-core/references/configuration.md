# Configuration

## Table of Contents

- [Basic Configuration Injection](#basic-configuration-injection)
- [Configuring Bindings](#configuring-bindings)
- [Dynamic Configuration](#dynamic-configuration)
- [Configuration Views](#configuration-views)
- [Custom Configuration Resolver](#custom-configuration-resolver)
- [Sync vs Async Configuration](#sync-vs-async-configuration)

## Basic Configuration Injection

Use `@config()` to inject configuration for a bound class:

```ts
import {config, Context} from '@loopback/core';

type GreeterConfig = {
  prefix?: string;
  includeDate?: boolean;
};

class Greeter {
  constructor(@config() private settings: GreeterConfig = {}) {}

  greet(name: string) {
    const prefix = this.settings.prefix ? `${this.settings.prefix}` : '';
    const date = this.settings.includeDate
      ? `[${new Date().toISOString()}]`
      : '';
    return `${date} ${prefix}: Hello, ${name}`;
  }
}
```

## Configuring Bindings

```ts
const ctx = new Context();
ctx.configure<GreeterConfig>('greeter').to({prefix: '>>>', includeDate: true});
ctx.bind('greeter').toClass(Greeter);

const greeter = await ctx.get<Greeter>('greeter');
```

## Dynamic Configuration

Supply configuration asynchronously:

```ts
app
  .configure('greeters.ChineseGreeter')
  .toDynamicValue(async () => ({nameFirst: false}));
```

**Note:** When configuration is async, `getSync()` will throw. Use `get()`
instead.

## Configuration Views

Use `@config.view()` to get a live view that emits `refresh` events on changes:

```ts
constructor(
  @config.view()
  private optionsView: ContextView<CachingServiceOptions>,
) {
  optionsView.on('refresh', () => {
    this.restart();
  });
}

async getTTL() {
  const options = await this.optionsView.singleValue();
  return options?.ttl ?? 5000;
}
```

## Custom Configuration Resolver

Override how configuration is resolved (e.g., from environment variables):

```ts
import {
  ConfigurationResolver,
  Context,
  ContextBindings,
  DefaultConfigurationResolver,
  inject,
} from '@loopback/core';

class EnvConfigResolver
  extends DefaultConfigurationResolver
  implements ConfigurationResolver
{
  constructor(@inject.context() public readonly context: Context) {
    super(context);
  }

  getConfigAsValueOrPromise(key, configPath, resolutionOptions) {
    const envVal = process.env[key.toString().toUpperCase()];
    if (envVal != null) {
      try {
        return JSON.parse(envVal);
      } catch {
        return envVal;
      }
    }
    return super.getConfigAsValueOrPromise(key, configPath, resolutionOptions);
  }
}

// Register:
ctx.bind(ContextBindings.CONFIGURATION_RESOLVER).toClass(EnvConfigResolver);
```

## Sync vs Async Configuration

- `@config()` with `.to()` — resolvable both sync and async
- `@config()` with `.toDynamicValue(async () => ...)` — async only (`getSync`
  throws)
- Use `@config.view()` when you need to react to runtime config changes
