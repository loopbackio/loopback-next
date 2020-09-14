// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-webpack
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Application,
  BindingAddress,
  BindingKey,
  Constructor,
  Context,
  ContextView,
  filterByTag,
  Getter,
  inject,
  invokeMethod,
} from '@loopback/core';

/**
 * A strongly-typed binding key for current date
 */
const CURRENT_DATE = BindingKey.create<Date>('currentDate');

/**
 * A strongly-typed binding key for current user
 */
const CURRENT_USER = BindingKey.create<string>('currentUser');

/**
 * A strongly-typed binding key for current language
 */
const CURRENT_LANGUAGE = BindingKey.create<string>('currentLanguage');

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
    @inject(CURRENT_LANGUAGE)
    language: string,

    // Parameter injection
    @inject(CURRENT_USER)
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
  const app = new GreetingApplication();

  // Add EnglishGreeter for now
  app.addGreeter('greeters.EnglishGreeter', EnglishGreeter);

  // Set the current user to `John` (a constant value)
  await app.greetInEnglish();

  // Now add ChineseGreeter
  app.addGreeter('greeters.ChineseGreeter', ChineseGreeter);
  await app.greetInChineseThenEnglish();

  return app.greetings;
}

export class GreetingApplication extends Application {
  readonly greetings: string[] = [];
  private static requestCounter = 0;

  constructor() {
    super();
    // Bind greeting service
    this.bind(GREETING_SERVICE).toClass(GreetingService);

    // Set the current date to a factory function
    this.bind(CURRENT_DATE).toDynamicValue(getCurrentDate);
  }

  addGreeter(key: BindingAddress<Greeter>, cls: Constructor<Greeter>) {
    this.bind(key).toClass(cls).tag('greeter');
  }

  async greetInEnglish() {
    const {greetingService, requestCtx} = await this.createRequest(
      'John',
      'zh',
    );

    // Invoke `greet` as a method
    // '(en) Hello, Jane'
    let greeting = await greetingService.greet('en', 'Jane');
    this.greetings.push(greeting);

    // Use `invokeMethod` to apply method injection
    // 'Hello, John!' - no matching greeter is found
    greeting = await invokeMethod(greetingService, 'greet', requestCtx);
    this.greetings.push(greeting);

    requestCtx.close();
  }

  async greetInChineseThenEnglish() {
    const {greetingService, requestCtx} = await this.createRequest(
      'John',
      'zh',
    );

    let greeting = await invokeMethod(greetingService, 'greet', requestCtx);
    // '(zh) 你好，John！',
    this.greetings.push(greeting);

    // Switch the current language to `en`
    requestCtx.bind(CURRENT_LANGUAGE).to('en');

    // Switch the current user to `Jane`
    requestCtx.bind(CURRENT_USER).to('Jane');

    greeting = await invokeMethod(greetingService, 'greet', requestCtx);
    // '(en) Hello, Jane!'
    this.greetings.push(greeting);
    requestCtx.close();
  }

  private async createRequest(user: string, language: string) {
    const requestCtx = new Context(
      this,
      `request-${GreetingApplication.requestCounter++}`,
    );
    requestCtx.bind(CURRENT_USER).to(user);
    requestCtx.bind(CURRENT_LANGUAGE).to(language);

    // Get an instance of the greeting service
    const greetingService = await requestCtx.get(GREETING_SERVICE);
    return {greetingService, requestCtx};
  }
}

/* istanbul ignore if */
if (require.main === module) {
  main()
    .then(greetings => greetings.forEach(g => console.log(g)))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}
