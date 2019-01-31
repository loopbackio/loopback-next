// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/example-todo
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Client,
  createRestAppClient,
  expect,
  givenHttpServerConfig,
} from '@loopback/testlab';
import {HelloWorldApplication} from '../../application';

describe('Application', () => {
  let app: HelloWorldApplication;
  let client: Client;

  before(givenAnApplication);
  before(async () => {
    await app.start();
    client = createRestAppClient(app);
  });
  after(async () => {
    await app.stop();
  });

  it('responds with hello world', async () => {
    const response = await client.get('/').expect(200);
    expect(response.text).to.eql('Hello World!');
  });

  function givenAnApplication() {
    app = new HelloWorldApplication({
      rest: givenHttpServerConfig(),
      disableConsoleLog: true,
    });
  }
});
