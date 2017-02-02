import {expect} from '@loopback/testlab';
import * as util from 'loopback/test/support/util';

Feature('Bootstrapping',
  'In order to serve up my API',
  'As a user',
  'I want to start the app', () => {
  Scenario('with default configs', () => {
    let app;
    let client;

    Given('an app', () => {
      app = util.createApp();
    });
    And('a client', () => {
      client = util.createClient(app);
    });
    When('the app is started (on port 3000 by default)', async () => {
      await app.start();
    });
    Then('the app responds with HTTP 200 when a request is sent to GET /', async () => {
      const result = await client.get('/')
      expect(result.statusCode).to.equal(200);
    });
  });
});