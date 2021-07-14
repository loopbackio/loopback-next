// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/example-log-extension
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Request} from '@loopback/rest';
import {sinon} from '@loopback/testlab';
import chalk from 'chalk';
import {
  HighResTime,
  log,
  LogActionProvider,
  LogFn,
  LogWriterFn,
  LOG_LEVEL,
} from '../../..';
import {logToMemory} from '../../in-memory-logger';
import {
  AddSpy,
  createConsoleStub,
  createLogSpy,
  LogStub,
  restoreLogSpy,
} from '../../log-spy';

describe('LogActionProvider with in-memory logger', () => {
  let spy: AddSpy;
  let logger: LogFn;
  const req = <Request>{url: '/test'};

  beforeEach(() => {
    spy = createLogSpy();
  });
  beforeEach(async () => (logger = await getLogger(logToMemory)));

  afterEach(() => restoreLogSpy(spy));

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
});

describe('LogActionProvider with default logger', () => {
  let stub: LogStub;
  let logger: LogFn;
  const req = <Request>{url: '/test'};

  beforeEach(() => {
    stub = createConsoleStub();
  });
  beforeEach(async () => (logger = await getLogger()));

  afterEach(() => restoreLogSpy(stub));

  it('logs a value without a start time', async () => {
    const match = chalk.red('ERROR: /test :: TestClass.test() => test message');

    await logger(req, [], 'test message');
    sinon.assert.calledWith(stub, match);
  });

  it('logs a value with a start time', async () => {
    const match = chalk.red(
      'ERROR: 100ms: /test :: TestClass.test() => test message',
    );
    const startTime: HighResTime = logger.startTimer();

    await logger(req, [], 'test message', startTime);
    sinon.assert.calledWith(stub, match);
  });

  it('logs a value with args present', async () => {
    const match = chalk.red(
      'ERROR: /test :: TestClass.test(test, message) => test message',
    );

    await logger(req, ['test', 'message'], 'test message');
    sinon.assert.calledWith(stub, match);
  });
});

async function getLogger(logWriter?: LogWriterFn) {
  class TestClass {
    @log(LOG_LEVEL.ERROR)
    test() {}
  }

  const provider = new LogActionProvider(
    () => Promise.resolve(TestClass),
    () => Promise.resolve('test'),
    timer,
  );

  if (logWriter) provider.writeLog = logWriter;

  return provider.value();
}

function timer(startTime?: HighResTime): HighResTime {
  if (!startTime) return [3, 3];
  else return [0, 100000002];
}
