// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Provider} from '@loopback/context';
import {Application, DefaultSequence, FindRoute, InvokeMethod,
  ParsedRequest, Reject, Send, inject} from '@loopback/core';
import {Logger, LoggerComponent} from '@loopback/logger';
import {UserController, HealthController} from './controllers';
import {ServerResponse} from 'http';

const setupLoggerKey = Logger.SequenceActions.SETUP_LOGGER;

class LoggerSequence extends DefaultSequence {
  @inject(setupLoggerKey)
  private httpLogger: Function;
  constructor(
    @inject('sequence.actions.findRoute') protected findRoute: FindRoute,
    @inject('sequence.actions.invokeMethod') protected invoke: InvokeMethod,
    @inject('sequence.actions.send') public send: Send,
    @inject('sequence.actions.reject') public reject: Reject,
  ) {
    super(findRoute, invoke, send, reject);
  }

  async handle(req: ParsedRequest, res: ServerResponse) {
    this.httpLogger(req, res);
    await super.handle(req, res);
  }
}

export class CodeHubApplication extends Application {
  constructor() {
    super({
      components: [LoggerComponent],
      sequence: LoggerSequence,
    });

    const app = this;

    app.api({
      swagger: '2.0',
      info: {
        title: 'CodeHub',
        version: require('../package.json').version,
      },
      basePath: '/',
      paths: {},
    });

    app.controller(UserController);
    app.controller(HealthController);

    app.bind('userId').to(42);

    app.bind('app.info').toDynamicValue(() => this.info());

    app.bind('servers.http.enabled').to(true);
    app.bind('servers.http.port').to(3000);
    app.bind('servers.https.enabled').to(true);
  }

  private _startTime: Date;

  async start(): Promise<void> {
    this._startTime = new Date();
    return super.start();
  }

  async info() {
    const port: Number = await this.get('http.port');

    return {
      uptime: Date.now() - this._startTime.getTime(),
      // TODO(bajtos) move this code to Application, the URL should
      // be accessible via this.get('http.url')
      url: 'http://127.0.0.1:' + port,
    };
  }
}
