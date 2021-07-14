---
lang: en
title: 'Accessing Services'
keywords: LoopBack 4.0, LoopBack 4, Node.js, TypeScript, OpenAPI, REST, SOAP
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Accessing-services.html
redirect_from:
  - /doc/en/lb4/Calling-other-APIs-and-Web-Services.html
---

## Service proxy

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

## Make service proxies easier to test

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

## Troubleshooting

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

## Try it out

- [Calling SOAP Web Services](Calling-soap-web-services.md)
- [Calling REST APIs](Calling-rest-apis.md)
