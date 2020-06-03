---
lang: en
title: 'Creating services in components'
keywords:
  LoopBack 4, Node.js, TypeScript, OpenAPI, Extensions, Components, Services
sidebar: lb4_sidebar
permalink: /doc/en/lb4/creating-components-services.html
---

In LoopBack 4, a Service class provides access to additional functionality.

- Local services are used to implement "utility" functionality, for example
  obtain a JWT authentication token for a given user.
- Service proxies are used to access 3rd-party web services (e.g. REST or SOAP),
  as further explained in
  [Calling other APIs and web services](../Calling-other-APIs-and-Web-Services.md)

In an application, a new service is typically created by running
[`lb4 service`](../Service-generator.md).

Components can contribute local services as follows.

1. Run [`lb4 service`](../Service-generator.md) and choose either
   `Local service class` or `Local service provider` as the service type to
   create.
2. In your component constructor, create a service binding and add it to the
   list of bindings contributed by the component to the target application
   class.

An example showing how to build a component contributing a local service class
(`MyService`) and a local service provider (`GeocodeServiceProvider`):

```ts
import {createServiceBinding} from '@loopback/core';
import {MyService} from './services/my.service.ts';
import {GeocodeServiceProvider} from './services/geocoder.service.ts';

export class SampleComponent implements Component {
  bindings = [
    createServiceBinding(MyService),
    createServiceBinding(GeocoderServiceProvider),
  ];
}
```
