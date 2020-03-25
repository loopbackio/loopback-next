// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-validation-app
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  bind,
  Interceptor,
  InvocationContext,
  InvocationResult,
  Provider,
  ValueOrPromise,
} from '@loopback/context';
import {CoffeeShop} from '../models';

/**
 * This class will be bound to the application as an `Interceptor` during
 * `boot`
 */
@bind({tags: {key: ValidatePhoneNumInterceptor.BINDING_KEY}})
export class ValidatePhoneNumInterceptor implements Provider<Interceptor> {
  static readonly BINDING_KEY = `interceptors.${ValidatePhoneNumInterceptor.name}`;

  /*
  constructor() {}
  */

  /**
   * This method is used by LoopBack context to produce an interceptor function
   * for the binding.
   *
   * @returns An interceptor function
   */
  value() {
    return this.intercept.bind(this);
  }

  /**
   * The logic to intercept an invocation
   * It checks the area code of the phone number to make sure it matches
   * the provided city name.
   * @param invocationCtx - Invocation context
   * @param next - A function to invoke next interceptor or the target method
   */
  async intercept(
    invocationCtx: InvocationContext,
    next: () => ValueOrPromise<InvocationResult>,
  ) {
    // Add pre-invocation logic here
    let coffeeShop: CoffeeShop | undefined;
    if (invocationCtx.methodName === 'create')
      coffeeShop = invocationCtx.args[0];
    else if (invocationCtx.methodName === 'updateById')
      coffeeShop = invocationCtx.args[1];

    if (
      coffeeShop &&
      !this.isAreaCodeValid(coffeeShop.phoneNum, coffeeShop.city)
    ) {
      const err: ValidationError = new ValidationError(
        'Area code and city do not match',
      );
      err.statusCode = 400;
      throw err;
    }

    const result = await next();
    // Add post-invocation logic here
    return result;
  }

  isAreaCodeValid(phoneNum: string, city: string): Boolean {
    // add some dummy logic here
    const areaCode: string = phoneNum.slice(0, 3);

    if (city.toLowerCase() === 'toronto')
      return areaCode === '416' || areaCode === '647';

    // it always returns true for now
    return true;
  }
}

class ValidationError extends Error {
  code?: string;
  statusCode?: number;
}
