## LoopBack 3 APIs we need to support in LB4

Open questions:

How to test code migrated from strong-remoting and loopback (v3)? Do we want to
copy existing tests over? Migrate them to async/await style? Don't bother with
testing at all, use few acceptance-level tests only?

How to split 1k+ lines of new (migrated) code into smaller chunks that will be
easier to review?

TODO:

1. expose remote methods via REST
2. boot

## Should have/next iterations:

- PersistedModel - all CRUD APIs
- register Models and DataSources for dependency injection?
- allow LB3 models to be attached to LB4 dataSources?
- pick up models/methods added after app start
- hasUpdateOnlyProps (different request body schema for "create" method)
- set options from HTTP context (`http: 'optionsFromRequest'`)
- `{rest: {after: convertNullToNotFoundError}}`
- mixins
- case-insensitive URL paths (?) (/Todo is same as /todo)

## Model

- beforeRemote/afterRemote/afterRemoteError
- disableRemoteMethodByName(name)

## HttpContext
- method
- req
- res
- options
- args (?)
- methodString
- result

## SharedMethod
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

- respond with a  Buffer, respond with a ReadableStream

## Won't have

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
