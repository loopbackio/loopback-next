# How to migrate LB3 components

_GitHub issue: https://github.com/loopbackio/loopback-next/issues/4099_

## Out of scope

Migration of the following component is out of scope of this spike:

- [OAuth2](https://loopback.io/doc/en/lb3/OAuth-2.0.html) - will be covered by
  auth&auth migration guide
- [Passport](https://loopback.io/doc/en/lb3/Third-party-login-using-Passport.html) -
  will be covered by auth&auth migration guide
- [Synchronization](https://loopback.io/doc/en/lb3/Synchronization.html) - won't
  be implemented in LB4. It's important to mention this fact in the migration
  guide.

## Table of contents

- [Techniques](#techniques)
  - [General](#general)
  - [Models, Entities and Repositories](#models-entities-and-repositories)
  - [REST API](#rest-api)
  - [Services (local and remote)](#services-local-and-remote)
  - [API transports](#api-transports)
  - [Authentication & authorization](#authentication--authorization)
  - [Introspection](#introspection)
- [Migration](#migration)
  - [Migrate general aspects](#migrate-general-aspects)
  - [Migrate Models, Entities and Repositories](#migrate-models-entities-and-repositories)
  - [Migrate REST API](#migrate-rest-api)
  - [Migrate Services (local and remote)](#migrate-services-local-and-remote)
  - [Migrate API transports](#migrate-api-transports)
  - [Migrate Authentication & authorization](#migrate-authentication--authorization)
  - [Migrate Introspection](#migrate-introspection)
- [Overview of existing LB3 components](#overview-of-existing-lb3-components)
  - [Push notifications](#push-notifications)
  - [Storage component](#storage-component)
  - [Logging components](#logging-components)
  - [Access control](#access-control)
  - [Connectors](#connectors)
  - [Custom transports](#custom-transports)
  - [Inspecting models](#inspecting-models)
  - [Unsorted](#unsorted)
  - [Mixins](#mixins)

## Techniques

_This section provides a list of techniques compiled from existing LoopBack 3
components. Please check
[Overview of existing LB3 components](#overview-of-existing-lb3-components)
below if you are interested in learning more about where the techniques are
coming from._

### General

1. Expected component module layout and exports. How to structure the extension
   code to receive user-provided configuration & target app instance. What are
   the instructions for adding a LB4 component to a LB4 app.

2. A context shared by all parts of the application, allowing different layers
   to store and retrieve values like "the current user". In LB3, we have
   `loopback-context` based on continuation-local-storage and `options`-based
   context propagation.

3. How to migrate a component exporting mixins. See
   [Migrating model mixins ](https://loopback.io/doc/en/lb4/migration-models-mixins.html)
   for migration guide for app developers (mixin consumers).

### Models, Entities and Repositories

4. Contribute custom entities (Application, Installation) to be persisted via
   CRUD, exposed via REST and possibly further customized by the app.
   Customization options include which datasource to use, the base path where
   REST API is exposed (e.g. `/api/apps` and `/api/devices`), additional fields
   (e.g. `Application.tenantId`) and changes in persistence behavior (e.g. via
   Operation Hooks).

5. Contribute custom models (Notification) describing shape of data expected by
   the services (Push service). These models are not backed by any datasource,
   they are primarily used to describe data fields.

6. Add a custom Operation Hook to given models, with a config option to
   enable/disable this feature. The list of models can be provided explicitly in
   the component configuration or obtained dynamically via introspection (e.g.
   all models having a "belongsTo" relation with the Group model)

7. Add a custom Operation Hook to all app models matching given criteria (have a
   "belongsTo" relation with the Group model, are listed in the component
   config), plus a config option to enable/disable this feature.

8. Add new relations, e.g. between an app-provided entity `User` and a
   component-provided entity `File`. In this variant, the relation is added on
   small fixed number of models.

9. A model mixing adding new relations (`hasMany ModelEvents`), installing
   Operation Hooks (to generate model events/audit log entries), adding new
   Repository APIs (for working with related model events).

   _(The mixin-based design may be difficult to accomplish in LB4, we may want
   to use introspection and a model setting instead. The trickier part is how to
   apply changes to models added after the component was mounted.)_

10. For all models with a flag enabled in model settings, setup a custom
    `afterRemote` hook to modify the HTTP response (e.g. add additional
    headers).

### REST API

11. Add a new REST API endpoint to every (public) model/entity provided by the
    app, e.g. `GET /api/{model}/schema` returning JSON schema of the model.

12. Add a new REST API endpoint at a configured path, e.g. `/visualize`
    returning an HTML page.

13. REST API endpoints providing file upload & download.

14. Add a new local service (e.g. `Ping.ping()`) and expose it via REST API
    (e.g. `/ping`), allow the user to customize the base path where the API is
    exposed at (e.g. `/pong`).

15. Intercept REST requests handled by an endpoint contributed by a 3rd-party
    controller to invoke additional logic before the controller method is called
    (e.g. automatically create containers when uploading files) and after the
    controller method returned (e.g. post-process the uploaded file).

16. Add new REST API endpoints using Express `(req, res, next)` style.

### Services (local and remote)

17. Add a new local service (a class providing JS/TS API), e.g. Push service or
    (database) Migration service.

    The service must be configurable by the target app (e.g. Apple & Google
    credentials for push notifications, transport config for logger frameworks,
    Amazon S3 credentials for storage component, etc.).

    _LB3 typically uses component configuration. I think in LB4, we can use
    `@configure` specific to each service (see the logger extension for an
    example)._

18. Inject LB3 models (LB4 entities & repositories) to the service. These models
    can be provided either by the extension or by the target application. When
    using models from the target application, the developer needs an option to
    specify which models (entities) and associated repositories to use.

    _Note: In LB4, models/entities are used primarily for the type information
    (to describe the shape of model data). As part of the follow-up research, we
    will need to decide if it's enough to inject LB4 Repository to a component
    or if we need to inject model/entity classes too. Also note that
    `DefaultCrudReposiory` class provides a public instance property
    `entityClass` referencing the model/entity it's bound to._

19. Provide a service factory to create services dynamically at runtime, e.g.
    named child loggers created via `app.log('name')` in LB3.

20. Provide a custom service connector requiring (environment-specific)
    configuration and providing a static service API (static means the API is
    always the same, as opposed to API generated dynamically from WSDL or
    OpenAPI).

### API transports

21. A new server type to handle requests coming from a non-REST source, e.g.
    Primus/WebSockets and RabbitMQ.

22. WebSockets: mount WebSocket-handler on the underlying http server used by
    `@loopback/rest`.

23. Message queues: allow consumers to also produce (publish) new messages, e.g.
    as a response to the incoming message.

### Authentication & authorization

24. Add a custom step to the default LB3 authentication/authorization workflow,
    so that we can compute additional information about the current user (e.g.
    groups the user belongs to).

    _Note: I think this step could be replaced by lazy initialization, where the
    current user groups are computed on the first access and cached for
    subsequent use._

25. A new role resolver (e.g. using groups), the app developer needs a way how
    to configure which models/repositories to use for role resolution.

### Introspection

26. Get a list of all models (entity classes) used by the application

27. Get definition of a given model (information about properties, relations,
    mixins, etc.)

28. Get a list of all remote methods (REST API endpoints) provided by a given
    model.

29. Obtain a list of all REST endpoints provided by the application, including
    metadata about request parameters & response schema, and any other
    information necessary to configure reverse-proxy routing rules (Kong, nginx,
    etc.).

## Migration

See [Migrating components](../site/migration/components/overview.md)

### Migrate general aspects

> Component layout & instructions for mounting to an app

See
[Migrating component project layout](../site/migration/components/project-layout.md).

> Migrate context

See
[Migrating access to current context](../site/migration/components/current-context.md).

> Migrate mixins

See
[Migrating components contributing Model mixins](../site/migration/components/mixins.md)

### Migrate Models, Entities and Repositories

> Contribute custom models (Notification) describing shape of data expected by
> the services (Push service). These models are not backed by any datasource,
> they are primarily used to describe data fields.

See
[Migrate behavior-less models](../site/migration/components/models.md#migrate-behavior-less-models).

> Contribute custom entities (Application, Installation) to be persisted via
> CRUD, exposed via REST and possibly further customized by the app.
> Customization options include which datasource to use, the base path where
> REST API is exposed (e.g. `/api/apps` and `/api/devices`), additional fields
> (e.g. `Application.tenantId`) and changes in persistence behavior (e.g. via
> Operation Hooks)

See
[loopback-next#5476](https://github.com/loopbackio/loopback-next/issues/5476)

> Add a custom Operation Hook to given models, with a config option to
> enable/disable this feature. The list of models can be provided explicitly in
> the component configuration or obtained dynamically via introspection (e.g.
> all models having a "belongsTo" relation with the Group model)

See
[loopback-next#5476](https://github.com/loopbackio/loopback-next/issues/5476)

> Add new relations, e.g. between an app-provided entity `User` and a
> component-provided entity `File`. In this variant, the relation is added on
> small fixed number of models.

See
[loopback-next#5476](https://github.com/loopbackio/loopback-next/issues/5476)

> A model mixing adding new relations (`hasMany ModelEvents`), installing
> Operation Hooks (to generate model events/audit log entries), adding new
> Repository APIs (for working with related model events).
>
> _(The mixin-based design may be difficult to accomplish in LB4, we may want to
> use introspection and a model setting instead. The trickier part is how to
> apply changes to models added after the component was mounted.)_

See
[loopback-next#5476](https://github.com/loopbackio/loopback-next/issues/5476)

> For all models with a flag enabled in model settings, setup a custom
> `afterRemote` hook to modify the HTTP response (e.g. add additional headers).

See
[loopback-next#5476](https://github.com/loopbackio/loopback-next/issues/5476)

### Migrate REST API

See [Extending REST API endpoints](../site/extending/rest-api.md) for
instructions how to write components contributing REST API endpoints.

See
[Migrating components: REST API endpoints](../site/migration/components/rest-api.md)
for migration steps.

> Add a new REST API endpoint to every (public) model/entity provided by the
> app, e.g. `GET /api/{model}/schema` returning JSON schema of the model.

First, we need to find all publicly exposed models. This is tricky in LB4,
because there is no direct mapping between models and REST API endpoints. REST
APIs are implemented by Controllers, there may be more than one Controller for
each Model (e.g. `ProductController` and `ProductCategoryController`).

I am arguing that the particular use case of accessing JSON schema of a model is
not relevant in LB4, because model schema can be obtained from the OpenAPI spec
document provided by all LB4 applications out of the box.

Let's not provide any migration guide for this technique for now. We can wait
until there is user demand and then build a better understanding of user
requirements before looking for LB4 solution.

> Intercept REST requests handled by an endpoint contributed by a 3rd-party
> controller to invoke additional logic before the controller method is called
> (e.g. automatically create containers when uploading files) and after the
> controller method returned (e.g. post-process the uploaded file).

Considering that this use case is specific to the way how
loopback-component-storage implements REST API endpoints for file uploads and
downloads, I feel it's not necessary to provide migration guide for this case.

### Migrate Services (local and remote)

Created a follow-up epic
[loopback-next#5424](https://github.com/loopbackio/loopback-next/issues/5424) to
look into this area later, when there is user demand.

### Migrate API transports

Created a follow-up epic
[loopback-next#5425](https://github.com/loopbackio/loopback-next/issues/5425) to
look into this area later, when there is user demand.

### Migrate Authentication & authorization

Considering the huge difference between the auth & auth design in LB3 and LB4, I
think it's not feasible to migrate existing LB3 auth extension(s) to in way that
will preserve the high-level design. Instead, users need to approach the auth
layer with a fresh perspective and structure their extensions around the new
architecture of auth & auth.

In that light, I don't see much value in describing how to migrate techniques
from LB3 auth extensions to LB4, because such techniques are very likely to be
irrelevant in LB4 world.

Let's see what questions LoopBack 4 users come with and write content that's
useful to current LB4 applications & extensions, instead of documenting
techniques that used to be useful in the past.

> 24. Add a custom step to the default LB3 authentication/authorization
>     workflow, so that we can compute additional information about the current
>     user (e.g. groups the user belongs to).
>
>     _Note: I think this step could be replaced by lazy initialization, where
>     the current user groups are computed on the first access and cached for
>     subsequent use._
>
> 25. A new role resolver (e.g. using groups), the app developer needs a way how
>     to configure which models/repositories to use for role resolution.

### Migrate Introspection

Created a follow-up epic
[loopback-next#5426](https://github.com/loopbackio/loopback-next/issues/5426) to
look into this area later, when there is user demand.

## Overview of existing LB3 components

### Push notifications

- LB3 docs: https://loopback.io/doc/en/lb3/Push-notifications.html
- GitHub repo: https://github.com/loopbackio/loopback-component-push

This is not a typical LoopBack component because it's not configured via
`component-config.json`. Instead, the component provides a connector to be
configured via `server/datasources.json` and `server/config.json`, plus a set of
(base) models that are expected to be added to the target application.

Models:

- `application` - Holds app-specific push settings like Apple and Google
  credentials, this model is typically persisted in the "main" database. A
  single LoopBack project (application) can host multiple push-notification
  client application instances.

- `installation` - Represents a device registered for receiving push
  notifications, it's typically persisted in the "main" database. Client
  applications (iOS, Android) are consuming REST APIs of this model.

- `notification` - describes the shape (data fields) of a single notification to
  be sent. This is essentially a plain `Model` that does not need to be attached
  to any datasource.

- `push` - a service-like model to hold methods for sending notifications, e.g.
  `notifyById`, it's attached to the datasource using the push component as the
  connector.

#### Techniques

1. Contribute custom entities (Application, Installation) to be persisted via
   CRUD, exposed via REST and possibly further customized by the app.
   Customization options include base path where REST API is exposed (e.g.
   `/api/apps` and `/api/devices`), additional fields (e.g.
   `Application.tenantId`) and changes in persistence behavior (e.g. via
   Operation Hooks).

2. Contribute custom behavior (Push service) requiring user-provided
   configuration (Apple & Google credentials, dependant models/repositories to
   use).

3. Contribute custom model (Notification) to describe shape of data expected by
   the services (Push service).

### Storage component

- LB3 docs: https://loopback.io/doc/en/lb3/Storage-component.html
- GitHub repo: https://github.com/loopbackio/loopback-component-storage

Again, this is not a typical LB3 component.

- The component itself behaves like a connector and is configured via
  `server/datasources.json`.
- It provides models to be added to the target application.

Models:

- `Container` is a service-like model that should be attached to the storage
  datasource and provides JS & REST APIs for working with both containers and
  files.

The concept of a Container (groups files, similar to a directory or folder) and
a File (stores the data, such as a document or image) is implicit, there are no
LB3 models to formally describe these entities.

#### Techniques

1. Contribute a new service, it requires user-provided configuration (Amazon
   S3/IBM COS credentials).

2. Contribute a REST API for this new service, allow the user to customize the
   base path where the API is exposed at (e.g. `/api/containers`).

3. REST API implements endpoints for file upload & download.

### Logging components

_NOTE: We already have a Winston-based logging extension, see
[@loopback/logging](../../extensions/logging/README.md)._

https://www.npmjs.com/package/loopback-component-bunyan

> Creates a Bunyan logger based on configuration in component-config.json file.

This component contributes:

- `app.logger()` factory function for creating named loggers
- custom transports (bunyan streams)
- custom request-logger middleware

It uses the configuration provided in `server/component-config.json` to
configure the underlying Bunyan logging library (most notably the transports).

```ts
const log = app.logger('MyComponent');
log.debug({}, 'My log message');
```

https://www.npmjs.com/package/loopback-component-winston

> Creates winston logger based on configuration in component-config.json file.

This component contributes:

- `app.log()` function for producing logs, the method name can be customized.
- custom request-logger middleware

It uses the configuration provided in `server/component-config.json` to
configure the underlying Winston logging library (most notably the transports).

#### Techniques

1. Configure log transports.
2. Provide getter/factory functions for accessing (child) loggers, e.g. a global
   app-level logger, a child request-level logger.

### Access control

https://www.npmjs.com/package/loopback-component-access-groups

> This loopback component enables you to add multi-tenant style access controls
> to a loopback application. It enables you to restrict access to model data
> based on a user's roles within a specific context.

This component is rather complex.

1. The component is heavily depending on loopback-context, which uses
   continuation-local-storage (CLS) to provide per-request context storage. Note
   that CLS is not reliable, it can loose context e.g. when connection pools are
   involved.

2. It defines a custom strong-remoting phase executed after regular
   authorization but before method invocation, this phase adds extra properties
   to strong-remoting context.

   See
   [setupRemotingPhases](https://github.com/fullcube/loopback-component-access-groups/blob/75ad90190898305839b7cd76ef138dd875b1cc20/lib/utils.js#L45-L56)

3. Applications are expected to provide two additional models `Group` and
   `GroupAccess`, names of these models can be customized. Application models
   (e.g. `Product` and `Category`) are expected to have a `belongsTo Group`
   relation set up to enable group-based access control.

4. The component installs a new role resolver that uses group membership to
   resolve user roles.

5. It also provides some middleware:

   - `userContextMiddleware` to set the current user & their groups in the
     CLS-based context
   - `accessLoggerMiddleware` to log HTTP requests with additional information.

6. Optionally, it installs an `access` Operation Hook to all models that have a
   `belongsTo` relation to `Group` model, this hook modifies `filter` and
   `where` queries to limit the results only to model instances allowed by
   access control settings.

There is a partial example app showing the component in practice, see
https://github.com/fullcube/loopback-example-advanced-access-control

#### Techniques

1. A context shared by all parts of the application, allowing different layers
   to store and retrieve values like "the current user".

2. A custom step added to the default authentication/authorization sequence, so
   that we can compute additional information about the current user (e.g.
   groups the user belongs to).

   _Note: I think this step could be replaced by lazy initialization, where the
   current user groups are computed on the first access and cached for
   subsequent use._

3. A new role resolver, the app developer needs a way how to provide custom
   models/repositories to use for role resolution.

4. A custom Operation Hook applied to all app models matching given criteria
   (have a "belongsTo" relation with the Group model), plus a config option to
   enable/disable this feature.

### Connectors

https://www.npmjs.com/package/loopback-component-braintree

> The [Braintree](https://www.braintreepayments.com) connector for the LoopBack
> framework

AFAICT, this is a typically Service Proxy connector, similar to our SOAP/REST
connectors.

#### Techniques

- A service connector requiring (environment-specific) configuration and
  providing a static service API.

### Custom transports

https://www.npmjs.com/package/@oneflow/loopback-component-primus

> Primus adapter for loopback. It allows you to call loopback's remote methods
> via websocket.

https://www.npmjs.com/package/loopback-component-rabbitmq

> This component provides a convenient way to work with RabbitMQ within a
> loopback application. This includes:
>
> - Defining a RabbitMQ topology using the component-config.json
> - Registering message producers and consumers handlers using a mixin.
> - Inspecting RabbitMQ stats and queue statuses using a RabbitMQ loopback
>   model.
>
> In addition, an optional mixin is provided that provides an easy way to attach
> message producer and consumer helper methods directly to your loopback models.

#### Techniques

1. A new server type to handle requests coming from a non-REST source, e.g.
   Primus/WebSockets and RabbitMQ.
2. WebSockets: mount WebSocket-handler on the underlying http server used by
   `@loopback/rest`.
3. Message queues: allow consumers to also produce (publish) new messages, e.g.
   as a response to the incoming message.

### Inspecting models

https://www.npmjs.com/package/loopback-component-meta

> Component for LoopBack that adds a Meta model that can be used to retrieve
> meta data about the model definitions.

https://www.npmjs.com/package/loopback-jsonschema-generator

> Generates JSON schemas for your LoopBack models Access the generated JSON
> schema url http://yourapi.com/api/{model-plural-name}/json-schema

https://www.npmjs.com/package/loopback-component-visualizer

> Visualizing a model is sometimes a difficult task. When the data model gets
> larger, it becomes even more difficult to understand how models relate to each
> other.
>
> loopback-component-visualizer helps you in creating a model diagram with a
> representation of all the properties, methods and relationships of your models
> for your loopback application.

#### Techniques

1. Get a list of all models (entity classes) used by the application
2. Get definition of a given model (information about properties, relations,
   mixins, etc.)
3. Add a new REST API endpoint to every (public) model/entity provided by the
   app
4. Add a new REST API endpoint at a configured path (e.g. `/visualize`)
5. Get a list of all remote methods (REST API endpoints) provided by a model

### Unsorted

https://www.npmjs.com/package/loopback-component-migrate

> A library to add simple database migration support to loopback projects.
>
> Migrations that have been run will be stored in a table called 'Migrations'.
> The library will read the loopback datasources.json files based on the
> NODE_ENV environment variable just like loopback does. The usage is based on
> the node-db-migrate project.

https://www.npmjs.com/package/loopback-component-ping

> Component for LoopBack that adds a model for retrieving the internal state of
> the Node process.
>
> It is a wrapper around the express-ping package.

https://www.npmjs.com/package/component-storage

> This loopback storage component is an extension to loopback-component-storage,
> it uses 3rd party image processing library Sharp for recreating images.
>
> Usage:
> https://github.com/pbalan/component-storage/blob/master/test/fixtures/simple-app/server/boot/component-storage.js

https://www.npmjs.com/package/loopback-component-changestreamer

> The component observes a number specified models and notifies about the
> changes by SSE.
>
> The main difference with Loopback /change-stream channels is that this
> implementation creates only two observers (after save and after delete) per
> model and then streams the changes to keep-alive registered connections. In
> contrast Loopback creates two same observers for each connection.

https://www.npmjs.com/package/@aliatech/loopback-component-traceability

> Module for Loopback Framework that allows to keep a persisted traceability of
> custom operations over models

https://www.npmjs.com/package/@joinbox/loopback-component-remote-microservice

> Loopback component to expose and consume models of remote microservices.

_This component is too complex to understand, I am leaving it out of the initial
version of the migration guide._

https://www.npmjs.com/package/loopback-component-kong-sync

> This is a Loopback JS component to synchronize routes to Kong API Gateway.
>
> This component map all Models and Methods from Loopback standardizing it and
> creating the related routes in Kong.

https://www.npmjs.com/package/@joinbox/loopback-component-custom-headers

> Sets cache headers according to the model configuration

#### Techniques

1. Add entities with CRUD persistence to the app, allow the app developer to
   decide which datasource to use.
2. Add new JS/TS API (a local service) utilizing the models provided by the
   extension, e.g. `Migration.migrateTo`.
3. Add a new local service (e.g. `Ping.ping()`) and expose it via REST API (e.g.
   `/ping`).
4. Add new relations, e.g. between an app-provided entity `User` and a
   component-provided entity `File`.
5. Intercept REST requests handled by an endpoint contributed by a 3rd-party
   controller to invoke additional logic before the controller method is called
   (e.g. automatically create containers when uploading files) and after the
   controller method returned (e.g. post-process the uploaded file).
6. Add new REST API endpoints using Express `(req, res, next)` style.
7. Set up custom Operation Hooks for the given app models/entities
8. A model mixing adding new relations (`hasMany ModelEvents`), installing
   Operation Hooks (to generate model events/audit log entries), adding new
   Repository APIs (for working with related model events).
9. Obtain a list of all REST endpoints, including metadata about request
   parameters and response schema and any other information necessary to
   configure reverse-proxy routing rules (Kong, nginx, etc.).
10. For all models with a flag enabled in model settings, setup a custom
    `afterRemote` hook to modify the HTTP response (e.g. add additional
    headers).

### Mixins

Migration of mixin implementation is already covered by
[Migrating model mixins ](https://loopback.io/doc/en/lb4/migration-models-mixins.html).

However, we are missing instructions for migrating a component exporting mixins
and apps consuming mixins from 3rd party components.

Let's use the most popular mixin
[loopback-ds-timestamp-mixin](https://www.npmjs.com/package/loopback-ds-timestamp-mixin)
as an example component to drive the migration docs.
