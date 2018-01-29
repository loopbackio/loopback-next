// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/example-hello-world
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application} from '@loopback/core';
import {RestApplication, RestServer} from '@loopback/rest';

export class HelloWorldApplication extends RestApplication {
  constructor() {
    super();
    this.handler((sequence, request, response) => {
      sequence.send(response, 'Hello World!');
    });
  }

  async start() {
    await super.start();

    const rest = await this.getServer(RestServer);
    console.log(`REST server running on port: ${await rest.get('rest.port')}`);
  }
}
