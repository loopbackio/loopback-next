# Interceptors and Life Cycle Observers

## Table of Contents

- [Interceptors Overview](#interceptors-overview)
- [Global Interceptors](#global-interceptors)
- [Interceptor Proxy](#interceptor-proxy)
- [Life Cycle Observers](#life-cycle-observers)
- [Dynamic Configuration via ContextView](#dynamic-configuration-via-contextview)

## Interceptors Overview

Interceptors provide aspect-oriented logic around method invocations. They
follow a chain-of-responsibility pattern with pre- and post-invocation hooks.

## Global Interceptors

Register an interceptor that applies to all invocations:

```ts
import {
  asGlobalInterceptor,
  inject,
  injectable,
  Interceptor,
  InvocationContext,
  InvocationResult,
  Provider,
  ValueOrPromise,
} from '@loopback/core';
import {CachingService} from '../caching-service';
import {CACHING_SERVICE} from '../keys';

@injectable(asGlobalInterceptor('caching'))
export class CachingInterceptor implements Provider<Interceptor> {
  constructor(
    @inject(CACHING_SERVICE) private cachingService: CachingService,
  ) {}

  value() {
    return async (
      ctx: InvocationContext,
      next: () => ValueOrPromise<InvocationResult>,
    ) => {
      const targetName = ctx.targetName;
      const cachingKey = `${targetName}:${JSON.stringify(ctx.args)}`;
      const cachedResult = await this.cachingService.get(cachingKey);
      if (cachedResult) return cachedResult;

      const result = await next();
      await this.cachingService.set(cachingKey, result);
      return result;
    };
  }
}

// Register:
app.add(createBindingFromClass(CachingInterceptor));
```

## Interceptor Proxy

Apply interceptors between service dependencies:

```ts
import {AsyncProxy} from '@loopback/core';

class Greeter {
  @inject(CONVERTER, {asProxyWithInterceptors: true})
  private converter: AsyncProxy<Converter>;

  async greet(name: string) {
    const msg = await this.converter.toUpperCase(name);
    return `Hello, ${msg}`;
  }
}

// Or resolve with proxy:
const greeter = await ctx.get(GREETER, {asProxyWithInterceptors: true});
```

## Life Cycle Observers

Participate in application `start`/`stop` events:

```ts
import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {CachingService} from '../caching-service';
import {CACHING_SERVICE} from '../keys';

@lifeCycleObserver('caching')
export class CacheObserver implements LifeCycleObserver {
  constructor(
    @inject(CACHING_SERVICE) private cachingService: CachingService,
  ) {}

  async start(): Promise<void> {
    await this.cachingService.start();
  }

  async stop(): Promise<void> {
    await this.cachingService.stop();
  }
}
```

### Observer Group Ordering

The group name (first argument to `@lifeCycleObserver`) controls execution
order. Groups are sorted **alphabetically** during `start()` and
reverse-alphabetically during `stop()`. Use numbered prefixes to enforce order:

```ts
@lifeCycleObserver('02-config') // starts first
export class ConfigObserver implements LifeCycleObserver {
  /* ... */
}

@lifeCycleObserver('05-services') // starts second
export class ServiceObserver implements LifeCycleObserver {
  /* ... */
}

@lifeCycleObserver('10-app') // starts last
export class AppObserver implements LifeCycleObserver {
  /* ... */
}
```

### Inline Binding Metadata

Combine `@lifeCycleObserver` with scope and tags in the second argument:

```ts
import {
  BindingScope,
  ContextTags,
  lifeCycleObserver,
  LifeCycleObserver,
} from '@loopback/core';

@lifeCycleObserver('06-mcp', {
  scope: BindingScope.SINGLETON,
  tags: {[ContextTags.KEY]: MCP_HOST_FACTORY_KEY},
})
export class MCPHostFactory implements LifeCycleObserver {
  async start(): Promise<void> {
    /* initialize */
  }
  async stop(): Promise<void> {
    /* cleanup */
  }
}
```

This is equivalent to separately applying
`@injectable({scope: BindingScope.SINGLETON})` and tagging the binding.

## Dynamic Configuration via ContextView

React to configuration changes at runtime:

```ts
import {BindingScope, config, ContextView, injectable} from '@loopback/core';

@injectable({scope: BindingScope.SINGLETON})
export class CachingService {
  private timer: NodeJS.Timer;
  private store: Map<string, Message> = new Map();

  constructor(
    @config.view()
    private optionsView: ContextView<CachingServiceOptions>,
  ) {
    // React to configuration changes
    optionsView.on('refresh', () => {
      this.restart().catch(err => {
        console.error('Cannot restart the caching service.', err);
        process.exit(1);
      });
    });
  }

  async getTTL() {
    const options = await this.optionsView.singleValue();
    return options?.ttl ?? 5000;
  }

  async start(): Promise<void> {
    await this.clear();
    const ttl = await this.getTTL();
    this.timer = setInterval(() => {
      this.sweep().catch(console.warn);
    }, ttl);
  }

  async stop(): Promise<void> {
    if (this.timer) clearInterval(this.timer);
    await this.clear();
  }
}
```
