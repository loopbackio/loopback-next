# @loopback/boot

A convention based project Bootstrapper and Booters for LoopBack Applications

# Overview

A Booter is a Class that can be bound to an Application and is called
to perform a task before the Application is started. A Booter may have multiple
phases to complete its task. The task for a convention based Booter is to discover
and bind Artifacts (Controllers, Repositories, Models, etc.).

An example task of a Booter may be to discover and bind all artifacts of a
given type.

A Bootstrapper is needed to manage the Booters and execute them. This is provided
in this package. For ease of use, everything needed is packages using a BootMixin.
This Mixin will add convenience methods such as `boot` and `booter`, as well as
properties needed for Bootstrapper such as `projectRoot`. The Mixin also adds the
`BootComponent` to your `Application` which binds the `Bootstrapper` and default
`Booters` made available by this package.

## Installation

```shell
$ npm i @loopback/boot
```

## Basic Use

```ts
import {Application} from '@loopback/core';
import {BootMixin, Booter, Binding} from '@loopback/boot';
class BootApp extends BootMixin(Application) {}

const app = new BootApp();
app.projectRoot = __dirname;

await app.boot();
await app.start();
```

### BootOptions
List of Options available on BootOptions Object.

|Option|Type|Description|
|-|-|-|
|`controllers`|`ArtifactOptions`|ControllerBooter convention options|
|`repositories`|`ArtifactOptions`|RepositoryBooter convention options|

### ArtifactOptions

|Options|Type|Description|
|-|-|-|
|`dirs`|`string \| string[]`|Paths relative to projectRoot to look in for Artifact|
|`extensions`|`string \| string[]`|File extensions to match for Artifact|
|`nested`|`boolean`|Look in nested directories in `dirs` for Artifact|
|`glob`|`string`|A `glob` pattern string. This takes precendence over above 3 options (which are used to make a glob pattern).|

### BootExecOptions

**Experimental support. May be removed or changed in a non-compatible way in future without warning**

To use `BootExecOptions` you must directly call `bootstrapper.boot()` and pass in `BootExecOptions`.
`app.boot()` provided by `BootMixin` does not take any paramters.

```ts
const bootstrapper: Bootstrapper = await this.get(BootBindings.BOOTSTRAPPER_KEY);
const execOptions: BootExecOptions = {
  booters: [MyBooter1, MyBooter2],
  filter: {
    phases: ['configure', 'discover']
  }
};

const ctx = bootstrapper.boot(execOptions);
```

You can pass in the `BootExecOptions` object with the following properties:

| Property         | Type                    | Description                                      |
| ---------------- | ----------------------- | ------------------------------------------------ |
| `booters`        | `Constructor<Booter>[]` | Array of Booters to bind before running `boot()` |
| `filter.booters` | `string[]`              | Names of Booter classes that should be run       |
| `filter.phases`  | `string[]`              | Names of Booter phases to run                    |

## Available Booters

### ControllerBooter

#### Description
Discovers and binds Controller Classes using `app.controller()`.

#### Options
The Options for this can be passed via `BootOptions` when calling `app.boot(options:BootOptions)`.

The options for this are passed in a `controllers` object on `BootOptions`.

Available Options on the `controllers` object on `BootOptions` are as follows:

|Options|Type|Default|Description|
|-|-|-|-|
|`dirs`|`string \| string[]`|`['controllers']`|Paths relative to projectRoot to look in for Controller artifacts|
|`extensions`|`string \| string[]`|`['.controller.js']`|File extensions to match for Controller artifacts|
|`nested`|`boolean`|`true`|Look in nested directories in `dirs` for Controller artifacts|
|`glob`|`string`||A `glob` pattern string. This takes precendence over above 3 options (which are used to make a glob pattern).|

### RepositoryBooter

#### Description
Discovers and binds Repository Classes using `app.repository()` (Application must use
`RepositoryMixin` from `@loopback/repository`).

#### Options
The Options for this can be passed via `BootOptions` when calling `app.boot(options:BootOptions)`.

The options for this are passed in a `repositories` object on `BootOptions`.

Available Options on the `repositories` object on `BootOptions` are as follows:

|Options|Type|Default|Description|
|-|-|-|-|
|`dirs`|`string \| string[]`|`['repositories']`|Paths relative to projectRoot to look in for Repository artifacts|
|`extensions`|`string \| string[]`|`['.repository.js']`|File extensions to match for Repository artifacts|
|`nested`|`boolean`|`true`|Look in nested directories in `dirs` for Repository artifacts|
|`glob`|`string`||A `glob` pattern string. This takes precendence over above 3 options (which are used to make a glob pattern).|

## Contributions

- [Guidelines](https://github.com/strongloop/loopback-next/wiki/Contributing#guidelines)
- [Join the team](https://github.com/strongloop/loopback-next/issues/110)

## Tests

Run `npm test` from the root folder.

## Contributors

See [all contributors](https://github.com/strongloop/loopback-next/graphs/contributors).

## License

MIT
