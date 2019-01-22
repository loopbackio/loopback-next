# @loopback/v3compat

A compatibility layer simplifying migration of LoopBack 3 models to LoopBack 4+.

## Installation

```sh
npm install --save @loopback/v3compat
```

## Basic use

1. Modify your Application class and apply `CompatMixin`.

   ```ts
   import {CompatMixin} from '@loopback/v3compat';
   // ...

   export class MyApplication extends CompatMixin(
     BootMixin(ServiceMixin(RepositoryMixin(RestApplication))),
   ) {
     // ...
   }
   ```

2. Register your legacy datasources in Application's constructor.

   ```ts
   this.v3compat.dataSource('db', {
     name: 'db',
     connector: 'memory',
   });
   ```

3. Copy your LoopBack 3 model files from `common/models` to `legacy/models`
   directory, for example:

   ```text
   legacy/models/coffee-shop.js
   legacy/models/coffee-shop.json
   ```

   IMPORTANT! These files must live outside your `src` directory, out of sight
   of TypeScript compiler.

4. Copy your `server/model-config` to `src/legacy/model-config.json`.

   Remove references to LoopBack 3 built-in models like User and ACL. LoopBack 4
   does not support local authentication yet.

   Remove `_meta` section, LoopBack 4 does not support this config option.

## Developer documentation

See [internal-design.md](./docs/internal-design.md) for a detailed documentation
on how the compatibility layer works under the hood.

## Implementation status

### Supported features

These features are already implemented in this PoC and work out of the box.

#### LoopBack application

- Create a new dataSource: `app.v3compat.dataSource()`
- Create a new model: `app.v3compat.registry.createModel()`)
- Configure a model and expose it via REST API: `app.v3compat.model()`

#### Persistence

- All loopback-datasource-juggler features known from LoopBack 3.x are fully
  supported. The compatibility layer is using loopback-datasource-juggler v4
  directly.

#### Remoting

- Models can expose custom remote methods via REST API using
  `MyModel.remoteMethod(name, options)` API.

- The remoting layer supports most remoting features: HTTP verb and path
  configuration of a remote method, `accepts`/`returns` parameters, etc.

- Few DataAccessObject APIs like `create` and `find` are exposed via the REST
  API. The rest of these methods should be exposed soon.

### Breaking changes

- The implementation has switched from `bluebird` to native promises. Promises
  returned by LoopBack's APIs do not provide Bluebird's sugar APIs anymore.

- "accepts" parameter with type `any` are treated as `string`, the value is
  never coerced.

- Coercion at REST API layer works differently, the implementation switched from
  our own coercion (implemented by strong-remoting) to coercion provided by AJV
  library.

- The bootstrapper has been greatly simplified. It always defines all LB3 models
  found, regardless of whether they are configured in `model-config-json`. Of
  course, only models listed in `model-config.json` are attached to a datasource
  and exposed via REST API(if configured as `public`).

- Deprecated methods like `SharedClass.prototype.disableRemoteMethod` were
  removed.

### Missing features needed for 1.0 release

_TODO(bajtos): process TODO comments in the source code and add the missing
features to one of the two lists below._

- Expose all DataAccessObject (PersistedModel) methods via REST API

- Expose relation and scope endpoints via REST API. Migrate the following
  `Model` methods:

  - `belongsToRemoting`
  - `hasOneRemoting`
  - `hasManyRemoting`
  - `scopeRemoting`
  - `nestRemoting`

- Remoting hooks: `MyModel.beforeRemote`, `afterRemote`, `afterRemoteError` This
  will require `HttpContext` with the following properties:

  - `method`
  - `req`
  - `res`
  - `options`
  - `args`
  - `methodString`
  - `result`

- Convert `null` to 404 Not Found response:
  `{rest: {after: convertNullToNotFoundError}}`

- hasUpdateOnlyProps: the "create" method should have a different request body
  schema for "create" when "forceID" is enabled, because "create" requests must
  not include the "id" property.

### Features to implement later (if ever)

These features are not implemented yet. We may implement some of them in the
future, but many will never make it to our backlog. We are strongly encouraging
LoopBack 3 users to contribute the features they are interested in using.

