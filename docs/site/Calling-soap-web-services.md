---
lang: en
title: 'Calling SOAP Web Services'
keywords: LoopBack 4.0, LoopBack 4, Node.js, TypeScript, OpenAPI, SOAP
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Calling-soap-web-services.html
---

To get started with accessing SOAP Web services, you need to create a datasource
as discussed below:

## Add a datasource

Add a datasource using the [Datasource generator](DataSource-generator.md) and
select the corresponding connector.

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

If you have more than one operation to map, it might be easier to edit the
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

For details, you can refer to the
[SOAP connector's operations property](https://github.com/loopbackio/loopback-connector-soap#operations-property)

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

## Further reading

- [DataSources](DataSource.md)
- [Services](Service.md)
- [Controllers](Controller.md)
