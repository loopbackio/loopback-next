---
lang: en
title: 'Migrating model definitions and built-in APIs'
keywords: LoopBack 4.0, LoopBack 4, LoopBack 3, Migration
sidebar: lb4_sidebar
permalink: /doc/en/lb4/migration-models-core.html
---

In LoopBack 3, a single model class has three responsibilities: it describes
shape of data (schema), provides persistence-related behavior and implements
public (REST) API.

In LoopBack 4, a model class is no longer responsible for everything. We have
[Models](../../Model.md) to describe shape of data,
[Repositories](../../Repositories.md) to provide persistence-related behavior
and finally [Controllers](../../Controllers.md) to implement public APIs. The
section
[Migrating models persisted in a database](#migrating-models-persisted-in-a-database)
describes how to create these artifacts for models persisted in a database.

There are even more changes when accessing web services, for example using
`loopback-connector-soap` or `loopback-connector-rest`. In LoopBack 4, we don't
use model classes to provide service clients. Instead, we use the concept of a
[Service proxy](../../Calling-other-APIs-and-Web-Services.md). The migration
path from LoopBack 3 models to LoopBack 4 services is described in the section
[Migrating models backed by web service connectors](#migrating-models-backed-by-web-service-connectors).

## Migrating models persisted in a database

To migrate a LoopBack 3 model to LoopBack 4, we need to create new artifacts to
cover all three responsibilities.

### Import Model definition

The first step is to import model definition that describes the shape of data.
Fortunately, there is an automated tool to do the tedious work for you.

Assuming you have a LoopBack 4 project with your old LoopBack 3 application
inside `lb3app` directory (as shown in
[Mounting a LoopBack 3 application](../mounting-lb3app.md)), you can run the
following command to import one or more LoopBack 3 models to your LoopBack 4
application:

```sh
$ lb4 import-lb3-models lb3app/server/server
```

You can learn more about this command in our CLI Reference, see
[Importing models from LoopBack 3 projects](../../Importing-LB3-models.md).

### Configure persistence

LoopBack 3 offers declarative approach for configuring model persistence: you
add a new entry to `server/model-config.json` to configure the dataSource, and
the framework does the rest.

LoopBack 4 is more flexible and allows you to provide custom persistence
behavior via a Repository class. To use the default CRUD implementation, you can
choose to inherit from the `DefaultCrudRepository`, this will give you mostly
the same behavior as you already know from LoopBack 3.

Run the following command to create repository classes for your imported models,
pick `DefaultCrudRepository` or `DefaultKeyValueRepository` as the repository
base class.

```sh
$ lb4 repository
```

You can learn more about this command in our CLI Reference, see
[Repository generator](../../Repository-generator.md).

### Define public (REST) API

LoopBack 3 uses the same declarative approach for both persistence behavior and
REST API implementation. In LoopBack 4, API is implemented by Controller
classes.

Run the following command to create controller classes for your imported models,
pick `REST Controller with CRUD functions` as the controller type.

```sh
$ lb4 controller
```

{% include note.html content="
We don't have a template for KeyValue controllers yet. Pull requests are welcome!
" %}

### Declarative approach

We are working on declarative support that will allow you to avoid custom
repository and controller classes. It will be possible to configure both the
persistence behavior and public API via a JSON-like file. Follow the progress in
[loopback-next#2036](https://github.com/strongloop/loopback-next/issues/2036).

## Migrating models backed by web service connectors

The instructions above work great if your model is persisted in a database, but
they are not suitable for importing models backed by a web service connector,
for example SOAP or REST. As explained at the top, LoopBack 4 uses the concept
of a [Service proxy](../../Calling-other-APIs-and-Web-Services.md) to provide a
client for accessing external services.

### Manual steps

To migrate a LoopBack 3 model backed by a web service:

1. Add a service to define how the operations/methods in the external APIs will
   be mapped to the service methods.
2. Add a controller to define REST API endpoints exposing the selected service
   methods.

Unfortunately, there is no automated migration tool yet, please follow the
instructions in
[Calling other APIs and web services](../../Calling-other-APIs-and-Web-Services.md)
to create a service and a controller manually.

### Declarative approach

We would like to eventually support declarative approach similar to what
LoopBack 3 offers. You can follow the progress in
[loopback-next#3717](https://github.com/strongloop/loopback-next/issues/3717).
If you are interested in this feature, then please upvote the GitHub issue to
let us know!
