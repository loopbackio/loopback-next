// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/example-context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Context,
  ContextView,
  filterByTag,
  isPromiseLike,
  resolveList,
  resolveMap,
  transformValueOrPromise,
  ValueOrPromise,
} from '@loopback/context';

/**
 * A greeter
 */
interface Greeter {
  language: string;
  /**
   * Greet in the given language
   * @param name - Name
   * @returns A message or a promise of a message
   */
  greet(name: string): ValueOrPromise<string>;
}

class ChineseGreeter implements Greeter {
  language = 'zh';
  greet(name: string) {
    return `[value] 你好，${name}！`;
  }
}

class EnglishGreeter implements Greeter {
  language = 'en';
  greet(name: string) {
    return `[value] Hello, ${name}!`;
  }
}

class AsyncChineseGreeter implements Greeter {
  language = 'zh';
  greet(name: string) {
    return new Promise<string>(resolve =>
      setImmediate(() => {
        resolve(`[promise] 你好，${name}！`);
      }),
    );
  }
}

export async function main() {
  const ctx = new Context('app');

  // Add EnglishGreeter for now
  ctx
    .bind('greeters.EnglishGreeter')
    .toClass(EnglishGreeter)
    .tag('greeter');

  // Add ChineseGreeter
  ctx
    .bind('greeters.ChineseGreeter')
    .toClass(ChineseGreeter)
    .tag('greeter');

  const greetersView = ctx.createView<Greeter>(filterByTag('greeter'));
  await greetFromAll(greetersView);

  // Replace ChineseGreeter with AsyncChineseGreeter
  ctx
    .bind('greeters.ChineseGreeter')
    .toClass(AsyncChineseGreeter)
    .tag('greeter');

  await greetFromAll(greetersView);
}

async function greetFromAll(greetersView: ContextView<Greeter>) {
  const greeters = await greetersView.values();
  const greetings = resolveList(greeters, greeter => {
    return greeter.greet('John');
  });
  if (isPromiseLike(greetings)) {
    console.log('async:', await greetings);
  } else {
    console.log('sync:', greetings);
  }
  const greeterMap: {
    [language: string]: Greeter;
  } = {};
  greeters.filter(greeter => (greeterMap[greeter.language] = greeter));
  const greetingsByLanguage = resolveMap(greeterMap, greeter =>
    greeter.greet('Jane'),
  );

  await transformValueOrPromise(greetingsByLanguage, console.log);
}

// tslint:disable-next-line:no-floating-promises
if (require.main === module) main();
