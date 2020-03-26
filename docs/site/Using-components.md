---
lang: en
title: 'Using components'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Using-components.html
---

Components serve as a vehicle to group third-party contributions to allow easier
extensibility of your Application, see [Components](Components.md) for more
details.

Components can be added to your application using the `app.component()` method.

The following is an example of installing and using a component.

Install the following dependencies:

```sh
npm install --save @loopback/authentication
```

To load the component in your application:

```ts
import {RestApplication} from '@loopback/rest';
import {AuthenticationComponent} from '@loopback/authentication';

const app = new RestApplication();
// Add component to Application, which provides bindings used to resolve
// authenticated requests in a Sequence.
app.component(AuthenticationComponent);
```

## Available components

LoopBack ships the following components:

### BootComponent

- [@loopback/boot](Booting-an-Application.md)

### RestComponent

- [@loopback/rest](Server.md)

### RestExplorerComponent

- [@loopback/rest-explorer](Self-hosted-REST-API-Explorer.md)

### CrudRestComponent

- [@loopback/rest-crud](Creating-CRUD-REST-apis.md)

### AuthenticationComponent

- [@loopback/authentication](Loopback-component-authentication.md)

### AuthorizationComponent

- [@loopback/authorization](Loopback-component-authorization.md)

### Lb3AppBooterComponent

- [@loopback/booter-lb3app](Boot-and-Mount-a-LoopBack-3-application.md)

### CronComponent

- [@loopback/cron](Running-cron-jobs.md)

### Cloud native extensions

- Health check: [@loopback/extension-health](Health.md) (Experimental)
- Metrics for Prometheus: [@loopback/extension-metrics](Metrics.md)
  (Experimental)
