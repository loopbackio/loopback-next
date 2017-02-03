import {expect} from '@loopback/testlab';
import * as util from 'loopback/test/support/util';

describe('bootstrapping the application', () => {
  describe('with default configs', () => {
    let app;
    let client;
    before(createApp);
    before(createClient);
    before(startApp);

    context('GET /', () => {
      let response;
      before(makeRequest);

      it('responds with HTTP 200', async () => {
        expect(response.statusCode).to.equal(200);
      });

      async function makeRequest() {
        response = await client.get('/')
      }
    });

    function createApp() {
      app = util.createApp();
    }
    function createClient() {
      client = util.createClient(app);
    }
    async function startApp() {
      await app.start();
    }
  });
});
