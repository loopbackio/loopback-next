---
lang: en
title: 'Service Decorator'
keywords: LoopBack 4.0, LoopBack-Next
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Decorators_service.html
---

## Service Decorator

`@service` injects an instance of a given service from a binding matching the
service interface.

Syntax:
`@service(serviceInterface: ServiceInterface, metadata?: InjectionMetadata)`

The service interface can be a class. For example:

```ts
class MyController {
  constructor(@service(MyService) public myService: MyService) {}
}
```

If the service is modeled as a TypeScript interface, we need to use a string or
symbol to represent the interface as TypeScript interfaces cannot be reflected
at runtime.

```ts
const MyServiceInterface = 'MyService';
class MyController {
  constructor(@service(MyServiceInterface) public myService: MyService) {}
}
```

```ts
const MyServiceInterface = Symbol('MyService');
class MyController {
  constructor(@service(MyServiceInterface) public myService: MyService) {}
}
```

If the service interface is not specified, it can be inferred from TypeScript
design:type metadata.

```ts
class MyController {
  // MyService is inferred from TypeScript design type
  constructor(@service() public myService: MyService) {}
}
```

Please note the class has to be bound to the context with toClass() or a
matching tag named `serviceInterface`.

```ts
const ctx = new Context();
ctx.bind('my-service').toClass(MyService); // The service interface is MyService
```

or

```ts
import {CoreTags, asService} from '@loopback/core';

const myService = new MyService();
ctx
  .bind('my-service')
  .to(myService)
  .tag({[CoreTags.SERVICE_INTERFACE]: MyService});

ctx.bind('my-sub-service').toClass(MySubService).apply(asService(MyService));
```

The services can also be registered with `Application`:

```ts
const app: Application = ...;
app.service(MyService);
app.service(MySubService, {serviceInterface: MyService});
```
