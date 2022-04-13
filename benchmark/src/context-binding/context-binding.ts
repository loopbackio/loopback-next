// Copyright IBM Corp. and LoopBack contributors 2020. All Rights Reserved.
// Node module: @loopback/benchmark
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context, inject, Provider, ValueFactory} from '@loopback/core';
import Benchmark from 'benchmark';

/**
 * Option 1 - use a sync factory function
 */
const factory: ValueFactory = ({context}) => {
  const user = context.getSync('user');
  return `Hello, ${user}`;
};

/**
 * Option 2 - use an async factory function
 */
const asyncFactory: ValueFactory = async ({context}) => {
  const user = await context.get('user');
  return `Hello, ${user}`;
};

/**
 * Option 3 - use a value factory provider class with sync static value() method
 * parameter injection
 */
class StaticGreetingProvider {
  static value(@inject('user') user: string) {
    return `Hello, ${user}`;
  }
}

/**
 * Option 4 - use a value factory provider class with async static value() method
 * parameter injection
 */
class AsyncStaticGreetingProvider {
  static value(@inject('user') user: string) {
    return Promise.resolve(`Hello, ${user}`);
  }
}

/**
 * Option 5 - use a regular provider class with sync value()
 */
class GreetingProvider implements Provider<string> {
  @inject('user')
  private user: string;

  value() {
    return `Hello, ${this.user}`;
  }
}

/**
 * Option 6 - use a regular provider class with async value()
 */
class AsyncGreetingProvider implements Provider<string> {
  @inject('user')
  private user: string;

  value() {
    return Promise.resolve(`Hello, ${this.user}`);
  }
}

setupContextBindings();

function setupContextBindings() {
  const ctx = new Context();
  ctx.bind('user').to('John');
  ctx.bind('greeting.syncFactory').toDynamicValue(factory);
  ctx.bind('greeting.asyncFactory').toDynamicValue(asyncFactory);
  ctx
    .bind('greeting.syncStaticProvider')
    .toDynamicValue(StaticGreetingProvider);
  ctx
    .bind('greeting.asyncStaticProvider')
    .toDynamicValue(AsyncStaticGreetingProvider);
  ctx.bind('greeting.syncProvider').toProvider(GreetingProvider);
  ctx.bind('greeting.asyncProvider').toProvider(AsyncGreetingProvider);
  return ctx;
}

function runBenchmark(ctx: Context) {
  const options: Benchmark.Options = {
    initCount: 1000,
    onComplete: (e: Benchmark.Event) => {
      const benchmark = e.target;
      console.log('%s %d', benchmark, benchmark.count);
    },
  };
  const suite = new Benchmark.Suite('context-bindings');
  suite
    .add(
      'factory - getSync',
      () => ctx.getSync('greeting.syncFactory'),
      options,
    )
    .add('factory - get', () => ctx.get('greeting.syncFactory'), options)
    .add('asyncFactory - get', () => ctx.get('greeting.asyncFactory'), options)
    .add(
      'staticProvider - getSync',
      () => ctx.getSync('greeting.syncStaticProvider'),
      options,
    )
    .add(
      'staticProvider - get',
      () => ctx.get('greeting.syncStaticProvider'),
      options,
    )
    .add(
      'asyncStaticProvider - get',
      () => ctx.get('greeting.asyncStaticProvider'),
      options,
    )
    .add(
      'provider - getSync',
      () => ctx.getSync('greeting.syncProvider'),
      options,
    )
    .add('provider - get', () => ctx.get('greeting.syncProvider'), options)
    .add(
      'asyncProvider - get',
      () => ctx.get('greeting.asyncProvider'),
      options,
    )
    .run({async: true});
}

if (require.main === module) {
  const ctx = setupContextBindings();
  runBenchmark(ctx);
}
