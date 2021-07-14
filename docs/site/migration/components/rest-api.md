---
lang: en
title: 'Migrating components: REST API endpoints'
keywords:
  LoopBack 4, LoopBack 3, Node.js, TypeScript, OpenAPI, Migration, Extensions,
  Components
sidebar: lb4_sidebar
permalink: /doc/en/lb4/migration-extensions-rest-api.html
---

{% include tip.html content="
Missing instructions for your LoopBack 3 use case? Please report a [Migration docs issue](https://github.com/loopbackio/loopback-next/issues/new?labels=question,Migration,Docs&template=Migration_docs.md) on GitHub to let us know.
" %}

Please get yourself familiar with
[Contributing REST API endpoints](../../extending/rest-api.md) first. It's
important to understand different ways how LoopBack 4 components can contribute
REST API endpoints to target applications, before learning about the migration
from LoopBack 3.

In our research of existing LoopBack 3 components, we have identified several
different use cases:

1. Add a new REST API endpoint at a configured path, e.g. `/visualize` returning
   an HTML page.

2. REST API endpoints providing file upload & download.

3. Add a new local service (e.g. `Ping.ping()`) and expose it via REST API (e.g.
   `/ping`), allow the user to customize the base path where the API is exposed
   at (e.g. `/pong`).

4. Add new REST API endpoints using Express `(req, res, next)` style.

In the following text, we will describe how to migrate these use cases from
LoopBack 3 style to LoopBack 4.

## General instructions

There are different ways how a LoopBack 3 component can contribute new REST API
endpoints:

- Some extensions are adding remote methods to existing or newly-created models.
- Other extensions are contributing Express-style routes.

We recommend extension authors to convert their LoopBack 3 routes to LoopBack 4
Controller methods wherever possible.

1. Create a new Controller class and add it to your component, see
   [Contributing REST API endpoints](../../extending/rest-api.md#overview).

2. Move your LoopBack 3 REST API endpoints to the new controller class.

3. Decide if you want these endpoints included in OpenAPI spec. Follow the steps
   in
   [Undocumented endpoints](../../extending/rest-api.md#undocumented-endpoints)
   to hide the new endpoints from the OpenAPI spec describing the target
   application's API.

4. Optionally, if you want to make your REST endpoints configurable by target
   applications, then follow the steps in
   [Dynamic OpenAPI metadata](../../extending/rest-api.md#dynamic-openapi-metadata)
   to wrap you controller method in a class factory function.

## Migrating REST API endpoints returning HTML pages

To migrate an endpoint that's returning files (or any other non-JSON payload),
please follow [General instructions](#general-instructions) and then perform two
additional steps:

1. Modify the controller constructor to inject the HTTP response.

   ```ts
   import {RestBindings, Response} from '@loopback/rest';

   class MyController {
     constructor(@inject(RestBindings.Http.RESPONSE) response: Response) {}
   }
   ```

2. In the LoopBack 4 controller method, use Express API like `res.contentType()`
   and `res.send()` to send back the result. (This is a workaround until
   [loopback-next#436](https://github.com/loopbackio/loopback-next/issues/436)
   is implemented).

## Migrating file upload & download

1. Follow [General instructions](#general-instructions) to create LoopBack 4
   controllers for your endpoints.

2. Follow the instructions in
   [Upload and download files ](../../File-upload-download.md) to implement file
   upload & download functionality in the migrated endpoints.

## Migrating Express routes

We recommend extension authors to use
[Controllers](https://loopback.io/doc/en/lb4/Controllers.html) as a better
alternative to low-level Express route API.

If it's not feasible to implement REST endpoints as LoopBack Controllers:

1. Follow the instructions in
   [Express routes](../../extending/rest-api.md#express-routes) to setup an
   Express router in your LoopBack 4 component and contribute it to the target
   application.

2. Take the implementation of Express routes from your LoopBack 3 component and
   mount these routes on the Express router created in the previous step, as
   explained in [Express routes](../../extending/rest-api.md#express-routes).

## Migrating local services exposed via REST API

Consider the following scenario:

- A LoopBack 3 component is contributing a new Model (e.g. `Ping`) providing
  various local services (e.g. `Ping.ping()`) and exposing these services via
  REST API (e.g. at `GET /ping`).

How to migrate such components:

1. Follow the steps in
   [Creating services in components](../../extending/services.md) to add a new
   local service to your LoopBack 4 component.

2. Move the implementation of your LoopBack 3 service model (e.g. `Ping`) to the
   newly created LoopBack 4 local service class.

3. Follow the steps in
   [Contributing REST API endpoints](../../extending/rest-api.md) to add a new
   controller class to your LoopBack 4 component.

4. Use [Dependency Injection](../../Dependency-injection.md) to inject an
   instance of the local service into the controller class.

5. For each service method you want to expose via REST API, implement a new
   controller method calling the Service class API under the hood.

An example implementation of the ping service class:

```ts
import {injectable, BindingScope} from '@loopback/core';

@injectable({scope: BindingScope.TRANSIENT})
export class PingService {
  ping() {
    return {status: 'ok'};
  }
}
```

An example implementation of the ping controller factory:

```ts
import {injectable, BindingScope, Constructor, inject} from '@loopback/core';
import {get} from '@loopback/rest';
import {PingBindings} from '../ping.keys';
import {PingService} from '../services/ping.service.ts';

export function definePingController(basePath: string): Constructor<unknown> {
  @injectable({scope: BindingScope.SINGLETON})
  class PingController {
    constructor(
      @inject(PingBindings.PING_SERVICE)
      private pingService: PingService,
    ) {}

    @get(`${basePath}/ping`)
    ping() {
      return this.pingService.ping();
    }
  }

  return PingController;
}
```

An example component using contributing a ping service exposed via REST, using
the local service and the controller factory implemented in code snippets above:

```ts
import {createServiceBinding} from '@loopback/core';
import {definePingController} from './controllers/ping.controller.ts';
import {PingBindings} from './keys';
import {PingService} from './services/ping.service.ts';
import {PingComponentConfig} from './types';

@injectable({tags: {[ContextTags.KEY]: PingBindings.COMPONENT.key}})
export class PingComponent implements Component {
  constructor(
    @config(),
    config: PingComponentConfig = {},
  ) {
   this.bindings = [
      createServiceBinding(PingService),
   ];

    const basePath = this.config.basePath ?? '';
    this.controllers = [
      definePingController(basePath)
    ];
  }
}
```
