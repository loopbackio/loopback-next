// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/example-context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingKey, Context, inject} from '@loopback/context';

const CURRENT_USER = BindingKey.create<string>('currentUser');

/**
 * A class with dependency injection
 */
class Greeter {
  /**
   * The dependency of current user can be sync or async depending on the
   * value for `CURRENT_USER` binding.
   * @param userName - User name
   */
  constructor(@inject(CURRENT_USER) private userName: string) {}

  hello() {
    return `Hello, ${this.userName}`;
  }
}

/**
 * A strongly-typed binding key for `Greeter`
 */
const GREETER = BindingKey.create<Greeter>('greeter');

async function greetWithSyncUser(ctx: Context) {
  // Set the current user to `John` (a constant value)
  // As a result, CURRENT_USER can be resolved synchronously
  ctx.bind(CURRENT_USER).to('John (sync)');

  // Greeter has a dependency on current user which can be resolved
  // synchronously. This allows GREETER to be resolved either synchronously or
  // asynchronously.
  // Get an instance of Greeter synchronously
  let greeter = ctx.getSync(GREETER);
  console.log('%s', greeter.hello());

  // Get an instance of Greeter asynchronously
  greeter = await ctx.get(GREETER);
  console.log('%s', greeter.hello());
  return greeter;
}

async function greetWithAsyncUser(ctx: Context) {
  // Now set the current user to an async factory
  // As a result, CURRENT_USER can only be resolved asynchronously

  ctx.bind(CURRENT_USER).toDynamicValue(() => Promise.resolve('Jane (async)'));
  // Get an instance of Greeter asynchronously
  let greeter = await ctx.get(GREETER);
  console.log('%s', greeter.hello());
  try {
    // Get an instance of Greeter synchronously - THIS WILL FAIL
    greeter = ctx.getSync(GREETER);
    console.log(greeter.hello());
  } catch (err) {
    // Error: Cannot get greeter synchronously: the value is a promise
    console.log('Expect to fail with error: %s', err.message);
  }
}

export async function main() {
  const ctx = new Context('request');
  // Bind `GREETER` to a class from which the value is instantiated
  ctx.bind(GREETER).toClass(Greeter);

  // Now try to invoke a greeter with synchronous resolution of the current user
  await greetWithSyncUser(ctx);

  // Then try to invoke a greeter with asynchronous resolution of the current user
  await greetWithAsyncUser(ctx);
}

if (require.main === module) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
