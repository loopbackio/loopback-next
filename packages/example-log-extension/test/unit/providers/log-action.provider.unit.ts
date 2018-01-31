// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/example-log-extension
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {sinon} from '@loopback/testlab';
import {ParsedRequest} from '@loopback/rest';
import {Context} from '@loopback/context';
import {
  LogActionProvider,
  LogFn,
  log,
  EXAMPLE_LOG_BINDINGS,
  LOG_LEVEL,
  HighResTime,
} from '../../..';
import {CoreBindings} from '@loopback/core';
import chalk from 'chalk';

describe('LogActionProvider (unit)', () => {
  let spy: sinon.SinonSpy;
  let logger: LogFn;
  const req = <ParsedRequest>{url: '/test'};

  beforeEach(createLogSpy);
  beforeEach(getLogger);

  afterEach(restoreLogSpy);

  it('logs a value without a start time', async () => {
    const match = chalk.red('ERROR: /test :: TestClass.test() => test message');

    await logger(req, [], 'test message');
    sinon.assert.calledWith(spy, match);
  });

  it('logs a value with a start time', async () => {
    const match = chalk.red(
      'ERROR: 100ms: /test :: TestClass.test() => test message',
    );
    const startTime: HighResTime = logger.startTimer();

    await logger(req, [], 'test message', startTime);
    sinon.assert.calledWith(spy, match);
  });

  it('logs a value with args present', async () => {
    const match = chalk.red(
      'ERROR: /test :: TestClass.test(test, message) => test message',
    );

    await logger(req, ['test', 'message'], 'test message');
    sinon.assert.calledWith(spy, match);
  });

  async function getLogger() {
    class TestClass {
      @log(LOG_LEVEL.ERROR)
      test() {}
    }

    const context: Context = new Context();
    context.bind(CoreBindings.CONTROLLER_CLASS).to(TestClass);
    context.bind(CoreBindings.CONTROLLER_METHOD_NAME).to('test');
    context.bind(EXAMPLE_LOG_BINDINGS.APP_LOG_LEVEL).to(LOG_LEVEL.WARN);
    context.bind(EXAMPLE_LOG_BINDINGS.TIMER).to(timer);
    context.bind(EXAMPLE_LOG_BINDINGS.LOG_ACTION).toProvider(LogActionProvider);
    logger = await context.get(EXAMPLE_LOG_BINDINGS.LOG_ACTION);
  }

  function createLogSpy() {
    spy = sinon.spy(LogActionProvider.prototype, 'log');
  }

  function restoreLogSpy() {
    spy.restore();
  }

  function timer(startTime?: HighResTime): HighResTime {
    if (!startTime) return [3, 3];
    else return [0, 100000002];
  }
});
