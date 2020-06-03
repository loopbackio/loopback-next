---
lang: en
title: 'Calling other APIs and web services'
keywords: LoopBack 4.0, LoopBack 4, Node.js, TypeScript, OpenAPI, REST, SOAP
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Calling-other-APIs-and-web-services.html
---

Your API implementation often needs to interact with REST APIs, SOAP Web
Services, gRPC microservices, or other forms of APIs.

To facilitate calling other APIs or web services, we introduce
`@loopback/service-proxy` module to provide a common set of interfaces for
interacting with backend services. You can create a `Service` class to provide a
common set of interfaces for interacting with backend services.

There are 3 major steps:

1. **Add a datasource**: specify the service you're trying to connect
2. **Add a service**: define how the operations/methods in the external APIs
   will be mapped to the service methods.
3. **Add a controller**: expose the REST APIs that will call the service methods

## Add a datasource

Add a datasource using the [Datasource generator](DataSource-generator.md) and
select the corresponding connector.

### Datasource for SOAP web service

For calling SOAP web services, you also need to know the URL of the SOAP web
service endpoint and its corresponding WSDL file.

```sh
$ lb4 datasource
? Datasource name: ds
? Select the connector for ds: SOAP webservices (supported by StrongLoop)
? URL to the SOAP web service endpoint: http://calculator-webservice.mybluemix.net/calculator
? HTTP URL or local file system path to the WSDL file: http://calculator-webservice.mybluemix.net/calculator?wsdl
? Expose operations as REST APIs: Yes
? Maps WSDL binding operations to Node.js methods:
```

For the last option `Maps WSDL binding operations to Node.js methods`, specify
the JSON in the format of:

```json
servicMethodName: {
  "service": "<WSDL service name>",
  "port": "<WSDL port name>",
  "operation": "<WSDL operation name>"
}
```

If you have more than one operations to map, it might be easier to edit the
DataSource configuration after it's been created. See below for the example of
the mapping of the WSDL binding operations and Node.js methods.

```ts
const config = {
  name: 'ds',
  connector: 'soap',
  url: 'http://calculator-webservice.mybluemix.net/calculator',
  wsdl: 'http://calculator-webservice.mybluemix.net/calculator?wsdl',
  remotingEnabled: true,
  // ADD THIS SNIPPET
  operations: {
    add: {
      service: 'CalculatorService', //WSDL service name
      port: 'CalculatorPort', //WSDL port name
      operation: 'add', //WSDL operation name
    },
    subtract: {
      service: 'CalculatorService',
      port: 'CalculatorPort',
      operation: 'subtract',
    },
  },
  // END OF THE SNIPPET
};
```

For details, you can refer to the SOAP connector's operations property:
https://github.com/strongloop/loopback-connector-soap#operations-property

### Datasource for REST service with OpenAPI specification

When calling REST services which comes with the OpenAPI specification, select
`OpenAPI` for connector. The [OpenAPI connector](OpenAPI-connector.html) will be
used.

```sh
$ lb4 datasource
? Datasource name: ds
? Select the connector for ds: OpenAPI (supported by StrongLoop)
? HTTP URL/path to Swagger spec file (file name extension .yaml/.yml or .json):
petstore.json
? Validate spec against Swagger spec 2.0?: No
? Security config for making authenticated requests to API:
? Use positional parameters instead of named parameters?: No
   create src/datasources/ds.datasource.ts
```

