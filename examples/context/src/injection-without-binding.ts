// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/example-context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingKey, Context, inject, instantiateClass} from '@loopback/context';

/**
 * Strongly-typed binding key for the current user
 */
const CURRENT_USER = BindingKey.create<string>('currentUser');

/**
 * A class with dependency injection
 */
class Greeter {
  constructor(@inject(CURRENT_USER) private userName: string) {}

  hello() {
    return `Hello, ${this.userName}`;
  }
}

/**
 * Create an instance for `Greeter` with the given context and run `hello()`
 * @param ctx Context object
 */
async function sayHello(ctx: Context) {
  const greeter = await instantiateClass(Greeter, ctx);
  console.log(greeter.hello());
}

export async function main() {
  const ctx = new Context('invocation-context');
  ctx.bind(CURRENT_USER).to('John');
  await sayHello(ctx);
}

if (require.main === module) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
