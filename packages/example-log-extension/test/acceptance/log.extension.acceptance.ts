// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/example-log-extension
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  RestApplication,
  RestServer,
  SequenceHandler,
  RestBindings,
  FindRoute,
  ParseParams,
  InvokeMethod,
  Send,
  Reject,
  ParsedRequest,
  ServerResponse,
} from '@loopback/rest';
import {get, param} from '@loopback/openapi-v3';
import {
  LogComponent,
  LogLevelMixin,
  LOG_LEVEL,
  log,
  EXAMPLE_LOG_BINDINGS,
  LogFn,
  HighResTime,
} from '../..';
import {
  sinon,
  SinonSpy,
  Client,
  createClientForHandler,
  expect,
} from '@loopback/testlab';
import {Context, inject} from '@loopback/context';
import chalk from 'chalk';

const SequenceActions = RestBindings.SequenceActions;

import {createLogSpy, restoreLogSpy} from '../log-spy';
import {logToMemory, resetLogs} from '../in-memory-logger';

describe('log extension acceptance test', () => {
  let app: LogApp;
  let server: RestServer;
  let spy: SinonSpy;

  class LogApp extends LogLevelMixin(RestApplication) {}

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
  beforeEach(() => (spy = createLogSpy()));
  afterEach(() => restoreLogSpy(spy));

  it('logs information at DEBUG or higher', async () => {
    setAppLogToDebug();
    const client: Client = createClientForHandler(server.handleHttp);

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
    const client: Client = createClientForHandler(server.handleHttp);

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
    const client: Client = createClientForHandler(server.handleHttp);

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
    const client: Client = createClientForHandler(server.handleHttp);

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
    const client: Client = createClientForHandler(server.handleHttp);

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
        @inject(RestBindings.Http.CONTEXT) public ctx: Context,
        @inject(SequenceActions.FIND_ROUTE) protected findRoute: FindRoute,
        @inject(SequenceActions.PARSE_PARAMS)
        protected parseParams: ParseParams,
        @inject(SequenceActions.INVOKE_METHOD) protected invoke: InvokeMethod,
        @inject(SequenceActions.SEND) protected send: Send,
        @inject(SequenceActions.REJECT) protected reject: Reject,
        @inject(EXAMPLE_LOG_BINDINGS.LOG_ACTION) protected logger: LogFn,
      ) {}

      async handle(req: ParsedRequest, res: ServerResponse) {
        // tslint:disable-next-line:no-any
        let args: any = [];
        // tslint:disable-next-line:no-any
        let result: any;

        try {
          const route = this.findRoute(req);
          args = await this.parseParams(req, route);
          result = await this.invoke(route, args);
          this.send(res, result);
        } catch (err) {
          this.reject(res, req, err);
          result = err;
        }

        await this.logger(req, args, result);
      }
    }

    server.sequence(LogSequence);
  }

  async function createApp() {
    app = new LogApp();
    app.component(LogComponent);

    app.bind(EXAMPLE_LOG_BINDINGS.TIMER).to(timer);
    app.bind(EXAMPLE_LOG_BINDINGS.LOGGER).to(logToMemory);
    server = await app.getServer(RestServer);
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
