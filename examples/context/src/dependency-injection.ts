// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/example-context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  BindingKey,
  Context,
  ContextView,
  filterByTag,
  Getter,
  inject,
  invokeMethod,
} from '@loopback/context';

/**
 * A strongly-typed binding key for current date
 */
const CURRENT_DATE = BindingKey.create<Date>('currentDate');

/**
 * A strongly-typed binding key for `GreetingService`
 */
const GREETING_SERVICE = BindingKey.create<GreetingService>(
  'services.GreetingService',
);

/**
 * A factory function to return the current date
 */
const getCurrentDate = () => new Date();

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
 * A class with dependency injection
 */
class GreetingService {
  // Constructor based injection
  constructor(
    // Inject a context view for all greeters
    @inject.view(filterByTag('greeter'))
    private greetersView: ContextView<Greeter>,
  ) {}

  // Property based injection
  @inject.getter(CURRENT_DATE)
  private now: Getter<Date>;

  async greet(
    // Parameter injection
    @inject('currentLanguage')
    language: string,

    // Parameter injection
    @inject('currentUser')
    userName: string,
  ) {
    // Get current date
    const date = await this.now();
    // Get current list of greeters
    const greeters = await this.greetersView.values();
    for (const greeter of greeters) {
      if (greeter.language === language) {
        const msg = greeter.greet(userName);
        return `[${date.toISOString()}] (${language}) ${msg}`;
      }
    }
    return `[${date.toISOString()}] Hello, ${userName}!`;
  }
}

export async function main() {
  const ctx = new Context('request');

  // Bind greeting service
  ctx.bind(GREETING_SERVICE).toClass(GreetingService);

  // Set the current date to a factory function
  ctx.bind(CURRENT_DATE).toDynamicValue(getCurrentDate);

  // Set the current user to `John` (a constant value)
  ctx.bind('currentUser').to('John');

  // Set the current language to `zh`
  ctx.bind('currentLanguage').to('zh');

  // Add EnglishGreeter for now
  ctx
    .bind('greeters.EnglishGreeter')
    .toClass(EnglishGreeter)
    .tag('greeter');

  // Get an instance of the greeting service
  const greetingService = await ctx.get(GREETING_SERVICE);

  // Invoke `greet` as a method
  let greeting = await greetingService.greet('en', 'Jane');
  console.log(greeting);

  // Use `invokeMethod` to apply method injection
  greeting = await invokeMethod(greetingService, 'greet', ctx);
  console.log(greeting);

  // Now add ChineseGreeter
  ctx
    .bind('greeters.ChineseGreeter')
    .toClass(ChineseGreeter)
    .tag('greeter');

  greeting = await invokeMethod(greetingService, 'greet', ctx);
  console.log(greeting);

  // Change the current language to `en`
  ctx.bind('currentLanguage').to('en');

  // Change the current user to `Jane`
  ctx.bind('currentUser').to('Jane');

  greeting = await invokeMethod(greetingService, 'greet', ctx);
  console.log(greeting);
}

if (require.main === module) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
