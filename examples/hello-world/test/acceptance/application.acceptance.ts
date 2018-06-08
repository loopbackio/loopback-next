// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/example-todo
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {createClientForHandler, expect, supertest} from '@loopback/testlab';
import {RestServer} from '@loopback/rest';
import {HelloWorldApplication} from '../../src/application';

describe('Application', () => {
  let app: HelloWorldApplication;
  let client: supertest.SuperTest<supertest.Test>;
  let server: RestServer;

  before(givenAnApplication);
  before(async () => {
    await app.start();
    server = await app.getServer(RestServer);
  });

  before(() => {
    client = createClientForHandler(server.requestHandler);
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
      rest: {
        port: 0,
      },
      disableConsoleLog: true,
    });
  }
});
