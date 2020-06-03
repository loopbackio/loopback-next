---
lang: en
title: 'Differences in LoopBack 3 and LoopBack 4 booting process'
keywords:
  LoopBack 4.0, LoopBack 4, Node.js, TypeScript, OpenAPI, LoopBack 3.0, LoopBack
  3
sidebar: lb4_sidebar
permalink: /doc/en/lb4/LB3-vs-LB4-booting.html
---

## Differences between LoopBack 3 and LoopBack 4 booting process

Because of the architectural differences, the booting process is very different
in LoopBack 3 and LoopBack 4.

### In LoopBack 3

The booting process in LoopBack 3 is handled by
[loopback-boot](https://github.com/strongloop/loopback-boot), which performs the
following tasks:

#### 1. Configuration of application settings

It determines the execution environment, the application host, the application
port, the application root directory and other artifact directories.

Then it configures the LoopBack Application object from the `config.json` file
in the application root directory.

#### 2. Configuration of datasources

Datasources are determined from application options or datasource files. They
are then attached to the LoopBack Application object.

#### 3. Definition of models

Models are determined from application options or model files,
[mixins](https://loopback.io/doc/en/lb3/Defining-mixins.html) are applied, and
they are attached to their respective datasources. They are then attached to the
LoopBack Application object.

#### 4. Setting up middleware

Middleware from the middleware configuration file are resolved and added to the
LoopBack 3 middleware chain.

#### 5. Setting up components

Components from the component configuration file are resolved and are added to
the LoopBack 3 middleware chain.

#### 6. Running boot scripts

Boot scripts are resolved from the `server/boot` directory and run.

### In LoopBack 4

In LoopBack 4, the booting tasks are shared between the `@loopback/core`'s
[Application](../apidocs/apidocs.core.application.md) class and the
[@loopback/boot](../apidocs/apidocs.boot.html) package. Since your application
will extend `BootMixin` and `Application`, their separation will not be apparent
to you, and understanding of how they work together as one is not mandatory for
developing LoopBack 4 projects.

The following are the list of tasks that are performed in the LoopBack 3 booting
process, and their equivalent in LoopBack 4.

{% include tip.html content="For all the details about booting in LoopBack 4,
refer to the
[booting documentation](../Booting-an-Application.md)." %}

#### 1. Configuration of application settings

There is no `config.json` in LoopBack 4. The application options are passed in
the constructor of the [Application](../apidocs/apidocs.core.application.md)
class. Read more about application configuration
[here](../Application.md#configuring-your-application).

#### 2. Configuration of datasources

Datasources in LoopBack 3 are defined in a single `datasources.json` file. In
LoopBack 4, datasources are defined as TypeScript classes. They all reside in
the `src/datasources` directory.

{% include note.html content="Before
[loopback-next#5000](https://github.com/strongloop/loopback-next/pull/5000)
landed, datasource classes required a configuration JSON file, it is not
required anymore." %}

`BootMixin` resolves the datasources, and attaches them to the application. Read
more about datasource booter
[here](../Booting-an-Application.md#controller-booter).

Read more about LoopBack 4 datasources [here](../DataSources.md). Read more
about migrating datasources [here](./datasources.md).

#### 3. Definition of models

Although REST APIs are built around Models, they are not a part of the booting
process in LoopBack 4; Controllers and Repositories are.

Controllers and Repositories import models as regular TypeScript classes since
they are required at compile time.

{% include note.html content="Booters are LoopBack 4 artifacts that are used
for modularly adding functionality to the framework. Controllers, Repositories,
Datasources, Interceptors, etc., are added using booters, custom booters can
be written for adding new functionality to the framework." %}

Read more about migrating models [here](./models/overview.md).

#### 4. Setting up middleware

Middleware are not supported at LoopBack level yet. However, you can
[mount a LoopBack 4 application](../express-with-lb4-rest-tutorial.md) on an
Express application, which would allow you to use the familiar Express routing
methods.

{% include tip.html content="Follow our GitHub issues
[#1293](https://github.com/strongloop/loopback-next/issues/1293)
and
[#2035](https://github.com/strongloop/loopback-next/issues/2035)
to track the progress on supporting Express middlweware in LoopBack 4." %}

If you want to mount an Express router in a LoopBack 4 application, you can use
the
[RestApplication.mountExpressRouter()](../Routes.html#mounting-an-express-router)
API.

#### 5. Setting up components

In LoopBack 3, a
[component](https://loopback.io/doc/en/lb3/LoopBack-components.html) is a simple
Node.js module which exports a function with the signature
`function(app, options)`. In LoopBack 4, a
[component](../Creating-components.md) is a TypeScript class which can add
[servers](../Server.md), [observers](../Life-cycle.md),
[providers](../Creating-components.md#providers), and
[controllers](../Controllers.md) to the application using dependency injection.

LoopBack 3 components adding routes can be migrated to LoopBack 4 by moving the
functionality to the controller of a LoopBack 4 component.

#### 6. Running boot scripts

If you used LoopBack 3 boot scripts for adding routes to the application, it
should now be moved to a standalone controller, a component, or implemented
using `app.mountExpressRouter()`.

The functionality of non-routing boot scripts can be implemented as life cycle
observers. Read more about life cycle events and observers
[here](../Life-cycle.md).

For more information about migrating boot scripts in LoopBack 4, refer to the
[boot scripts migration guide](./boot-scripts.md).
