// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application, ApplicationConfig} from '@loopback/core';
import {RestApplication, RestServer} from '@loopback/rest';
import {PingController} from './controllers/ping.controller';
import {MySequence} from './sequence';

export class <%= project.applicationName %> extends RestApplication {
  constructor(options?: ApplicationConfig) {
    super(options);
    this.sequence(MySequence);
    this.setupControllers();
  }

  async start() {
    await super.start();

    const server = await this.getServer(RestServer);
    const port = await server.get('rest.port');
    console.log(`Server is running at http://127.0.0.1:${port}`);
    console.log(`Try http://127.0.0.1:${port}/ping`);
  }

  setupControllers() {
    this.controller(PingController);
  }
}
