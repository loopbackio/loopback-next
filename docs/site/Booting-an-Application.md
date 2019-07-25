---
lang: en
title: 'Booting an Application'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Booting-an-Application.html
---

## What does Booting an Application mean?

A typical LoopBack application is made up of many artifacts in different files,
organized in different folders. **Booting an Application** means:

- Discovering artifacts automatically based on a convention (a specific folder
  containing files with a given suffix)
- Processing those artifacts (this usually means automatically binding them to
  the Application's Context)

`@loopback/boot` provides a Bootstrapper that uses Booters to automatically
discover and bind artifacts, all packaged in an easy-to-use Mixin.

### What is an artifact?

An artifact is any LoopBack construct usually defined in code as a Class.
LoopBack constructs include Controllers, Repositories, Models, etc.

## Usage

### @loopback/cli

New projects generated using `@loopback/cli` or `lb4` are automatically enabled
to use `@loopback/boot` for booting the Application using the conventions
followed by the CLI.

### Adding to existing project

See [Using the BootMixin](#using-the-bootmixin) to add Boot to your Project
manually.

---

The rest of this page describes the inner workings of `@loopback/boot` for
advanced use cases, manual usage or using `@loopback/boot` as a standalone
package (with custom booters).

## BootMixin

Boot functionality can be added to a LoopBack 4 Application by mixing it with
the `BootMixin`
[mixin](http://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/).
This mixin adds the `BootComponent` to your Application as well as convenience
methods such as `app.boot()` and `app.booters()`. The Mixin also allows
Components to set the property `booters` as an Array of `Booters`. They will be
bound to the Application and called by the `Bootstrapper`.

Since this is a convention-based Bootstrapper, it is important to set a
`projectRoot`, as all other artifact paths will be resolved relative to this
path.

_Tip_: `application.ts` will likely be at the root of your project, so its path
can be used to set the `projectRoot` by using the `__dirname` variable. _(See
example below)_

### Using the BootMixin

```ts
import {BootMixin} from "@loopback/boot";

class MyApplication extends BootMixin(Application) {
  constructor(options?: ApplicationConfig) {
    super(options);
    // Setting the projectRoot
    this.projectRoot = __dirname;
    // Set project conventions
    this.bootOptions: BootOptions = {
      controllers: {
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      }
    }
  }
}
```

Now just call `app.boot()` from `index.ts` before starting your Application
using `app.start()`.

#### app.boot()

A convenience method to retrieve the `Bootstrapper` instance bound to the
Application and calls its `boot` function. This should be called before an
Application's `start()` method is called. _This is an `async` function and
should be called with `await`._

```ts
class MyApp extends BootMixin(Application) {}

async main() {
  const app = new MyApp();
  app.projectRoot = __dirname;
  await app.boot();
  await app.start();
}
```

#### app.booters()

A convenience method to manually bind `Booters`. You can pass any number of
`Booter` classes to this method and they will all be bound to the Application
using the prefix (`booters.`) and tag (`booter`) used by the `Bootstrapper`.

```ts
// Binds MyCustomBooter to `booters.MyCustomBooter`
// Binds AnotherCustomBooter to `booters.AnotherCustomBooter`
// Both will have the `booter` tag set.
app.booters(MyCustomBooter, AnotherCustomBooter);
```

## BootComponent

This component is added to an Application by `BootMixin` if used. This
Component:

- Provides a list of default `booters` as a property of the component
- Binds the conventional Bootstrapper to the Application

_If using this as a standalone component without the `BootMixin`, you will need
to bind the `booters` of a component manually._

```ts
app.component(BootComponent);
```

## Bootstrapper

A Class that acts as the "manager" for Booters. The Bootstrapper is designed to
be bound to an Application as a `SINGLETON`. The Bootstrapper class provides a
`boot()` method. This method is responsible for getting all bound `Booters` and
running their `phases`. A `phase` is a method on a `Booter` class.

Each `boot()` method call creates a new `Context` that sets the `app` context as
its parent. This is done so each `Context` for `boot` gets a new instance of
`booters` but the same context can be passed into `boot` so selective `phases`
can be run in different calls of `boot`.

The Bootstrapper can be configured to run specific booters or boot phases by
passing in `BootExecOptions`. **This is experimental and subject to change.
Hence, this functionality is not exposed when calling `boot()` via
`BootMixin`**.

To use `BootExecOptions`, you must directly call `bootstrapper.boot()` instead
of `app.boot()`. You can pass in the `BootExecOptions` object with the following
properties:

| Property         | Type                    | Description                                      |
| ---------------- | ----------------------- | ------------------------------------------------ |
| `booters`        | `Constructor<Booter>[]` | Array of Booters to bind before running `boot()` |
| `filter.booters` | `string[]`              | Names of Booter classes that should be run       |
| `filter.phases`  | `string[]`              | Names of Booter phases to run                    |

### Example

```ts
import {BootMixin, Booter, Binding, Bootstrapper} from '@loopback/boot';

class MyApp extends BootMixin(Application) {}
const app = new MyApp();
app.projectRoot = __dirname;

const bootstrapper: Bootstrapper = await this.get(
  BootBindings.BOOTSTRAPPER_KEY,
);
bootstrapper.boot({
  booters: [MyCustomBooter],
  filter: {
    booters: ['MyCustomBooter'],
    phases: ['configure', 'discover'], // Skip the `load` phase.
  },
});
```

## Booters

A Booter is a class that is responsible for booting an artifact. A Booter does
its work in `phases` which are called by the Bootstrapper. The following Booters
are a part of the `@loopback/boot` package and loaded automatically via
`BootMixin`.

### Controller Booter

This Booter's purpose is to discover [Controller](Controllers.md) type Artifacts
and to bind them to the Application's Context.

You can configure the conventions used in your project for a Controller by
passing a `controllers` object on `BootOptions` property of your Application.
The `controllers` object supports the following options:

| Options      | Type                 | Default              | Description                                                                                                   |
| ------------ | -------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------- |
| `dirs`       | `string \| string[]` | `['controllers']`    | Paths relative to projectRoot to look in for Controller artifacts                                             |
| `extensions` | `string \| string[]` | `['.controller.js']` | File extensions to match for Controller artifacts                                                             |
| `nested`     | `boolean`            | `true`               | Look in nested directories in `dirs` for Controller artifacts                                                 |
| `glob`       | `string`             |                      | A `glob` pattern string. This takes precendence over above 3 options (which are used to make a glob pattern). |

### Repository Booter

This Booter's purpose is to discover [Repository](Repositories.md) type
Artifacts and to bind them to the Application's Context. The use of this Booter
requires `RepositoryMixin` from `@loopback/repository` to be mixed into your
Application class.

You can configure the conventions used in your project for a Repository by
passing a `repositories` object on `BootOptions` property of your Application.
The `repositories` object supports the following options:

| Options      | Type                 | Default              | Description                                                                                                   |
| ------------ | -------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------- |
| `dirs`       | `string \| string[]` | `['repositories']`   | Paths relative to projectRoot to look in for Repository artifacts                                             |
| `extensions` | `string \| string[]` | `['.repository.js']` | File extensions to match for Repository artifacts                                                             |
| `nested`     | `boolean`            | `true`               | Look in nested directories in `dirs` for Repository artifacts                                                 |
| `glob`       | `string`             |                      | A `glob` pattern string. This takes precendence over above 3 options (which are used to make a glob pattern). |

### DataSource Booter

This Booter's purpose is to discover [DataSource](DataSource.md) type Artifacts
and to bind them to the Application's Context. The use of this Booter requires
`RepositoryMixin` from `@loopback/repository` to be mixed into your Application
class.

You can configure the conventions used in your project for a DataSource by
passing a `datasources` object on `BootOptions` property of your Application.
The `datasources` object support the following options:

| Options      | Type                 | Default              | Description                                                                                                   |
| ------------ | -------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------- |
| `dirs`       | `string \| string[]` | `['datasources']`    | Paths relative to projectRoot to look in for DataSource artifacts                                             |
| `extensions` | `string \| string[]` | `['.datasource.js']` | File extensions to match for DataSource artifacts                                                             |
| `nested`     | `boolean`            | `true`               | Look in nested directories in `dirs` for DataSource artifacts                                                 |
| `glob`       | `string`             |                      | A `glob` pattern string. This takes precendence over above 3 options (which are used to make a glob pattern). |

### Service Booter

#### Description

Discovers and binds remote service proxies or local service classes or providers
using `app.service()`.

**IMPORTANT:** For a class to be recognized by `ServiceBooter` as a service
provider, it either has to be decorated with `@bind` or the class name must end
with `Provider` suffix and its prototype must have a `value()` method.

#### Options

The options for this can be passed via `BootOptions` when calling
`app.boot(options: BootOptions)`.

The options for this are passed in a `services` object on `BootOptions`.

Available options on the `services` object on `BootOptions` are as follows:

| Options      | Type                 | Default           | Description                                                                                                  |
| ------------ | -------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------ |
| `dirs`       | `string \| string[]` | `['services']`    | Paths relative to projectRoot to look in for Service artifacts                                               |
| `extensions` | `string \| string[]` | `['.service.js']` | File extensions to match for Service artifacts                                                               |
| `nested`     | `boolean`            | `true`            | Look in nested directories in `dirs` for Service artifacts                                                   |
| `glob`       | `string`             |                   | A `glob` pattern string. This takes precedence over above 3 options (which are used to make a glob pattern). |

### Custom Booters

A custom Booter can be written as a Class that implements the `Booter`
interface. The Class must implement methods that corresponds to a `phase` name.
The `phases` are called by the Bootstrapper in a pre-determined order (unless
overridden by `BootExecOptions`). The next phase is only called once the
previous phase has been completed for all Booters.

#### Phases

**configure**

Used to configure the `Booter` with its default options.

**discover**

Used to discover the artifacts supported by the `Booter` based on convention.

**load**

Used to bind the discovered artifacts to the Application.
