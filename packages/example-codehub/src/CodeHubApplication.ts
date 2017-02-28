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
    app.bind('servers.https.enabled').to(true);
  }

  private _startTime : Date;

  async start() {
    this._startTime = new Date();
    const server = new Server();
    server.bind('applications.code-hub').to(this);
    return server.start();
  }

  info() {
    return {
      uptime: Date.now() - this._startTime.getTime(),
    };
  }
}
