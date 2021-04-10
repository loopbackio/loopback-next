# @loopback/prisma

This package enables Prisma integration with LoopBack 4.

## Installation

To install `@loopback/prisma`:

```sh
$ [npm install | yarn add] @loopback/prisma
```

## Integration Scope

This package adds the following integration capabilities:

- Binding of Prisma models to context
- Connection lifecycle integration
- Integration with `@loopback/logging`

The following are not supported yet, but are being considered:

- OpenAPI 3.0 schema generation
- Prisma Middleware Providers
- Converting LoopBack 4 filters into Prisma queries
- Converting Prisma queries into LoopBack 4 filters
- Integration with `@loopback/metrics` (blocked by
  https://github.com/prisma/prisma/issues/5129)

The following are not supported, and are not being considered or are low
priority:

- Prisma Generator for LoopBack 4 models/repository/datastore

## Considerations

When using Prisma integration for LoopBack 4, there may be some important
factors or changes that should be considered:

- `lazyConnect` is disabled by default.

  This is to ensure that LoopBack fails fast with database connection issues.

- Limited support for architectures or operating systems

  The Prisma engines are binary blobs that has its own list of supported
  platforms, separate from Node.js itself.

## Basic Use

Configure and load LoopbackPrismaComponent in the application constructor as
shown below.

```typescript
import {PrismaComponent, PrismaOptions} from '@loopback/prisma';

export class MyApplication extends RepositoryMixin(
  // This can be replaced with any `*Application`
  // (e.g. `RestApplication` if needed.
  Application
)) {
  constructor(options: ApplicationConfig = {}) {
    const opts: PrismaOptions = {/* Config here */}

    this.configure(PrismaBindings.COMPONENT).to(opts);
    this.component(PrismaComponent);
  }
}
```

### Configuring Prisma Client and Component

The Prisma Component and Prisma Client accepts custom configuration, which can
be configured as follows:

```typescript
import {PrismaBindings, PrismaComponent, PrismaOptions} from '@loopback/prisma';

export class MyApplication extends RepositoryMixin(RestApplication)) {
  constructor(options: ApplicationConfig = {}) {
    const opts: PrismaOptions = {
      prismaClient: {
        /* Prisma Client options go here */
      }

      // Prisma Component configuration
      enableLoggingIntegration: true,
      lazyConnect: false,
      models: {
        namespace: 'customPrismaModelNamespace',
        tags: ['customPrismaModelTag'],
      },
    };

    // The order does not matter as long as `app.init()` hasn't been called.
    this.configure(PrismaBindings.COMPONENT).to(opts);
    this.component(PrismaComponent);
    // ...
  }
}
```

After `.init()`, the configuration binding will be locked. Manual unlocking and
modification will not be honored.

### Registering Prisma middleware

Extension points are a LoopBack 4 concept which allows extending functionality
through a common interface. In the case, it is also useful as a bill-of-material
of registered Prisma middleware.

```typescript
import {Binding, BindingKey} from '@loopback/core';
import {
  asPrismaMiddleware,
  PrismaBindings,
  PrismaComponent
} from '@loopback/prisma';

// Replace this to import your own middleware.
import {myPrismaMiddleware} from '.';

export class MyApplication extends RepositoryMixin(RestApplication)) {
  constructor(options: ApplicationConfig = {}) {
    // BindingKey.generate() creates a unique binding key.
    // It can be replaced with your own binding key to allow identification of
    // the middleware.
    this.bind(new Binding(BindingKey.generate()))
      .to(myPrismaMiddleware)
      .apply(asPrismaMiddleware);

    this.component(LoopbackPrismaComponent);
    // ...
  }
}
```

Prisma middleware can be registered at any point in time (with some caveats),
and its binding will be automatically locked immediately when and after
`.init()`.

#### Registering Prisma Middleware after init

When registerin Prisma Middleware After `.init()` is called, it is necessary to
call `process.nextTick()` to guarantee that the middleware registation is
complete. Otherwise, there is a risk of a race condition.

In asynchronous functions, it is possible to adapt `process.nextTick()` as
follows:

```typescript
// Avoid "callback hell" in asynchronous functions
await new Promise(resolve => process.nextTick(resolve));
```

### Injecting Prisma models

During initialization, Prisma models are discovered and bound to Context as
Constant Singletons.

For example, to constructor-inject a Prisma model named `User` into a
Controller:

```typescript
import {inject} from '@loopback/core';
import {PrismaBindings} from '@loopback/prisma';
import {Prisma, PrismaClient} from '@prisma/client';

export class MyController {
  constructor(
    @inject(`${PrismaBindings.PRISMA_MODEL_NAMESPACE}.${Prisma.ModelName.User}`)
    private _userModel: PrismaClient.prototype.user,
  ) {}
}
```

### Injecting PrismaClient instance

After initialization, a `PrismaClient` instance will be bound to Context. To
retrieve the instance:

```typescript
class MyClass {
  constructor(
    @inject(PrismaBindings.PRISMA_CLIENT_INSTANCE)
    private _prismaClient: PrismaClient,
  ) {}
}
```

It is usually not recommended to inject the PrismaClient instance unless if the
API is not exposed through this extension. Please consider submitting it as a
new GitHub "Idea" Discussion.

### `@loopback/logging` integration

The `@loopback/logging` integration a quick bootstrap helper that configures and
binds event listeners to `PrismaClient`.

#### Quick start

- Install a compatible version of `@loopback/logging`:

  ```sh
  $ [npm install | yarn add] @loopback/logging
  ```

- Register `LoggingComponent`:

  ```typescript
  import {LoggingComponent} from '@loopback/logging';
  // ...
  app.component(LoggingComponent);
  ```

- Register and configure `PrismaComponent`:

  ```typescript
  import {
    PrismaBindings,
    PrismaComponent,
    PrismaOptions,
  } from '@loopback/prisma';
  // ...
  app.component(PrismaComponent);
  app.configure<PrismaOptions>(PrismaBindings.COMPONENT).to({
    enableLoggingIntegration: true,
  });
  ```

## Advanced Use

### Custom Prisma Client instance

Before `.init()` is called, it is possible to provide a custom instance of the
Prisma Client:

```typescript
import {PrismaBindings, PrismaComponent} from '@loopback/prisma';
import {PrismaClient} from '@prisma/client';

export class MyApplication extends RepositoryMixin(RestApplication)) {
  constructor(options: ApplicationConfig = {}) {
    const prismaClient = new PrismaClient();

    this.bind(PrismaBindings.PRISMA_CLIENT_INSTANCE).to(prismaClient);
    this.component(LoopbackPrismaComponent);
    // ...
  }
}
```

In most cases, it's usually not necessary to provide your own instance of the
Prisma Client. Also note that the instance MUST be bound as a constant (i.e.
using `Binding.to()`); Otherwise, an error will be thrown during `.init()` and
`.start()`.

## Informational

This section is for deeper, informational reference.

### Pre- & Post-initialization Restrictions

Before `.init()` is called, the configuration and Prisma Client instance binding
can be modified, and it is not necessary to call `.configure()` before
`.component()`.

After initialization, both bindings will be locked and any changes (even after
manual unlocking) will not be honored.

### Bad Binding Protections

At certain stages, this extension will check and validate if the relevant bound
Bindings meet their respective requirements (e.g. Binding scope, binding type,
etc.). Afterwards, these Bindings will be locked (i.e. through `Binding.lock()`)
to discourage unwanted modifications and allow for quick, easy-to-spot errors.

After the bindings are locked, no additional checks will be performed, and
Binding modification may cause additional unhandled errors deeper within the
code.

Furthermore, behavior on interactions on the Bindings and the Bindings
themselves are not tested or documented.

Hence, it is strongly discouraged to modify Bindings after they're locked, of
which they should be considered "read-only".

Please refer to this documentation for more information on when certain Bindings
are locked.
