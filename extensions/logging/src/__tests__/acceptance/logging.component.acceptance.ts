// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/extension-logging
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application} from '@loopback/core';
import {expect} from '@loopback/testlab';
import {LoggingBindings, LoggingComponent} from '../..';

describe('LoggingComponent', () => {
  let app: Application;

  before(givenAppWithCustomConfig);

  it('binds a fluent sender', async () => {
    expect(app.isBound(LoggingBindings.FLUENT_SENDER)).to.be.true();
    const sender = await app.get(LoggingBindings.FLUENT_SENDER);
    expect(sender.emit).to.be.Function();
  });

  it('binds a winston logger', async () => {
    expect(app.isBound(LoggingBindings.WINSTON_LOGGER)).to.be.true();
    const logger = await app.get(LoggingBindings.WINSTON_LOGGER);
    expect(logger.log).to.be.Function();
  });

  it('binds a winston transport for fluent', async () => {
    expect(app.isBound(LoggingBindings.WINSTON_TRANSPORT_FLUENT)).to.be.true();
    const logger = await app.get(LoggingBindings.WINSTON_LOGGER);
    expect(logger.transports.length).to.eql(1);
  });

  async function givenAppWithCustomConfig() {
    app = givenApplication();
    app.configure(LoggingBindings.FLUENT_SENDER).to({
      host: 'localhost',
      port: 24224,
      timeout: 3.0,
      reconnectInterval: 600000, // 10 minutes
    });
    app.component(LoggingComponent);
  }

  function givenApplication() {
    return new Application();
  }
});

describe('LoggingComponent without fluent', () => {
  let app: Application;

  before(givenAppAndLoggingComponent);

  it('does not bind a fluent sender', async () => {
    expect(app.isBound(LoggingBindings.FLUENT_SENDER)).to.be.false();
  });

  it('binds a winston logger', async () => {
    expect(app.isBound(LoggingBindings.WINSTON_LOGGER)).to.be.true();
    const logger = await app.get(LoggingBindings.WINSTON_LOGGER);
    expect(logger.log).to.be.Function();
  });

  it('does not bind a winston transport for fluent', async () => {
    expect(app.isBound(LoggingBindings.WINSTON_TRANSPORT_FLUENT)).to.be.false();
  });

  it('does not bind a winston access log', async () => {
    expect(
      app.isBound(LoggingBindings.WINSTON_HTTP_ACCESS_LOGGER),
    ).to.be.false();
  });

  async function givenAppAndLoggingComponent() {
    app = givenApplication();
    app.configure(LoggingBindings.COMPONENT).to({
      enableFluent: false,
      enableHttpAccessLog: false,
    });
    app.component(LoggingComponent);
  }

  function givenApplication() {
    return new Application();
  }
});
