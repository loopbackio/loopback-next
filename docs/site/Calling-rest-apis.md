---
lang: en
title: 'Calling REST APIs'
keywords: LoopBack 4.0, LoopBack 4, Node.js, TypeScript, OpenAPI, REST
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Calling-rest-apis.html
---

To get started with accessing REST APIs, you need to create a datasource as
discussed below:

## Add a Datasource with OpenAPI specification

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
? Base URL for the REST service: https://swapi.dev/api/
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
  baseURL: 'https://swapi.dev/api/',
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
        url: 'https://swapi.dev/api/people/{personId}',
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
export interface PeopleService {
  getCharacter(personId: number): Promise<object>;
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
    @inject('services.PeopleService')
    protected peopleService: PeopleService,
  ) {}
```

### Add the REST endpoints

This will be similar to how you normally add a REST endpoint in a Controller.
The only difference is you'll be calling the methods that you've exposed in the
Service interface.

```ts
@get('/people/{personId}')
  async getCharacter(
    @param.path.integer('personId') personId: number,
  ): Promise<object> {
    //Preconditions

    return this.peopleService.getCharacter(personId);
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

- REST service tutorial:
  [https://loopback.io/doc/en/lb4/todo-tutorial-geocoding-service.html](https://loopback.io/doc/en/lb4/todo-tutorial-geocoding-service.html)

## Further reading

- [DataSources](DataSource.md)
- [Services](Service.md)
- [Controllers](Controller.md)
