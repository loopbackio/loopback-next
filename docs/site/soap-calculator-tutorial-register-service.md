---
lang: en
title: 'Register the Service'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/soap-calculator-register-service.html
---

### Registering the service in the Application src/application.ts

We need to add the **CalculatorService** service to the `src/application.ts`
file so that it is loaded automatically at boot time and the application knows
about its correspondent **key** to make it available in the **DI** _(Dependency
Injection)_.

#### Importing the service and helper classes

Add the following import statement after all the previous imports.

```ts
import {CalculatorServiceProvider} from './services/calculator.service';
```

Now change the following line to include a Constructor and Provider class from
_LB4_ core.

```ts
import {ApplicationConfig} from '@loopback/core';
```

change it to

```ts
import {ApplicationConfig, Constructor, Provider} from '@loopback/core';
```

#### Registering the Service and bind it to a key

Let's continue by adding the following generic method that we will use in order
to register our service and any other service that we might work in the future.

Notice that it removes the Provider key from the name of the service, so for our
service name CalculatorServiceProvider, its key will become
**services.CalculatorService** which matches the
`@inject('services.CalculatorService')` decorator parameter we used in our
controller.

**NOTE:** This will be the method for now until we place the autodiscover and
registration for services in the same way we do now for other artifacts in
**LB4**.

```ts
service<T>(provider: Constructor<Provider<T>>) {
    const key = `services.${provider.name.replace(/Provider$/, '')}`;
    this.bind(key).toProvider(provider);
  }
```

Now let's add a method that will make use of this generic `service<T>` method.

```ts
  setupServices() {
    this.service(CalculatorServiceProvider);
  }
```

Finally call this `setupServices()` method from inside the Application
constructor after the `this.sequence(MySequence);` statement.

```ts
//bind services
this.setupServices();
```

**Note:** We could have achieved the above result by just one line inside the
setupServices() method, replacing the generic method. However, the generic one
is more efficient when you need to register multiple services, to keep the
_keys_ standard.

```ts
this.bind('services.CalculatorService').toProvider(CalculatorServiceProvider);
```

### Navigation

Previous step: [Add a Controller](soap-calculator-tutorial-add-controller.md)

Next step:
[Run and Test the Application](soap-calculator-tutorial-run-and-test.md)
