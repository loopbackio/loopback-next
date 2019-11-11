// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/example-log-extension
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {inject} from '@loopback/context';
import {get, param} from '@loopback/openapi-v3';
import {
  FindRoute,
  InvokeMethod,
  ParseParams,
  Reject,
  RequestContext,
  RestApplication,
  RestBindings,
  Send,
  SequenceHandler,
} from '@loopback/rest';
import {Client, createClientForHandler, expect, sinon} from '@loopback/testlab';
import chalk from 'chalk';
import {
  EXAMPLE_LOG_BINDINGS,
  HighResTime,
  log,
  LogFn,
  LogMixin,
  LOG_LEVEL,
} from '../..';
import {logToMemory, resetLogs} from '../in-memory-logger';
import {AddSpy, createLogSpy, restoreLogSpy} from '../log-spy';

const SequenceActions = RestBindings.SequenceActions;

describe('log extension acceptance test', () => {
  let app: LogApp;
  let spy: AddSpy;

  class LogApp extends LogMixin(RestApplication) {}

  const debugMatch: string = chalk.white(
    'DEBUG: /debug :: MyController.debug() => debug called',
  );
  const infoMatch: string = chalk.green(
    'INFO: /info :: MyController.info() => info called',
  );
  const warnMatch: string = chalk.yellow(
    'WARN: /warn :: MyController.warn() => warn called',
  );
  const errorMatch: string = chalk.red(
    'ERROR: /error :: MyController.error() => error called',
  );
  const nameMatch: string = chalk.yellow(
    'WARN: /?name=test :: MyController.hello(test) => hello test',
  );

  beforeEach(createApp);
  beforeEach(createController);
  beforeEach(createSequence);

  beforeEach(resetLogs);
  beforeEach(() => {
    spy = createLogSpy();
  });
  afterEach(() => restoreLogSpy(spy));

  it('logs information at DEBUG or higher', async () => {
    setAppLogToDebug();
    const client: Client = createClientForHandler(app.requestHandler);

    await client.get('/nolog').expect(200, 'nolog called');
    expect(spy.called).to.be.False();

    await client.get('/off').expect(200, 'off called');
    expect(spy.called).to.be.False();

    await client.get('/debug').expect(200, 'debug called');
    sinon.assert.calledWith(spy, debugMatch);

    await client.get('/info').expect(200, 'info called');
    sinon.assert.calledWith(spy, infoMatch);

    await client.get('/warn').expect(200, 'warn called');
    sinon.assert.calledWith(spy, warnMatch);

    await client.get('/error').expect(200, 'error called');
    sinon.assert.calledWith(spy, errorMatch);

    await client.get('/?name=test').expect(200, 'hello test');
    sinon.assert.calledWith(spy, nameMatch);
  });

  it('logs information at INFO or higher', async () => {
    setAppLogToInfo();
    const client: Client = createClientForHandler(app.requestHandler);

    await client.get('/nolog').expect(200, 'nolog called');
    expect(spy.called).to.be.False();

    await client.get('/off').expect(200, 'off called');
    expect(spy.called).to.be.False();

    await client.get('/debug').expect(200, 'debug called');
    expect(spy.called).to.be.False();

    await client.get('/info').expect(200, 'info called');
    sinon.assert.calledWith(spy, infoMatch);

    await client.get('/warn').expect(200, 'warn called');
    sinon.assert.calledWith(spy, warnMatch);

    await client.get('/error').expect(200, 'error called');
    sinon.assert.calledWith(spy, errorMatch);

    await client.get('/?name=test').expect(200, 'hello test');
    sinon.assert.calledWith(spy, nameMatch);
  });

  it('logs information at WARN or higher', async () => {
    setAppLogToWarn();
    const client: Client = createClientForHandler(app.requestHandler);

    await client.get('/nolog').expect(200, 'nolog called');
    expect(spy.called).to.be.False();

    await client.get('/off').expect(200, 'off called');
    expect(spy.called).to.be.False();

    await client.get('/debug').expect(200, 'debug called');
    expect(spy.called).to.be.False();

    await client.get('/info').expect(200, 'info called');
    expect(spy.called).to.be.False();

    await client.get('/warn').expect(200, 'warn called');
    sinon.assert.calledWith(spy, warnMatch);

    await client.get('/error').expect(200, 'error called');
    sinon.assert.calledWith(spy, errorMatch);

    await client.get('/?name=test').expect(200, 'hello test');
    sinon.assert.calledWith(spy, nameMatch);
  });

  it('logs information at ERROR', async () => {
    setAppLogToError();
    const client: Client = createClientForHandler(app.requestHandler);

    await client.get('/nolog').expect(200, 'nolog called');
    expect(spy.called).to.be.False();

    await client.get('/off').expect(200, 'off called');
    expect(spy.called).to.be.False();

    await client.get('/debug').expect(200, 'debug called');
    expect(spy.called).to.be.False();

    await client.get('/info').expect(200, 'info called');
    expect(spy.called).to.be.False();

    await client.get('/warn').expect(200, 'warn called');
    expect(spy.called).to.be.False();

    await client.get('/?name=test').expect(200, 'hello test');
    expect(spy.called).to.be.False();

    await client.get('/error').expect(200, 'error called');
    sinon.assert.calledWith(spy, errorMatch);
  });

  it('logs no information when logLevel is set to OFF', async () => {
    setAppLogToOff();
    const client: Client = createClientForHandler(app.requestHandler);

    await client.get('/nolog').expect(200, 'nolog called');
    expect(spy.called).to.be.False();

    await client.get('/off').expect(200, 'off called');
    expect(spy.called).to.be.False();

    await client.get('/debug').expect(200, 'debug called');
    expect(spy.called).to.be.False();

    await client.get('/info').expect(200, 'info called');
    expect(spy.called).to.be.False();

    await client.get('/warn').expect(200, 'warn called');
    expect(spy.called).to.be.False();

    await client.get('/?name=test').expect(200, 'hello test');
    expect(spy.called).to.be.False();

    await client.get('/error').expect(200, 'error called');
    expect(spy.called).to.be.False();
  });

  function createSequence() {
    class LogSequence implements SequenceHandler {
      constructor(
        @inject(SequenceActions.FIND_ROUTE) protected findRoute: FindRoute,
        @inject(SequenceActions.PARSE_PARAMS)
        protected parseParams: ParseParams,
        @inject(SequenceActions.INVOKE_METHOD) protected invoke: InvokeMethod,
        @inject(SequenceActions.SEND) protected send: Send,
        @inject(SequenceActions.REJECT) protected reject: Reject,
        @inject(EXAMPLE_LOG_BINDINGS.LOG_ACTION) protected logger: LogFn,
      ) {}

      async handle(context: RequestContext): Promise<void> {
        const {request, response} = context;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let args: any = [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let result: any;

        try {
          const route = this.findRoute(request);
          args = await this.parseParams(request, route);
          result = await this.invoke(route, args);
          this.send(response, result);
        } catch (error) {
          this.reject(context, error);
          result = error;
        }

        await this.logger(request, args, result);
      }
    }

    app.sequence(LogSequence);
  }

  async function createApp() {
    app = new LogApp();
    app.bind(EXAMPLE_LOG_BINDINGS.TIMER).to(timer);
    app.bind(EXAMPLE_LOG_BINDINGS.LOGGER).to(logToMemory);
  }

  function setAppLogToDebug() {
    app.logLevel(LOG_LEVEL.DEBUG);
  }

  function setAppLogToWarn() {
    app.logLevel(LOG_LEVEL.WARN);
  }

  function setAppLogToError() {
    app.logLevel(LOG_LEVEL.ERROR);
  }

  function setAppLogToInfo() {
    app.logLevel(LOG_LEVEL.INFO);
  }

  function setAppLogToOff() {
    app.logLevel(LOG_LEVEL.OFF);
  }

  function createController() {
    class MyController {
      @get('/debug')
      @log(LOG_LEVEL.DEBUG)
      debug() {
        return 'debug called';
      }

      @get('/warn')
      @log(LOG_LEVEL.WARN)
      warn() {
        return 'warn called';
      }

      @get('/info')
      @log(LOG_LEVEL.INFO)
      info() {
        return 'info called';
      }

      @get('/error')
      @log(LOG_LEVEL.ERROR)
      error() {
        return 'error called';
      }

      @get('/off')
      @log(LOG_LEVEL.OFF)
      off() {
        return 'off called';
      }

      @get('/')
      @log()
      hello(@param.query.string('name') name: string) {
        return `hello ${name}`;
      }

      @get('/nolog')
      nolog() {
        return 'nolog called';
      }
    }

    app.controller(MyController);
  }

  function timer(startTime?: HighResTime): HighResTime {
    if (!startTime) return [3, 3];
    return [2, 2];
  }
});
