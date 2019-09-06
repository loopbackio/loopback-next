# Booter for creating REST APIs from model files

Quoting from https://github.com/strongloop/loopback-next/issues/2036:

> In LoopBack 3, it was very easy to get a fully-featured CRUD REST API with
> very little code: a model definition describing model properties + a model
> configuration specifying which datasource to use.
>
> Let's provide the same simplicity to LB4 users too.
>
> - User creates a model class and uses decorators to define model properties.
>   (No change here.)
> - User declaratively defines what kind of data-access patterns to provide
>   (CRUD, KeyValue, etc.) and what datasource to use under the hood.
> - `@loopback/boot` processes this configuration and registers appropriate
>   repositories & controllers with the app.

In this Spike, I am demonstrating a PoC implementation of an extensible booter
that processed model configuration files in JSON formats and uses 3rd-party
plugins to build repository & controller classes at runtime.

## Basic use

Create `src/public-models` directory in your project. For each model you want to
expose via REST API, add a new `.ts` file that's exporting the model
configuration.

Example:

```ts
import {ModelApiConfig} from '@loopback/rest-crud';

module.exports = <ModelApiConfig>{
  model: 'Product',
  pattern: 'CrudRest',
  dataSource: 'db',
  basePath: '/products',
};
```

## Implementation

The solution has the following high-level parts:

1. A new package `@loopback/model-api-builder` defines the contract for plugins
   (extensions) contributing repository & controller builders.

2. A new booter `RestBooter` that loads all JSON files from
   `/public-models/{model-name}.config.json`, resolves model name into a model
   class (via Application context), finds model api builder using
   Extension/ExtensionPoint pattern and delegates the remaining work to the
   plugin.

3. An official model-api-builder plugin for building CRUD REST APIs using
   `DefaultCrudRepository` implementation. The plugin is implemented inside the
   recently introduced package `@loopback/rest-crud`.

Under the hood, the CRUD REST API builder performs two steps:

1. It defines a model-specific repository class, e.g. `ProductRepository` and
   registers it with the Application context for Dependency Injection. In the
   future, we can make this step optional and allow app developers to supply
   their own repository class (e.g. as created by `lb4 repository`) 💪

   The repository class is decorated to receive the dataSource instance via DI.

2. Then a model-specific controller class is defined, e.g. `ProductController`
   and decorated to receive the repository instance via DI. The controller is
   registered with the Application context to get it included in the public API.

I feel it's important to use model-named classes (e.g. `ProductController`)
instead of reusing the same controller/repository class name for all models.
Model-named classes make error troubleshooting and debugging easier, because
stack traces include model name in function names. (Compare
`ProductController.replaceById` with `CrudRestControllerImpl.replaceById` -
which one is more useful?)

In my proposal, model-config files are in JSON format to make programmatic edits
easier. This has a downside in TypeScript projects - these config files must
live outside `src` because TypeScript does not copy arbitrary JSON files.

## Extensibility & customization options

The proposed design enables the following opportunities to extend and customize
the default behavior of API endpoints:

- App developers can create & bind a custom repository class, this allows them
  e.g. to implement functionality similar to LB3 Operation Hooks.

- App developers can implement their own api-builder plugins, replacing the
  repository & controller builders provided by LB4 by their own logic.

- Model configuration schema is extensible, individual plugins can define
  additional model-config options to further tweak the behavior of API
  endpoints.

**Question:**

Could you elaborate more about how to customize the controller functions? Like
applying interceptors and authentication/authorization? By creating plugins?

**Answer:**

First of all, if you want to customize controller functions, then your project
has most likely outgrown the simplicity offered by `@loopback/rest-crud` and
it's time to scaffold a controller class using `lb4 controller`.

Having said that, if you want to apply the same customization to multiple
models/controllers, for example if you want to apply the same
authentication/authorization rules, then you can:

1. Fork `@loopback/rest` into your own package, or perhaps just copy the few
   relevant files into your project.
