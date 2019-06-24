// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/example-context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context, filterByKey, filterByTag} from '@loopback/context';
import {promisify} from 'util';

const setImmediateAsync = promisify(setImmediate);

interface Greeter {
  language: string;
  greet(name: string): string;
}

class ChineseGreeter implements Greeter {
  language = 'zh';
  greet(name: string) {
    return `你好，${name}！`;
  }
}

class EnglishGreeter implements Greeter {
  language = 'en';
  greet(name: string) {
    return `Hello, ${name}!`;
  }
}

/**
 * Create a subclass of context to wait until all observers notified
 */
class RequestContext extends Context {
  /**
   * Wait until the context event queue is empty or an error is thrown
   */
  waitUntilObserversNotified(): Promise<void> {
    return this.waitUntilPendingNotificationsDone(100);
  }
}

export async function main() {
  const appCtx = new Context('app');
  const requestCtx = new RequestContext(appCtx, 'request');

  // Observer events from `appCtx`
  appCtx.subscribe({
    filter: filterByTag('greeter'),
    observe: (eventType, binding) => {
      console.log('[observer] %s %s', eventType, binding.key);
    },
  });

  // Create a context view on `requestCtx`
  const greetersView = requestCtx.createView(filterByKey(/^greeters\./));
  greetersView.on('refresh', () => {
    console.log('[view.refresh] %j', greetersView.bindings.map(b => b.key));
  });

  // Add EnglishGreeter to `appCtx`
  console.log('Adding EnglishGreeter');
  appCtx
    .bind('greeters.EnglishGreeter')
    .toClass(EnglishGreeter)
    .tag('greeter');

  // Add ChineseGreeter to `appCtx`
  await setImmediateAsync();
  console.log('Adding ChineseGreeter');
  appCtx
    .bind('greeters.ChineseGreeter')
    .toClass(ChineseGreeter)
    .tag('greeter');

  // Remove ChineseGreeter from `appCtx`
  await setImmediateAsync();
  console.log('Removing ChineseGreeter');
  appCtx.unbind('greeters.ChineseGreeter');

  // Add ChineseGreeter to `requestCtx`
  await setImmediateAsync();
  console.log('Adding ChineseGreeter to request context');
  requestCtx
    .bind('greeters.ChineseGreeter')
    .toClass(ChineseGreeter)
    .tag('greeter');

  await requestCtx.waitUntilObserversNotified();
}

if (require.main === module) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
