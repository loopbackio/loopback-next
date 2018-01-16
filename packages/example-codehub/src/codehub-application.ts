// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/example-codehub
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application, ApplicationConfig} from '@loopback/core';
import {RestServer, RestBindings, RestComponent} from '@loopback/rest';
import {UserController, HealthController} from './controllers';

export class CodeHubApplication extends Application {
  constructor(options?: ApplicationConfig) {
    options = Object.assign(
      {
        components: [RestComponent],
      },
      options,
    );
    super(options);

    const app = this;
    app.server(RestServer);
    // We can't use the async version in the ctor!
    const server = app.getServer(RestServer);

    // tslint:disable-next-line:no-floating-promises
    server.then(s => {
      s.api({
        swagger: '2.0',
        info: {
          title: 'CodeHub',
          version: require('../package.json').version,
        },
        basePath: '/',
        paths: {},
      });

      s.bind(RestBindings.PORT).to(3000);
    });

    app.controller(UserController);
    app.controller(HealthController);

    app.bind('userId').to(42);

    app.bind('app.info').toDynamicValue(() => this.info());
  }

  private _startTime: Date;

  async start(): Promise<void> {
    this._startTime = new Date();
    return super.start();
  }

  async info() {
    const server: RestServer = await this.getServer(RestServer);
    const port: Number = await server.get(RestBindings.PORT);

    return {
      uptime: Date.now() - this._startTime.getTime(),
      // TODO(bajtos) move this code to Application, the URL should
      // be accessible via this.get('http.url')
      url: 'http://127.0.0.1:' + port,
    };
  }
}
