// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/example-greeter-extension
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {bind, createBindingFromClass} from '@loopback/core';
import {expect} from '@loopback/testlab';
import chalk from 'chalk';
import {
  asGreeter,
  Greeter,
  GreetingApplication,
  GreetingService,
  GREETING_SERVICE,
} from '../..';

describe('greeter-extension-pont', () => {
  let app: GreetingApplication;
  let greetingService: GreetingService;

  beforeEach(givenAppWithGreeterComponent);
  beforeEach(findGreetingService);

  it('greets by language', async () => {
    let msg = await greetingService.greet('en', 'Raymond');
    expect(msg).to.eql('Hello, Raymond!');
    msg = await greetingService.greet('zh', 'Raymond');
    expect(msg).to.eql('Raymond，你好！');
  });

  it('supports options for the extension point', async () => {
    // Configure the extension point
    app.configure(GREETING_SERVICE).to({color: 'blue'});
    greetingService = await app.get(GREETING_SERVICE);
    expect(greetingService.options).to.eql({color: 'blue'});
    const msg = await greetingService.greet('en', 'Raymond');
    expect(msg).to.eql(chalk.keyword('blue')('Hello, Raymond!'));
  });

  it('supports options for extensions', async () => {
    // Configure the ChineseGreeter
    app.configure('greeters.ChineseGreeter').to({nameFirst: false});
    const msg = await greetingService.greet('zh', 'Raymond');
    expect(msg).to.eql('你好，Raymond！');
  });

  it('honors a newly added/removed greeter binding', async () => {
    /**
     * A greeter implementation for French
     */
    @bind(asGreeter)
    class FrenchGreeter implements Greeter {
      language = 'fr';

      greet(name: string) {
        return `Bonjour, ${name}!`;
      }
    }
    // Add a new greeter for French
    const binding = createBindingFromClass(FrenchGreeter);
    app.add(binding);

    let msg = await greetingService.greet('fr', 'Raymond');
    expect(msg).to.eql('Bonjour, Raymond!');

    // Remove the French greeter
    app.unbind(binding.key);
    msg = await greetingService.greet('fr', 'Raymond');
    // It falls back to English
    expect(msg).to.eql('Hello, Raymond!');
  });

  function givenAppWithGreeterComponent() {
    app = new GreetingApplication();
  }

  async function findGreetingService() {
    greetingService = await app.getGreetingService();
  }
});
