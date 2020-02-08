// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/extension-logging
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context} from '@loopback/context';
import {extensionFor} from '@loopback/core';
import {expect} from '@loopback/testlab';
import {
  format,
  LoggingBindings,
  WinstonFormat,
  WinstonLoggerOptions,
  WinstonLoggerProvider,
  WinstonLogRecord,
  WinstonTransports,
  WINSTON_FORMAT,
  WINSTON_TRANSPORT,
} from '../..';

describe('Winston Logger', () => {
  let ctx: Context;

  beforeEach(givenContext);

  it('creates a winston logger', async () => {
    ctx.bind(LoggingBindings.WINSTON_LOGGER).toProvider(WinstonLoggerProvider);
    ctx.configure<WinstonLoggerOptions>(LoggingBindings.WINSTON_LOGGER).to({
      level: 'info',
      format: format.json(),
      defaultMeta: {framework: 'LoopBack'},
    });
    const logger = await ctx.get(LoggingBindings.WINSTON_LOGGER);
    expect(logger.level).to.eql('info');
  });

  it('creates a winston logger with transports', async () => {
    ctx.bind(LoggingBindings.WINSTON_LOGGER).toProvider(WinstonLoggerProvider);
    ctx.configure<WinstonLoggerOptions>(LoggingBindings.WINSTON_LOGGER).to({
      level: 'info',
      format: format.json(),
      defaultMeta: {framework: 'LoopBack'},
    });
    const consoleTransport = new WinstonTransports.Console({
      level: 'info',
      format: format.combine(format.colorize(), format.simple()),
    });
    ctx
      .bind('logging.winston.transports.console')
      .to(consoleTransport)
      .apply(extensionFor(WINSTON_TRANSPORT));
    const logger = await ctx.get(LoggingBindings.WINSTON_LOGGER);
    expect(logger.transports).to.eql([consoleTransport]);
  });

  it('creates a winston logger with formats', async () => {
    ctx.bind(LoggingBindings.WINSTON_LOGGER).toProvider(WinstonLoggerProvider);
    ctx.configure<WinstonLoggerOptions>(LoggingBindings.WINSTON_LOGGER).to({
      level: 'info',
      defaultMeta: {framework: 'LoopBack'},
    });
    const logs: WinstonLogRecord[] = [];
    const myFormat: WinstonFormat = format((info, opts) => {
      logs.push(info);
      return false;
    })();
    ctx
      .bind('logging.winston.formats.myFormat')
      .to(myFormat)
      .apply(extensionFor(WINSTON_FORMAT));
    ctx
      .bind('logging.winston.formats.colorize')
      .to(format.colorize())
      .apply(extensionFor(WINSTON_FORMAT));
    const logger = await ctx.get(LoggingBindings.WINSTON_LOGGER);
    logger.log('info', 'Hello, LoopBack!');
    expect(logs).to.eql([{level: 'info', message: 'Hello, LoopBack!'}]);
  });

  function givenContext() {
    ctx = new Context();
  }
});
