---
lang: en
title: 'Validation in the Controller Layer'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Validation-controller-layer.html
---

In the case where validation rules are not static, validations cannot be
specified at the model level. Hence, validation can happen at the controller
layer.

Take an example of a promo code in an order, it is usually a defined value that
only valid for a certain period of time. In our CoffeeShop example here, the
area code of a phone number mostly depends on the geolocation.

## Add validation function in the Controller method

The simplest way is to apply the validation function in the controller method,
that is:

```ts
// create a validatePhoneNum function and call it here
if (!this.validatePhoneNum(coffeeShop.phoneNum, coffeeShop.city))
  throw new Error('Area code in phone number and city do not match.');
return this.coffeeShopRepository.create(coffeeShop);
```

## Add interceptor for validation

Another way is to use [interceptors](Interceptors.md).

> Interceptors are reusable functions to provide aspect-oriented logic around
> method invocations.

Interceptors have access to the invocation context, including parameter values
for the method call. It can perform more specific validations, for example,
calling a service to check if an address is valid. You can also create global,
class-level or method-level interceptors.

You can create interceptors using the
[interceptor generator](https://loopback.io/doc/en/lb4/Interceptor-generator.html)
`lb4 interceptor` command. In the CoffeeShop example, we are going to validate
the `CoffeeShop` request body for the `POST` and `PUT` call whether the area
code in the phone number matches the specified city. Since this is only
applicable to the CoffeeShop endpoints, a non-global interceptor is created,
i.e. specify `No` in the `Is it a global interceptor` prompt.

```sh
$ lb4 interceptor
? Interceptor name: validatePhoneNum
? Is it a global interceptor? No
   create src/interceptors/validate-phone-num.interceptor.ts
   update src/interceptors/index.ts

Interceptor ValidatePhoneNum was created in src/interceptors/
```

In the `ValidatePhoneNumInterceptor`, the function `intercept` is the place
where the pre-invocation and post-invocation logic can be added.

```ts
  async intercept(
    invocationCtx: InvocationContext,
    next: () => ValueOrPromise<InvocationResult>,
  ) {
    try {
      // Add pre-invocation logic here
      // ------ VALIDATE PHONE NUMBER ----------
      const coffeeShop: CoffeeShop = new CoffeeShop();
      if (invocationCtx.methodName == 'create')
        Object.assign(coffeeShop, invocationCtx.args[0]);
      else if (invocationCtx.methodName == 'updateById')
        Object.assign(coffeeShop, invocationCtx.args[1]);

      if (
        coffeeShop &&
        !this.isAreaCodeValid(coffeeShop.phoneNum, coffeeShop.city)
      ) {
        throw new HttpErrors.InternalServerError(
          'Area code and city do not match',
        );
      }
      // ----------------------------------------

      const result = await next();
      // Add post-invocation logic here
      return result;
    } catch (err) {
      // Add error handling logic here
      throw err;
    }
  }

  isAreaCodeValid(phoneNum: string, city: string): Boolean {
    // add some logic here
    // it always returns true for now
    return true;
  }
```

Now that the interceptor is created, we are going to apply this to the
`CoffeeShopController`. In `src/controllers/coffee-shop.controller.ts`:

```ts
// Add these imports for interceptors
import {inject, intercept} from '@loopback/core';
import {ValidatePhoneNumInterceptor} from '../interceptors';

// Add this line to apply interceptor to this class
@intercept(ValidatePhoneNumInterceptor.BINDING_KEY)
export class CoffeeShopController {
  // ....
}
```

## Reference

To find out more about interceptors, check out the blog posts below:

- [Learning LoopBack 4 Interceptors (Part 1) - Global Interceptors](https://strongloop.com/strongblog/loopback4-interceptors-part1/)
- [Learning LoopBack 4 Interceptors (Part 2) - Method Level and Class Level Interceptors](https://strongloop.com/strongblog/loopback4-interceptors-part2/)