2. Modify the controller class as you like.
3. You can also change the way how repositories are created (if needed).
4. Modify the ModelApiBuilder copied from `@loobpack/rest` - give it a different
   pattern name (not `CrudRest`).
5. Bind your modified `ModelApiBuilder` to your app, so that the booter can find
   it.
6. In your model-config files, replace the `pattern` value from `CrudRest` to
   the new builder name you choose in the step 4.

## How to review the spike

I have updated `examples/todo` application to leverage this new functionality,
you can look around the updated code to see what the user experience will look
like. Take a look at how acceptance level tests are accessing the repository
created by `rest-crud` plugin.

The booter is implemented in
[`packages/booter-rest/src/rest.booter.ts`](https://github.com/strongloop/loopback-next/blob/spike/crud-rest-booter/packages/booter-rest/src/rest.booter.ts).
Initially, I created a new package for this booter, but on the second thought, I
think this booter is generic enough to be included in `@loopback/boot` under a
different name `ModelApiBooter`.

The plugin (extension) contract is defined in two files:

- [`packages/model-api-builder/src/model-api-builder.ts`](https://github.com/strongloop/loopback-next/blob/spike/crud-rest-booter/packages/model-api-builder/src/model-api-builder.ts)
- [`loopback-next/packages/model-api-builder/src/model-api-config.ts`](https://github.com/strongloop/loopback-next/blob/spike/crud-rest-booter/packages/model-api-builder/src/model-api-config.ts)

The CRUD REST API builder:
[`packages/rest-crud/src/crud-rest-builder.plugin.ts`](https://github.com/strongloop/loopback-next/blob/spike/crud-rest-booter/packages/rest-crud/src/crud-rest-builder.plugin.ts)

The remaining changes are small tweaks & improvements of existing packages to
better support this spike.

## ~~Open~~ questions answered:

**Q: Where to keep model config files?**

- `/public-models/product.config.json` (JSON, must be outside src)
- `/src/public-models/product-config.ts` (TS, can be inside src, more flexible)

**Answer:**

Let's keep them as TS files in `src/public-models`. I feel this is more
consistent with the approach we use for all other artifacts (models,
repositories, etc.). It also enables application developers to conditionally
customize model config, e.g. depending on `process.env` variables.

**Q: Load models via DI, or rather let config files to load them via require?**

```ts
// in src/public-models/product-config.ts
{
  model: require('../models/product.model').Product,
  // ...
}
```

**Answer**

Load models via DI for consistency. We can add support for loading models via
`require` later, based on user demand. The change will be backwards-compatible.

**Q: If we use TS files, then we can get rid of the extension point too**

```ts
// in src/public-models/product-config.ts
{
  model: require('../models/product.model').Product,
  pattern: require('@loopback/rest-crud').CrudRestApiBuilder,
  basePath: '/products',
  dataSource: 'db',

  // alternatively:
  dataSource: require('../datasources/db.datasource').DbDataSource,
}
```

**Answer:**

Same as for models. Use DI in the initial implementation. Add support for
`require`-based approach later, based on user demand.

## Tasks

TBD, this is a preliminary & incomplete list.

- Add `app.model(Model, name)` API to RepositoryMixin.

  - Q: Do we want to introduce `@model()` decorator for configuring dependency
    injection? (Similar to `@repository`.)

    A: No, that would clash with `@model` exported by `@loopback/repository`.

  - Q: Do we want to rework scaffolded repositories to receive the model class
    via DI?

    A: I feel that's preliminary at this point. Let's wait until we have a
    (real-world) use case for that.

- Implement model booter to scan `dist/models/**/*.model.js` files and register
  them by calling `app.model`.

- Improve rest-crud to create a named controller class.

TBD: stories for the actual implementation

### Out of scope

- Infer base path (`/products`) from model name (`Product`). I'd like to
  implement this part in the CLI scaffolding model config file.

- Allow users to supply custom repository class.
