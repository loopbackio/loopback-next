---
lang: en
title: 'Calling other APIs and web services'
keywords: LoopBack 4.0, LoopBack 4
tags:
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Calling-other-APIs-and-web-services.html
summary:
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

### Bind data sources to the context

```ts
import {Context} from '@loopback/context';

const context = new Context();
context.bind('dataSources.geoService').to(ds);
```

**NOTE**: Once we start to support declarative datasources with
`@loopback/boot`, the datasource configuration files can be dropped into
`src/datasources` to be discovered and bound automatically.

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
  @serviceProxy('geoService') private geoService: GeoService;
}
```

### Get an instance of your controller

```ts
context.bind('controllers.MyController').toClass(MyController);
const myController = await context.get<MyController>(
  'controllers.MyController',
);
```
