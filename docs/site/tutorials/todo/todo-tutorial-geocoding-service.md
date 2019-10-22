---
lang: en
title: 'Integrate with a geo-coding service'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/todo-tutorial-geocoding-service.html
summary:
  LoopBack 4 Todo Application Tutorial - Integrate with a geo-coding service
---

### Services

To call other APIs and web services from LoopBack applications, we recommend to
use Service Proxies as a design pattern for encapsulating low-level
implementation details of communication with 3rd-party services and providing
JavaScript/TypeScript API that's easy to consume e.g. from Controllers. See
[Calling other APIs and web services](../../Calling-other-APIs-and-Web-Services.md)
for more details.

In LoopBack, each service proxy is backed by a
[DataSource](./todo-tutorial-datasource.md), this datasource leverages one of
the service connectors to make outgoing requests and parse responses returned by
the service.

In our tutorial, we will leverage
[US Census Geocoder API](https://geocoding.geo.census.gov/geocoder/) to convert
textual US addresses into GPS coordinates, thus enabling client applications of
our Todo API to display location-based reminders,

{% include tip.html content="
In a real project, you may want to use a geocoding service that covers more
countries beyond USA and provides faster responses than US Census Geocoder API,
for example IBM's [Weather Company Data](https://console.bluemix.net/catalog/services/weather-company-data)
or [Google Maps Platform](https://developers.google.com/maps/documentation/geocoding).
" %}

### Configure the backing datasource

Run `lb4 datasource` to define a new datasource connecting to Geocoder REST
service. When prompted for a connector to use, select "REST services".

```
$ lb4 datasource
? Datasource name: geocoder
? Select the connector for geocoder: REST services (supported by StrongLoop)
? Base URL for the REST service:
? Default options for the request:
? An array of operation templates:
? Use default CRUD mapping: No
   create src/datasources/geocoder.datasource.json
   create src/datasources/geocoder.datasource.ts
 # npm will install dependencies now
    update src/datasources/index.ts

Datasource Geocoder was created in src/datasources/
```

Edit the newly created datasource configuration to configure Geocoder API
endpoints. Configuration options provided by REST Connector are described in our
docs here: [REST connector](/doc/en/lb3/REST-connector.html).

{% include code-caption.html content="/src/datasources/geocoder.datasource.json" %}

```json
{
  "connector": "rest",
  "options": {
    "headers": {
      "accept": "application/json",
      "content-type": "application/json"
    }
  },
  "operations": [
    {
      "template": {
        "method": "GET",
        "url": "https://geocoding.geo.census.gov/geocoder/locations/onelineaddress",
        "query": {
          "format": "{format=json}",
          "benchmark": "Public_AR_Current",
          "address": "{address}"
        },
        "responsePath": "$.result.addressMatches[*].coordinates"
      },
      "functions": {
        "geocode": ["address"]
      }
    }
  ]
}
```

### Implement a service provider

Create a new directory `src/services` and add the following two new files:

- `src/services/geocoder.service.ts` defining TypeScript interfaces for Geocoder
  service and implementing a service proxy provider.
- `src/services/index.ts` providing a conventient access to all services via a
  single `import` statement.

{% include code-caption.html content="src/services/geocoder.service.ts" %}

```ts
import {getService, juggler} from '@loopback/service-proxy';
import {inject, Provider} from '@loopback/core';
import {GeocoderDataSource} from '../datasources/geocoder.datasource';

export interface GeoPoint {
  /**
   * latitude
   */
  y: number;

  /**
   * longitude
   */
  x: number;
}

export interface GeocoderService {
  geocode(address: string): Promise<GeoPoint[]>;
}

export class GeocoderServiceProvider implements Provider<GeocoderService> {
  constructor(
    @inject('datasources.geocoder')
    protected dataSource: juggler.DataSource = new GeocoderDataSource(),
  ) {}

  value(): Promise<GeocoderService> {
    return getService(this.dataSource);
  }
}
```

{% include code-caption.html content="src/services/index.ts" %}

```ts
export * from './geocoder.service';
```

### Enhance Todo model with location data

Add two new properties to our Todo model: `remindAtAddress` and `remindAtGeo`.

{% include code-caption.html content="src/models/todo.model.ts" %}

```ts
@model()
export class Todo extends Entity {
  // original code remains unchanged, add the following two properties:

  @property({
    type: 'string',
  })
  remindAtAddress?: string; // address,city,zipcode

  @property({
    type: 'string',
  })
  remindAtGeo?: string; // latitude,longitude
}
```

### Look up address location in the controller

Finally, modify `TodoController` to look up the address and convert it to GPS
coordinates when a new Todo item is created.

Import `GeocodeService` interface into the `TodoController` and then modify the
Controller constructor to receive `GeocodeService` as a new dependency.

{% include code-caption.html content="src/controllers/todo.controller.ts" %}

```ts
import {inject} from '@loopback/core';
import {GeocoderService} from '../services';

export class TodoController {
  constructor(
    @repository(TodoRepository) protected todoRepo: TodoRepository,
    @inject('services.GeocoderService') protected geoService: GeocoderService,
  ) {}

  // etc.
}
```

Modify `createTodo` method to look up the address provided in `remindAtAddress`
property and convert it to GPS coordinates stored in `remindAtGeo`.

{% include code-caption.html content="src/controllers/todo.controller.ts" %}

```ts
export class TodoController {
  // constructor, etc.

  @post('/todos', {
    responses: {
      '200': {
        description: 'Todo model instance',
        content: {'application/json': {schema: getModelSchemaRef(Todo)}},
      },
    },
  })
  async createTodo(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Todo, {title: 'NewTodo', exclude: ['id']}),
        },
      },
    })
    todo: Omit<Todo, 'id'>,
  ): Promise<Todo> {
    if (todo.remindAtAddress) {
      // TODO handle "address not found"
      const geo = await this.geoService.geocode(todo.remindAtAddress);
      // Encode the coordinates as "lat,lng" (Google Maps API format). See also
      // https://stackoverflow.com/q/7309121/69868
      // https://gis.stackexchange.com/q/7379
      // eslint-disable-next-line require-atomic-updates
      todo.remindAtGeo = `${geo[0].y},${geo[0].x}`;
    }
    return this.todoRepo.create(todo);
  }

  // other endpoints remain unchanged
}
```

Congratulations! Now your Todo API makes it easy to enter an address for a
reminder and have the client application show the reminder when the device
reaches close proximity of that address based on GPS location.

### Navigation

Previous step: [Putting it all together](todo-tutorial-putting-it-together.md)
