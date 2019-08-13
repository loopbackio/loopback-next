// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/example-context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  BindingKey,
  Context,
  inject,
  Injection,
  ResolutionSession,
  ResolverFunction,
} from '@loopback/context';

/**
 * Custom resolver function for bindings
 * @param ctx The current context
 * @param injection Metadata about the injection
 * @param session Current resolution session
 */
const resolve: ResolverFunction = (
  ctx: Context,
  injection: Readonly<Injection>,
  session: ResolutionSession,
) => {
  console.log('Context: %s Binding: %s', ctx.name, session.currentBinding!.key);
  const targetName = ResolutionSession.describeInjection(injection).targetName;
  console.log('Injection: %s', targetName);
  return injection.member === 'prefix' ? new Date().toISOString() : 'John';
};

/**
 * A class with dependency injection
 */
class Greeter {
  constructor(@inject('', {}, resolve) private name: string) {}

  @inject('', {}, resolve)
  prefix = '';

  hello() {
    return `[${this.prefix}] Hello, ${this.name}`;
  }
}

const GREETER = BindingKey.create<Greeter>('greeter');

export async function main() {
  const ctx = new Context('invocation-context');
  ctx.bind(GREETER).toClass(Greeter);
  const greeter = await ctx.get(GREETER);
  console.log(greeter.hello());
}

if (require.main === module) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
