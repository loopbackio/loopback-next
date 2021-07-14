---
lang: en
title: 'Contributing REST API endpoints'
keywords: LoopBack 4, Node.js, TypeScript, OpenAPI, Extensions, Components
sidebar: lb4_sidebar
permalink: /doc/en/lb4/creating-components-rest-api.html
---

## Overview

As mentioned in [Creating components](../Creating-components.md), components can
contribute new REST API endpoints by adding Controller classes to the list of
controllers that should be mounted on the target application.

```ts
class MyController {
  @get('/ping')
  ping() {
    return {running: true};
  }
}

export class MyComponent implements Component {
  constructor() {
    this.controllers = [MyController];
  }
}
```

This is approach works great when the metadata is hard-coded, e.g. the "ping"
endpoint path is always `/ping`.

In practice, components often need to allow applications to configure REST API
endpoints contributed by a component:

- Produce OpenAPI dynamically based on the component configuration, e.g.
  customize the path of controller endpoints.

- Exclude certain controller endpoints based on configuration. For example, our
  REST API explorer has a flag `useSelfHostedSpec` that controls whether a new
  endpoint serving OpenAPI document is added.

## Dynamic OpenAPI metadata

In order to access component configuration when defining Controller OpenAPI
metadata, the component has to change the way how Controller classes are
defined. Instead of defining controllers as static classes, a factory function
should be introduced. This approach is already used by
[`@loopback/rest-crud`](https://github.com/loopbackio/loopback-next/tree/master/packages/rest-crud)
to create dynamic CRUD REST endpoints for a given model.

Example showing a component exporting a `/ping` endpoint at a configurable base
path:

```ts
import {config} from '@loopback/core';
import {Component} from '@loopback/core';
import {RestApplication} from '@loopback/rest';
import {MyComponentBindings} from './my-component.keys.ts';
import {definePingController} from './controllers/ping.controller-factory.ts';

@injectable({tags: {[ContextTags.KEY]: MyComponentBindings.COMPONENT.key}})
export class MyComponent implements Component {
  constructor(
    @config(),
    config: MyComponentConfig = {},
  ) {
    const basePath = this.config.basePath ?? '';
    this.controller = [definePingController(basePath)];
  }
}
```

Example implementation of a controller factory function:

```ts
import {get} from '@loopback/rest';
import {Constructor} from '@loopback/core';

export function definePingController(basePath: string): Constructor<unknown> {
  class PingController {
    @get(`${basePath}/ping`)
    ping() {
      return {running: true};
    }
  }

  return PingController;
}
```

## Optional endpoints

We recommend components to group optional endpoints to standalone Controller
classes, so that an entire controller class can be added or not added to the
target application, depending on the configuration.

The example below shows a component that always contributed a `ping` endpoint
and sometimes contributes a `stats` endpoint, depending on the configuration.

```ts
import {injectable, config, ContextTags} from '@loopback/core';
import {MyComponentBindings} from './my-component.keys.ts';
import {PingController, StatsController} from './controllers';

export interface MyComponentConfig {
  stats: boolean;
}

@injectable({tags: {[ContextTags.KEY]: MyComponentBindings.COMPONENT.key}})
export class MyComponent implements Component {
  constructor(
    @config()
    config: MyComponentConfig = {},
  ) {
    this.controllers = [PingController];
    if (config.stats) this.controllers.push(StatsController);
  }
}
```

## Undocumented endpoints

Sometimes it's desirable to treat the new endpoints as internal (undocumented)
and leave them out from the OpenAPI document describing application's REST API.
This can be achieved using
[`@oas.visibility(OperationVisibility.UNDOCUMENTED)`](../Decorators/Decorators_openapi.md#oasvisibility).

```ts
class MyController {
  // constructor

  @oas.visibility(OperationVisibility.UNDOCUMENTED)
  @get('/health', {
    responses: {},
  })
  health() {
    // ...
  }
}
```

## Express routes

Sometimes it's not feasible to implement REST endpoints as LoopBack Controllers
and components need to contribute Express routes instead.

1. Modify your component class to receive the target application via constructor
   dependency injection, as described in
   [Injecting the target application instance](../Creating-components.md#injecting-the-target-application-instance).

2. In your extension, create a new `express.Router` instance and define your
   REST API endpoints on that router instance using Express API like
   [`router.use()`](https://expressjs.com/en/4x/api.html#router.use),
   [`router.get()`](https://expressjs.com/en/4x/api.html#router.METHOD),
   [`router.post()`](https://expressjs.com/en/4x/api.html#router.METHOD), etc.

3. Call `app.mountExpressRouter()` to add the Express router to the target
   application. Refer to
   [Mounting an Express router](https://loopback.io/doc/en/lb4/Routes.html#mounting-an-express-router)
   for more details.

Example component:

```ts
import {Component, CoreBindings, inject} from '@loopback/core';
import {RestApplication} from '@loopback/rest';
import express from 'express';

export class MyComponent implements Component {
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    private application: RestApplication,
  ) {
    const router = express.Router();
    this.setupExpressRoutes(router);
    application.mountExpressRouter('/basepath', router, {
      // optional openapi spec
    });
  }

  setupExpressRoutes(router: express.Router) {
    router.get('/hello', (req, res, next) => {
      res.json({msg: 'hello'});
    });
  }
}
```
