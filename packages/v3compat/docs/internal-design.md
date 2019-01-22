# Internal Design

This document outlines how v3compat works under the hood.

## Differences between LoopBack version 3 and version 4

### Models and repositories

In LoopBack 4, a Model (Entity) describes the data schema and a Repository (or a
(e.g. a connection pool). Models, Repositories, Services and DataSources are
register with IoC container (`Context`) and later injected into controllers via
Dependency Injection.

In LoopBack 3, a Model class not only describes the data schema, but also
implements the related behavior using a DataSource as the backing
implementation. There are multiple registries holding references to different
classes and objects: a registry of data-sources at application level, a registry
of models attached to an application, etc.

To support LB3 models in LB4 applications, we need to recreate LB3-like model
registry and application object.

### REST API

When an incoming HTTP request arrives to a LoopBack 4 application, it is
processed by the following layers:

1. The REST layer finds the controller method to handle the requested verb and
   path.
2. The REST layer parses invocation arguments from the request, using metadata
   from OpenAPI `OperationObject`.
3. The controller method is invoked.
4. The controller method invokes a Repository or a Service method to access the
   backing database/web-service.
5. The repository/service returns data.
6. The controller method converts data from repository/service format to a form
   suitable for HTTP transport.
7. The REST layer converts the value returned by the controller method into a
   real HTTP response, using metadata from OpenAPI `OperationObject`.

For comparison, LoopBack 3 handles incoming requests as follows:

1. The REST layer finds _the remote method_ to handle the requested verb and
   path.
2. The REST layer parses invocation arguments from the request, using
   _strong-remoting metadata supplied by the remote method._
3. The remote method is invoked.
4. The remote method is typically _a model method contributed by
   `DataAccessObject`_, `KeyValueAccessObject` or a custom access-object
   provided by a connector for web-services.
5. The model method returns data from the database/web-service.
6. _(There is no conversion from DAO to REST format.)_
7. The REST layer converts the value returned by the remote method into a real
   HTTP response, using metadata from _strong-remoting metadata supplied by the
   remote method._

In order to expose LB3 models via LB4 REST API, we need to convert remoting
metadata into OpenAPI Spec and build controllers (or handler routes) to expose
remote methods in a form that LB4 can invoke.

## Implementation overview

To allow LoopBack 3 models to function inside a LoopBack 4 application, we need
to implement several components.

### Model and DataSource registration

- [`Lb3Application`](../src/core/lb3-application.ts) implements API provided by
  LoopBack 3 application object (`app`), it approximately corresponds to
  [lib/application.js](https://github.com/strongloop/loopback/blob/master/lib/application.js)
  with few bits from
  [lib/loopback.js](https://github.com/strongloop/loopback/blob/master/lib/loopback.js)

- [`Lb3Registry`](../src/core/lb3-registry.ts) implements a registry of models
  with methods for creating, configuring and removing models. It's mostly the
  same code as in
  [lib/registry.js](https://github.com/strongloop/loopback/blob/master/lib/registry.js).

## Base models

- [`Model`](../src/core/lb3-model.ts) builds on top of
  loopback-datasource-juggler model class and adds loopback/strong-remoting
  specific additions like `Model.remoteMethod` API. It does not expose any REST
  API endpoints, therefore it's suitable for using with Service connectors
  (SOAP, REST). The v3compat implementation is mostly copying the code from
  [lib/model.js](https://github.com/strongloop/loopback/blob/master/lib/model.js)

- [`PersistedModel`](../src/core/lb3-persisted-model.ts) builds on top of
  `Model` and exposes `DataAccessObject` (`CRUD`) endpoints via the REST API.
  The v3compat implementation is mostly copying the code from
  [lib/persisted-model.js](https://github.com/strongloop/loopback/blob/master/lib/persisted-model.js)

## Remoting metadata

In order to expose shared methods via LB4 REST API, we need to provide
infrastructure for specifying remoting metadata first.

- [`SharedClass`](../src/remoting/shared-class.ts) represents a resource
  grouping multiple operations, it is a direct counter-part of strong-remoting's
  [lib/shared-class.js](https://github.com/strongloop/strong-remoting/blob/master/lib/shared-class.js)

- [`SharedMethod`](../src/remoting/shared-method.ts) represents a single REST
  operation (possibly exposed at multiple endpoints), the implementation is
  mostly copied from strong-remoting's
  [lib/shared-method.js](https://github.com/strongloop/strong-remoting/blob/master/lib/shared-method.js)

## REST layer

With remote methods defined and described with necessary metadata, it's time to
build a REST layer exposing these methods as REST endpoints.

- [`specgen`](../src/specgen) provides conversion utilities for building OpenAPI
  spec from strong-remoting metadata. The code is loosely based on
  loopback-swagger's
  [specgen](https://github.com/strongloop/loopback-swagger/tree/master/lib/specgen).

- [`Lb3ModelController`](../src/remoting/lb3-model-controller.ts) is as a base
  controller class acting as a bridge to convert LB4 controller method
  invocations into an invocation of an LB3 shared method. It accepts arguments
  parsed by `@loopback/rest` from the incoming request and converts them into a
  list of argument expected by the remote method. When the remote method
  returns, the controller converts the result back to the format expected by
  LB4.

- [`RestAdapter`](../src/remoting/rest-adapter.ts) puts it all together. For
  each LB3 model registered in the application, it builds a LB4 controller class
  and defines a new controller method for each remote method provided by the LB3
  model. It uses `specgen` to convert LB3 remoting metadata into OpenAPI spec
  expected by LB4, and calls `Lb3ModelController` method to invoke the remote
  method when a request arrives.

## Bootstrapper

[`Lb3ModelBooter`](../src/boot/lb3-model-booter) is a LB4 Booter class that
performs the following tasks:

- It loads individual model definitions from `models/{name}.json` files, defines
  new models using `Lb3Registry` API and customizes them by running the
  appropriate `models/{name}.js` script.

- Then it processes `model-config.json` file and configures & attaches models to
  the application.
