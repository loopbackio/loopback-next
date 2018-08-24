---
lang: en
title: 'Calling other APIs and web services'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Calling-other-APIs-and-web-services.html
---

Your API implementation often needs to interact with REST APIs, SOAP Web
Services, gRPC microservices, or other forms of APIs.

To facilitate calling other APIs or web services, we introduce
`@loopback/service-proxy` module to provide a common set of interfaces for
interacting with backend services.

## Installation

```
$ npm install --save @loopback/service-proxy
```

## Usage

### Define a data source for the service backend

```ts
import {juggler} from '@loopback/service-proxy';

const ds: juggler.DataSource = new juggler.DataSource({
  name: 'GoogleMapGeoCode',
  connector: 'rest',
  options: {
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
    },
  },
  operations: [
    {
      template: {
        method: 'GET',
        url: 'http://maps.googleapis.com/maps/api/geocode/{format=json}',
        query: {
          address: '{street},{city},{zipcode}',
          sensor: '{sensor=false}',
        },
        responsePath: '$.results[0].geometry.location[0]',
      },
      functions: {
        geocode: ['street', 'city', 'zipcode'],
      },
    },
  ],
});
```

Install the REST connector used by the new datasource:

```
$ npm install --save loopback-connector-rest
```

### Declare the service interface

To promote type safety, we recommend you to declare data types and service
interfaces in TypeScript and use them to access the service proxy.

```ts
interface GeoCode {
  lat: number;
  lng: number;
}

interface GeoService {
  geocode(street: string, city: string, zipcode: string): Promise<GeoCode>;
}
```

Alternately, we also provide a weakly-typed generic service interface as
follows:

```ts
/**
 * A generic service interface with any number of methods that return a promise
 */
export interface GenericService {
  [methodName: string]: (...args: any[]) => Promise<any>;
}
```

To reference the `GenericService`:

```ts
import {GenericService} from '@loopback/service-proxy';
```

**NOTE**: We'll introduce tools in the future to generate TypeScript service
interfaces from service specifications such as OpenAPI spec.

### Declare service proxies for your controller

If your controller needs to interact with backend services, declare such
dependencies using `@serviceProxy` on constructor parameters or instance
properties of the controller class.

```ts
import {serviceProxy} from '@loopback/service-proxy';

export class MyController {
  @serviceProxy('geoService')
  private geoService: GeoService;
}
```

### Get an instance of your controller

```ts
context.bind('controllers.MyController').toClass(MyController);
const myController = await context.get<MyController>(
  'controllers.MyController',
);
```

### Make service proxies easier to test

While `@serviceProxy` decorator makes it easy to use service proxies in
controllers, it makes it difficult to write integration tests to verify that
service proxies are correctly configured/implemented in respect to the most
recent API provided by the backend service implementation. To make service
proxies easy to test, we recommend to write a
[Provider](./Creating-components.md#providers) class that will allow both
controllers and integration tests to access the same service proxy
implementation.

```ts
import {getService, juggler} from '@loopback/service-proxy';
import {inject, Provider} from '@loopback/core';
import {GeocoderDataSource} from '../datasources/geocoder.datasource';

export class GeoServiceProvider implements Provider<GeoService> {
  constructor(
    @inject('datasources.geoService')
    protected datasource: juggler.DataSource = new GeocoderDataSource(),
  ) {}

  value(): Promise<GeocoderService> {
    return getService(this.datasource);
  }
}
```

In your application, apply
[ServiceMixin](http://apidocs.loopback.io/@loopback%2fdocs/service-proxy.html#ServiceMixin)
and use `app.serviceProvider` API to create binding for the geo service proxy.

```ts
app.serviceProvider(GeoServiceProvider);
```

Finally, modify the controller to receive our new service proxy in the
constructor:

```ts
export class MyController {
  @inject('services.GeoService')
  private geoService: GeoService;
}
```

Please refer to
[Testing Your Application](./Testing-your-application.md#test-your-services-against-real-backends)
for guidelines on integration testing.
