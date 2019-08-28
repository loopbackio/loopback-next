// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/example-greeting-app
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Client,
  createRestAppClient,
  expect,
  givenHttpServerConfig,
} from '@loopback/testlab';
import {GreetingApplication} from '../..';

describe('GreetingApplication', () => {
  let app: GreetingApplication;
  let client: Client;

  before(givenRunningApplicationWithCustomConfiguration);
  after(() => app.stop());

  before(() => {
    client = createRestAppClient(app);
  });

  it('gets greetings', async function() {
    const response = await client.get('/greet/Raymond').expect(200);
    expect(response.body).to.be.an.Array();
    expect(response.body[0]).to.match(/Hello, Raymond/);
  });

  it('reports metrics', async function() {
    const response = await client.get('/metrics').expect(200);
    expect(response.text).to.match(
      /TYPE loopback_invocation_duration_seconds gauge/,
    );
  });

  async function givenRunningApplicationWithCustomConfiguration() {
    app = new GreetingApplication({
      rest: givenHttpServerConfig(),
    });

    // Start Application
    await app.main();
  }
});
