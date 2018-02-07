# @loopback/boot

A collection of Booters for LoopBack Applications

# Overview

A Booter is a Class that can be bound to an Application and is called
to perform a task before the Application is started. A Booter may have multiple
phases to complete its task.

An example task of a Booter may be to discover and bind all artifacts of a
given type.

A BootStrapper is needed to manage the Booters and to run them. This is packaged
in BootComponent. Add `BootComponent` to your `Application` to use the default
`BootStrapper` and `Booters`.

## Installation

```shell
$ npm i @loopback/boot
```

## Basic Use

```ts
import {Application} from '@loopback/core';
import {BootComponent} from '@loopback/boot';
const app = new Application();
app.component(BootComponent);

await app.boot({
  projectRoot: __dirname,
  booters: [RepositoryBooter], // Register Booters as part of call to app.boot()
  controllers: {
    dirs: ['ctrl'],
    extensions: ['.ctrl.js'],
    nested: true
  }
}); // Booter gets run by the Application
```

### BootOptions
List of Options available on BootOptions Object.

|Option|Type|Description|
|-|-|-|
|`projectRoot`|`string`|Absolute path to the root of the LoopBack 4 Project. **Required**|
|`booters`|`Constructor<Booter>[]`|Array of Booters to bind before booting. *Optional*|
|`filter`|`Object`|An Object to filter Booters and phases for finer control over the boot process. *Optional*|
|`filter.booters`|`string[]`|Names of Booters that should be run (all other bound booters will be ignored).|
|`filter.phases`|`string[]`|Names of phases and order that they should be run in.|

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
|`dirs`|`string | string[]`|`['controllers']`|Paths relative to projectRoot to look in for Controller artifacts|
|`extensions`|`string | string[]`|`['.controller.js']`|File extensions to match for Controller artifacts|
|`nested`|`boolean`|`true`|Look in nested directories in `dirs` for Controller artifacts|
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