For details regarding the prompts about authentication and positional
parameters, see the [Authentication](OpenAPI-connector.html##authentication) and
[Named parameters vs positional parameters](OpenAPI-connector.html#named-parameters-vs-positional-parameters)
sections of the [OpenAPI connector page](OpenAPI-connector.html).

{% include note.html content="
Make sure the `url` in the `servers` property in the OpenAPI specification is an absolute path. If you cannot change the specification, you can save the OpenAPI spec and just modify the `url` value before creating a DataSource associated with it.
" %}

### Datasource for REST service without OpenAPI specification

In the case where the REST services do not have a corresponding OpenAPI
specification, select `REST services` for connector. We'll leave the default for
the last 3 prompts.

```sh
$ lb4 datasource
? Datasource name: restds
? Select the connector for restds: REST services (supported by StrongLoop)
? Base URL for the REST service: https://swapi.co/api/
? Default options for the request:
? An array of operation templates:
? Use default CRUD mapping: No
```

The next step is to edit the DataSource file for `options` and `operations`.

The REST connector uses the
[request module](https://www.npmjs.com/package/request) as the HTTP client. You
can configure the same options as for the `request()` function. See details in
[this documentation page](https://loopback.io/doc/en/lb4/REST-connector.html#configure-options-for-request).

The `template` object specifies the REST API invocation as a JSON template. You
can find more details in the
[Defining a custom method using a template page](https://loopback.io/doc/en/lb4/REST-connector.html#defining-a-custom-method-using-a-template).

```ts
const config = {
  name: 'restds',
  connector: 'rest',
  baseURL: 'https://swapi.co/api/',
  crud: false,
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
        url: 'https://swapi.co/api/people/{personId}',
      },
      functions: {
        getCharacter: ['personId'],
      },
    },
  ],
};
```

## Add a service

Add a service using the [Service generator](Service-generator.md) and specify
the DataSource that you just created.

### Define the methods that map to the operations

In the Service interface, define the methods that map to the operations of your
external service.

To promote type safety, we recommend you to declare data types and service
interfaces in TypeScript and use them to access the service proxy.

```ts
export interface CalculatorService {
  add(args: CalculatorParameters): Promise<AddResponse>;
  subtract(args: CalculatorParameters): Promise<SubtractResponse>;
}

export interface AddResponse {
  result: {
    value: number;
  };
}
export interface SubtractResponse {
  result: {
    value: number;
  };
}
export interface CalculatorParameters {
  intA: number;
  intB: number;
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

For details on implementing the Services with OpenAPI DataSource, see the
[OpenAPI connector page](OpenAPI-connector.html).

## Add a Controller

Add a controller using the [Controller generator](Controller-generator.md) with
the `Empty Controller` option.

### Inject the Service in the constructor

```ts
  constructor(
    @inject('services.CalculatorService')
    protected calculatorService: CalculatorService,
  ) {}
```

### Add the REST endpoints

This will be similar to how you normally add a REST endpoint in a Controller.
The only difference is you'll be calling the methods that you've exposed in the
Service interface.

```ts
@get('/add/{intA}/{intB}')
  async add(
    @param.path.integer('intA') intA: number,
    @param.path.integer('intB') intB: number,
  ): Promise<AddResponse> {
    //Preconditions

    return this.calculatorService.add(<CalculatorParameters>{
      intA,
      intB,
    });
  }
```

For calling Services with OpenAPI DataSource,

- the parameters need to be wrapped in a JSON object
- the response includes the headers and the body

See the code snippet below for illustration:

```ts
@get('/pets/{petId}', {
    responses: {
      '200': {
        description: 'Pet model instance',
        content: {'application/json': {schema: PetSchema}},
      },
    },
  })
  async findPetById(@param.path.number('petId') petId: number): Promise<Pet> {
    // wrap the parameters in a JSON object
    const response = await this.petStoreService.getPetById({petId: petId});
    // we normally only return the response body
    return response.body;
  }
}
```

## More examples

- SOAP web service tutorial:
  [https://loopback.io/doc/en/lb4/soap-calculator-tutorial.html](https://loopback.io/doc/en/lb4/soap-calculator-tutorial.html)
- REST service tutorial:
  [https://loopback.io/doc/en/lb4/todo-tutorial-geocoding-service.html](https://loopback.io/doc/en/lb4/todo-tutorial-geocoding-service.html)

## Testing your application

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
    protected dataSource: juggler.DataSource = new GeocoderDataSource(),
  ) {}

  value(): Promise<GeocoderService> {
    return getService(this.dataSource);
  }
}
```

### Troubleshooting

If you get the error about the
`app.serviceProvider() function is needed for ServiceBooter`, make sure you
apply
[ServiceMixin](https://loopback.io/doc/en/lb4/apidocs.service-proxy.servicemixin.html)
to your Application class in the `application.ts`.

```ts
export class MyLoopBackApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
)
```

Please refer to
[Testing Your Application](./Testing-your-application.md#test-your-services-against-real-backends)
for guidelines on integration testing.
