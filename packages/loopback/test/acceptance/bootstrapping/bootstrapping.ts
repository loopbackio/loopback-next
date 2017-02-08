// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Client} from './../../support/client';
import {Application} from 'loopback';
import {expect} from '@loopback/testlab';
import * as util from 'loopback/test/support/util';

describe('bootstrapping the application', () => {
  describe('with default configs', () => {
    let app: Application;
    let client: Client;
    before(createApp);
    before(createClient);
    before(startApp);

    context('GET /', () => {
      let response: Client.Result;
      before(makeRequest);

      it('responds with HTTP 200', async () => {
        expect(response.status).to.equal(200);
      });

      async function makeRequest() {
        response = await client.get('/');
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
