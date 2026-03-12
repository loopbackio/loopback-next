# Dependency Injection

## Table of Contents

- [Three Types of DI](#three-types-of-di)
- [Constructor Injection](#constructor-injection)
- [Property Injection](#property-injection)
- [Method Parameter Injection](#method-parameter-injection)
- [Getter Injection](#getter-injection)
- [View Injection](#view-injection)
- [Optional Injection](#optional-injection)
- [Custom Decorators](#custom-decorators)
- [Custom Injectors](#custom-injectors)
- [Invoking Methods with Injection](#invoking-methods-with-injection)

## Three Types of DI

1. **Constructor injection** — `@inject()` on constructor parameters
2. **Property injection** — `@inject()` on class properties
3. **Method injection** — `@inject()` on method parameters (used with
   `invokeMethod`)

## Constructor Injection

```ts
import {inject} from '@loopback/core';

export class CacheObserver implements LifeCycleObserver {
  constructor(
    @inject(CACHING_SERVICE) private cachingService: CachingService,
  ) {}
}
```

## Property Injection

```ts
class Greeter {
  @inject('currentDate')
  private created: Date;

  @inject('requestId')
  private requestId: string;
}
```

## Method Parameter Injection

```ts
class GreetingService {
  async greet(
    @inject('currentLanguage') language: string,
    @inject('currentUser') userName: string,
  ) {
    // ...
  }
}
// Call with injection:
const result = await invokeMethod(greetingService, 'greet', ctx);
```

## Getter Injection

Inject a getter function instead of a value — always returns the latest value on
each call:

```ts
import {Getter, inject} from '@loopback/core';

class GreetingService {
  constructor(
    @inject.getter('currentDate')
    private now: Getter<Date>,
  ) {}

  async doWork() {
    const date = await this.now(); // always fresh
  }
}
```

## View Injection

Inject a live view of bindings matching a filter:

```ts
import {ContextView, filterByTag, inject} from '@loopback/core';

class GreetingService {
  constructor(
    @inject.view(filterByTag('greeter'))
    private greetersView: ContextView<Greeter>,
  ) {}

  async listGreeters() {
    return this.greetersView.values(); // always current
  }
}
```

## Optional Injection

```ts
@inject(CACHING_SERVICE, {optional: true})
private cachingService?: CachingService;
```

## Custom Decorators

Wrap `@inject` to create domain-specific decorators:

```ts
import {BindingKey, inject} from '@loopback/core';

const CURRENT_USER = BindingKey.create<string>('currentUser');

function whoAmI() {
  return inject(CURRENT_USER);
}

class Greeter {
  constructor(@whoAmI() private userName: string) {}
}
```

## Custom Injectors

Create injection decorators with custom resolve logic:

```ts
export function env(name: string) {
  return inject('', {resolve: () => process.env[name]});
}

class MyService {
  constructor(@env('DATABASE_URL') private dbUrl: string) {}
}
```

## Invoking Methods with Injection

```ts
import {invokeMethod} from '@loopback/core';

// Method parameters are resolved from context
const result = await invokeMethod(greetingService, 'greet', ctx);
```
