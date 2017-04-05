// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application, Server} from 'loopback';
import {UserController, HealthController} from './controllers';

export class CodeHubApplication extends Application {
  constructor() {
    super();

    const app = this;
    app.controller(UserController);
    app.controller(HealthController);

    app.bind('userId').to(42);

    app.bind('servers.http.enabled').to(true);
    app.bind('servers.http.port').to(3000);
    app.bind('servers.https.enabled').to(true);
  }

  private _startTime : Date;

  async start() {
    this._startTime = new Date();
    const server = new Server({port: this.get('servers.http.port')});
    this.bind('servers.http.server').to(server);
    server.bind('applications.code-hub').to(this);
    return server.start();
  }

  info() {
    const server = this.get('servers.http.server') as Server;
    const port = server.config.port;

    return {
      uptime: Date.now() - this._startTime.getTime(),
      url: 'http://127.0.0.1:' + port,
    };
  }
}
