// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/example-hello-world
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {RestApplication, RestServer} from '@loopback/rest';

export class HelloWorldApplication extends RestApplication {
  constructor() {
    super();

    // In this example project, we configure a sequence that always
    // returns the same HTTP response: Hello World!
    // Learn more about the concept of Sequence in our docs:
    //   http://loopback.io/doc/en/lb4/Sequence.html
    this.handler(({response}, sequence) => {
      sequence.send(response, 'Hello World!');
    });
  }

  async start() {
    await super.start();

    const rest = await this.getServer(RestServer);
    console.log(`REST server running on port: ${await rest.get('rest.port')}`);
  }
}
