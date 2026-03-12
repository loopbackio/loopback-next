# Extension Points and Extensions

## Table of Contents

- [Overview](#overview)
- [Define the Extension Contract](#define-the-extension-contract)
- [Define the Extension Point Class](#define-the-extension-point-class)
- [Implement Extensions](#implement-extensions)
- [Register Extension Points](#register-extension-points)
- [Register Extensions](#register-extensions)
- [Configure Extension Points](#configure-extension-points)
- [Configure Extensions](#configure-extensions)

## Overview

The Extension Point/Extension pattern enables loose coupling and extensibility.
An extension point declares a contract (interface); extensions implement that
contract. The extension point discovers extensions at runtime via DI.

## Define the Extension Contract

```ts
import {BindingTemplate, extensionFor} from '@loopback/core';

export interface Greeter {
  language: string;
  greet(name: string): string;
}

export const GREETER_EXTENSION_POINT_NAME = 'greeters';

// Inline binding template
export const asGreeter: BindingTemplate = binding => {
  extensionFor(GREETER_EXTENSION_POINT_NAME)(binding);
  binding.tag({namespace: 'greeters'});
};
```

### Binding Template Factory Functions

For reusable templates, wrap in a factory function:

```ts
export function asGreeter(): BindingTemplate {
  return binding => {
    binding.apply(extensionFor(GREETER_EXTENSION_POINT_NAME));
  };
}

// Usage:
@injectable(asGreeter())
export class EnglishGreeter implements Greeter {
  /* ... */
}
```

You can combine scope and extension registration in `@injectable`:

```ts
@injectable({scope: BindingScope.SINGLETON}, extensionFor(MY_EXTENSION_POINT))
export class MyExtension implements MyContract {
  /* ... */
}
```

## Define the Extension Point Class

Two injection styles:

### Lazy injection with `@extensions()` (Getter)

Returns `Getter<T[]>` — call it each time to get the latest extensions (picks up
dynamic additions):

```ts
import {config, extensionPoint, extensions, Getter} from '@loopback/core';

@extensionPoint(GREETER_EXTENSION_POINT_NAME)
export class GreetingService {
  constructor(
    @extensions()
    private getGreeters: Getter<Greeter[]>,
    @config()
    public readonly options?: GreetingServiceOptions,
  ) {}

  async greet(language: string, name: string): Promise<string> {
    const greeters = await this.getGreeters();
    const greeter = greeters.find(g => g.language === language);
    return greeter ? greeter.greet(name) : `Hello, ${name}!`;
  }
}
```

### Eager injection with `@extensions.list()` (Array)

Returns `T[]` directly — simpler when extensions are static at startup:

```ts
import {extensions, injectable, BindingScope} from '@loopback/core';

@injectable({scope: BindingScope.SINGLETON})
export class PluginHost {
  constructor(
    @extensions.list(PLUGIN_EXTENSIONS)
    private plugins: Plugin[] = [],
  ) {}

  setup() {
    for (const plugin of this.plugins) {
      plugin.register(this);
    }
  }
}
```

**When to use which:**

- `@extensions()` with `Getter<T[]>` — extensions may be added after
  construction
- `@extensions.list()` with `T[]` — extensions are all registered before the
  class is instantiated (most common in component-based apps)

## Implement Extensions

```ts
import {config, injectable} from '@loopback/core';
import {asGreeter, Greeter} from '../types';

export interface ChineseGreeterOptions {
  nameFirst: boolean;
}

@injectable(asGreeter)
export class ChineseGreeter implements Greeter {
  language = 'zh';
  constructor(
    @config()
    private options: ChineseGreeterOptions = {nameFirst: true},
  ) {}
  greet(name: string) {
    if (this.options?.nameFirst === false) {
      return `你好，${name}！`;
    }
    return `${name}，你好！`;
  }
}

@injectable(asGreeter)
export class EnglishGreeter implements Greeter {
  language = 'en';
  greet(name: string) {
    return `Hello, ${name}!`;
  }
}
```

## Register Extension Points

```ts
import {BindingKey, BindingScope} from '@loopback/core';

export const GREETING_SERVICE = BindingKey.create<GreetingService>(
  'services.GreetingService',
);

// Direct binding
app
  .bind(GREETING_SERVICE)
  .toClass(GreetingService)
  .inScope(BindingScope.SINGLETON);

// Or via component (preferred)
export class GreetingComponent implements Component {
  bindings = [
    createBindingFromClass(GreetingService, {key: GREETING_SERVICE}),
    createBindingFromClass(EnglishGreeter),
    createBindingFromClass(ChineseGreeter),
  ];
}
```

## Register Extensions

Four methods:

```ts
// Method 1: addExtension helper
import {addExtension} from '@loopback/core';
addExtension(app, 'greeters', FrenchGreeter);

// Method 2: Bind with template
app.bind('greeters.FrenchGreeter').toClass(FrenchGreeter).apply(asGreeter);

// Method 3: createBindingFromClass (auto-applies @injectable metadata)
app.add(createBindingFromClass(FrenchGreeter));

// Method 4: Via component
export class GreetingComponent implements Component {
  bindings = [
    createBindingFromClass(EnglishGreeter),
    createBindingFromClass(ChineseGreeter),
  ];
}
```

## Configure Extension Points

```ts
// 1. Declare @config() in the extension point class (see GreetingService above)

// 2. Set configuration
app.configure(GREETING_SERVICE).to({color: 'blue'});
```

## Configure Extensions

```ts
// 1. Declare @config() in the extension class (see ChineseGreeter above)

// 2. Set configuration
app.configure('greeters.ChineseGreeter').to({nameFirst: false});
```
