// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/extension-logging
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application, BindingKey} from '@loopback/core';
import {LoggingBindings, LoggingComponent} from '@loopback/extension-logging';
import {expect} from '@loopback/testlab';
import {promisify} from 'util';
import {readLog} from '../fixtures/fluentd.docker';

const sleep = promisify(setTimeout);

describe('LoggingComponent', () => {
  let app: Application;

  beforeEach(givenAppWithCustomConfig);

  /* eslint-disable no-invalid-this */
  it('binds a fluent sender', async function() {
    if (process.env.FLUENTD_SERVICE_PORT_TCP == null) return this.skip();
    const sender = await app.get(LoggingBindings.FLUENT_SENDER);
    sender.emit({greeting: 'Hello, LoopBack!'});
    await sleep(100);
    await expectLogsToMatch(/LoopBack\s+\{"greeting"\:"Hello, LoopBack!"\}/);
  });

  it('binds a winston transport for fluent', async function() {
    if (process.env.FLUENTD_SERVICE_PORT_TCP == null) return this.skip();
    const logger = await app.get(LoggingBindings.WINSTON_LOGGER);
    logger.log('info', 'Hello, LoopBack!');
    await sleep(100);
    await expectLogsToMatch(
      /LoopBack\s+\{"level"\:"info","message":"Hello, LoopBack!"\}/,
    );
  });

  it('throws error if fluent is not configured', async function() {
    if (process.env.FLUENTD_SERVICE_PORT_TCP == null) return this.skip();

    // Remove the configuration for fluent sender
    app.unbind(BindingKey.buildKeyForConfig(LoggingBindings.FLUENT_SENDER));
    return expect(app.get(LoggingBindings.FLUENT_SENDER)).to.be.rejectedWith(
      /Fluent is not configured\. Please configure logging\.fluent\.sender\./,
    );
  });

  /**
   * Read fluentd log files to match against the given regular exp
   * @param regex A regular expression for assertion
   */
  async function expectLogsToMatch(regex: RegExp) {
    const content = await readLog();
    expect(content).match(regex);
  }

  async function givenAppWithCustomConfig() {
    app = givenApplication();
    app.configure(LoggingBindings.FLUENT_SENDER).to({
      host: process.env.FLUENTD_SERVICE_HOST || '127.0.0.1',
      port: +(process.env.FLUENTD_SERVICE_PORT_TCP || 0) || 24224,
      timeout: 3.0,
      reconnectInterval: 600000, // 10 minutes
    });
    app.component(LoggingComponent);
  }

  function givenApplication() {
    return new Application();
  }
});