- `MyModel.disableRemoteMethodByName`

- Pick up models and methods defined after the app has started.

- Allow remote methods to respond with a Buffer or a ReadableStream

- Allow remote methods to set a custom response status code and HTTP headers via
  "returns" parameters

- Mixins. The runtime bits provided by juggler are present, we need to add
  support for related infrastructure like a booter to load mixin definitions
  from JS files and register them with juggler.

- Current context set from HTTP context (`http: 'optionsFromRequest'`) and
  `Model.createOptionsFromRemotingContext`, see
  [Using current context](https://loopback.io/doc/en/lb3/Using-current-context.html)

- Case-insensitive URL paths. A todo model should be available at `/Todos`,
  `/todos`, etc.

- `_meta` configuration in `model-config.json`: allow the user to provide
  additional directories where to look for models and mixins. This can be
  implemented differently in LB4, for example via booter configuration.

- White-list/black-list of model methods to expose via REST API (`methods`
  property in `model-config.json` model entry).

- `SharedClass` APIs

  - `isMethodEnabled(sharedMethod)`
  - `resolve(resolver)`
  - `findMethodByName`
  - `disableMethodByName`

- Registry of connectors

  - `app.connectors.{name}`
  - `app.connector(name, connector)`

- KeyValue model and its REST API

  - `get(key, options, cb)`
  - `set(key, value, options, cb)`
  - `expire(key, options, cb)`
  - `ttl(key, options, cb)`
  - `keys(filter, options, cb)`
  - `iterateKeys(filter, options)`

### Out of scope

- `app.remotes()` and `RemoteObjects` API

- `PersistedModel.createChangeStream()`

- Allow LB3 models to be attached to LB4 dataSources. This won't work because
  LB3 requires all datasources to share the same `ModelBuilder` instance.

- CLS-based context (`loopback-context`)

- Global model registry: `loopback.createModel`, `loopback.findModel`, etc.

- REST API for creating multiple model instances in one HTTP request, using the
  same endpoint as for creating a single model instance (strong-remoting
  parameter options `allowArray: true`).

- Change replication, `Change` and `Checkpoint` models and the following
  `PersistedModel` methods:

  - `diff`
  - `changes`
  - `checkpoint`
  - `currentCheckpoint`
  - `replicate`
  - `createUpdates`
  - `bulkUpdate`
  - `getChangeModel`
  - `getSourceId`
  - `enableChangeTracking`
  - `rectifyAllChanges`
  - `handleChangeError`
  - `rectifyChange`
  - `updateLastChange`
  - `createChangeFilter`
  - `fillCustomChangeProperties`

- The built-in `Email` model and connector.

- The built-in `Application` model

- Authorization & authentication:

  - `app.enableAuth()`
  - `Model.checkAccess(token, modelId, sharedMethod, ctx, cb)`
  - `AccessToken` model
  - `Acl` model
  - `RoleMapping` model
  - `Role` model
  - `Scope` model
  - `User` model

- `SharedMethod.prototype.invoke(scope, args, remotingOptions, ctx, cb)`

- Remoting `HttpContext` properties and methods:

  - `typeRegistry`
  - `supportedTypes`
  - `invoke`
  - `setReturnArgByName`
  - `getArgByName`
  - `buildArgs`
  - `createStream`
  - `respondWithEventStream`
  - `resolveReponseOperation`
  - `done`
  - (etc.)

- Support for XML parsing (request bodies) and serialization (response bodies).

- Extension points enabling JSON API.

- Piping a return value of a remote function into HTTP response body. Remote
  methods should pass a `ReadableStream` instance in one of the "returns"
  arguments instead.

## Contributions

- [Guidelines](https://github.com/strongloop/loopback-next/blob/master/docs/CONTRIBUTING.md)
- [Join the team](https://github.com/strongloop/loopback-next/issues/110)

## Tests

Run `npm test` from the root folder.

## Contributors

See
[all contributors](https://github.com/strongloop/loopback-next/graphs/contributors).

## License

MIT
