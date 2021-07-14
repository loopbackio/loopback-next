// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/example-context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingKey, Context, inject, Provider} from '@loopback/context';

/**
 * A strongly-typed binding key for current date
 */
const CURRENT_DATE = BindingKey.create<Date>('currentDate');

/**
 * A strongly-typed binding key for `Greeter`
 */
const GREETER = BindingKey.create<Greeter>('greeter');

/**
 * A factory function to return the current date
 */
const getCurrentDate = () => new Date();

/**
 * A class with dependency injection
 */
class Greeter {
  // Constructor based injection
  constructor(@inject('currentUser') private userName: string) {}

  // Property based injection
  @inject(CURRENT_DATE)
  private created: Date;

  // Property based injection
  @inject('requestId')
  private requestId: string;

  hello() {
    return `[${this.created.toISOString()}] (${this.requestId}) Hello, ${
      this.userName
    }`;
  }
}

/**
 * A provider is similar as the factory function but it requires dependency
 * injection. As a result, it's declared as a class with `@inject.*` decorations
 * applied.
 */
class RequestIdProvider implements Provider<string> {
  static ids: Map<string, number> = new Map();

  // Injection of `url`
  constructor(@inject('url') private url: string) {}

  // This method returns the resolved value for the binding
  value() {
    let id = RequestIdProvider.ids.get(this.url);
    if (id == null) {
      id = 1;
    } else {
      id++;
    }
    RequestIdProvider.ids.set(this.url, id);
    return `${this.url}#${id}`;
  }
}

export async function main() {
  const ctx = new Context('request');

  // Set the current user to `John` (a constant value)
  ctx.bind('currentUser').to('John');

  // Set current url
  ctx.bind('url').to('/greet');

  // Set the current date to a factory function that creates the value
  ctx.bind(CURRENT_DATE).toDynamicValue(getCurrentDate);

  // Bind `hello` to a class from which the value is instantiated
  ctx.bind(GREETER).toClass(Greeter);

  // Set `requestId` to a provider class which has a `value()` method to
  // create the value. It's a specializd factory declared as a class to allow
  // dependency injection
  ctx.bind('requestId').toProvider(RequestIdProvider);

  // Bind `hello` as an alias to `GREETER`
  ctx.bind('hello').toAlias(GREETER);

  let greeter = await ctx.get(GREETER);
  console.log(greeter.hello());

  greeter = await ctx.get<Greeter>('hello');
  console.log(greeter.hello());
}

if (require.main === module) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
