---
lang: en
title: 'Register the Service'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/soap-calculator-tutorial-register-service.html
---

### Registering the service in the Application src/application.ts

We need to add the **CalculatorService** service to the `src/application.ts`
file so that it is loaded automatically at boot time and the application knows
about its correspondent **key** to make it available in the **DI** _(Dependency
Injection)_.

#### Importing the service and helper classes

Add the following import statements after all the previous imports.

```ts
import {ServiceMixin} from '@loopback/service-proxy';
import {CalculatorServiceProvider} from './services/calculator.service';
```

#### Applying `ServiceMixin` on our Application class

Modify the inheritance chain of our Application class as follows:

```ts
export class SoapCalculatorApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  // (no changes in application constructor or methods)
}
```

#### Registering the Service and bind it to a key

Let's continue by creating a method to register services used by our
application. Notice that we are using `this.serviceProvider` method contributed
by `ServiceMixin`, this method removes the suffix `Provider` from the class name
and uses the remaining string as the binding key. For our service provider
called `CalculatorServiceProvider`, the binding key becomes
**services.CalculatorService** and matches the
`@inject('services.CalculatorService')` decorator parameter we used in our
controller.

**NOTE:** This will be the method for now until we place the autodiscover and
registration for services in the same way we do now for other artifacts in
**LB4**.

```ts
  setupServices() {
    this.serviceProvider(CalculatorServiceProvider);
  }
```

Finally call this `setupServices()` method from inside the Application
constructor after the `this.sequence(MySequence);` statement.

```ts
//bind services
this.setupServices();
```

**Note:** We could have achieved the above result by calling the following line
inside the setupServices() method, replacing the method provided by the mixin.
However, the mixin-provided method is more efficient when you need to register
multiple services, to keep the _keys_ standard.

```ts
this.bind('services.CalculatorService').toProvider(CalculatorServiceProvider);
```

### Navigation

Previous step: [Add a Controller](soap-calculator-tutorial-add-controller.md)

Next step:
[Run and Test the Application](soap-calculator-tutorial-run-and-test.md)
