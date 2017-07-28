// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application} from '@loopback/core';
import {PinoLoggerComponent, PinoHttpLoggerSequence, WinstonLoggerComponent} from '@loopback/logger';
import {UserController, HealthController} from './controllers';

export class CodeHubApplication extends Application {
  constructor() {
    super({
      components: [PinoLoggerComponent],
      sequence: PinoHttpLoggerSequence,
      // components: [WinstonLoggerComponent],
      // PinoHttpLoggerSequence is incompatible with WinstonLoggerComponent.
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
