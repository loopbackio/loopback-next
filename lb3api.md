## LoopBack 3 APIs we need to support in LB4

Open questions:

How to test code migrated from strong-remoting and loopback (v3)? Do we want to
copy existing tests over? Migrate them to async/await style? Don't bother with
testing at all, use few acceptance-level tests only?

How to split 2k+ lines of new (migrated) code into smaller chunks that will be
easier to review?

Should we register LB3 Models for dependency injection into LB4 code? Register
them as repositories, models, services, or something else?

## Should have/next iterations:

- PersistedModel - all CRUD APIs
- pick up models/methods added after app start
- hasUpdateOnlyProps (different request body schema for "create" method)
- set options from HTTP context (`http: 'optionsFromRequest'`)
- `{rest: {after: convertNullToNotFoundError}}`
- mixins
- case-insensitive URL paths (?) (/Todo is same as /todo)
- model-sources and mixin-sources in model-config.json

On aside

- https://github.com/Microsoft/TypeScript/issues/6480
- extract the Booter contract into a standalone package so that v3compat does
  not have to inherit entire boot

### Model

- beforeRemote/afterRemote/afterRemoteError
- disableRemoteMethodByName(name)

### HttpContext

- method
- req
- res
- options
- args (?)
- methodString
- result

### SharedMethod

- isMethodEnabled(sharedMethod)
- resolve(resolver)
- findMethodByName
- disableMethodByName

### Application

- app.connector(name, connector)
- app.connectors.{name}

? app.remotes()

### Model

- createOptionsFromRemotingContext
- belongsToRemoting
- Model.hasOneRemoting
- hasManyRemoting
- scopeRemoting
- nestRemoting

? PersistedModel.createChangeStream

### KeyValueModel

- get(key, options, cb)
- set(key, value, options, cb)
- expire(key, options, cb)
- ttl(key, options, cb)
- keys(filter, options, cb)
- iterateKeys(filter, options)

### Remoting features

- respond with a Buffer, respond with a ReadableStream

## WILL NOT HAVE

- allow LB3 models to be attached to LB4 dataSources. This won't work
  because LB3 requires all datasources to share the same ModelBuilder
- CLS-based context
- global registry: loopback.createModel, loopback.findModel, etc.
- Model.checkAccess(token, modelId, sharedMethod, ctx, cb)
- Model.disableRemoteMethod: was already deprecated
- REST API for creating multiple models in one call (allowArray: true)
- PersistedModel change replication
  - diff
  - changes
  - checkpoint
  - currentCheckpoint
  - replicate
  - createUpdates
  - bulkUpdate
  - getChangeModel
  - getSourceId
  - enableChangeTracking
  - rectifyAllChanges
  - handleChangeError
  - rectifyChange
  - updateLastChange
  - createChangeFilter
  - fillCustomChangeProperties

built-in models

- Access-token
- Acl
- Application
- Change
- Checkpoint
- Email
- RoleMapping
- Role
- Scope
- User

SharedClass

- find: was already deprecated
- disableMethod: was already deprecated

SharedMethod

- prototype.invoke(scope, args, remotingOptions, ctx, cb)

HttpContext

- ~~typeRegistry~~
- ~~supportedTypes~~
- invoke
- setReturnArgByName
- getArgByName
- buildArgs
- createStream
- respondWithEventStream
- resolveReponseOperation
- done
- (etc.)

Remoting

- XML
- JSON API
- piping retval of remote function into response

Booting

- datasources
