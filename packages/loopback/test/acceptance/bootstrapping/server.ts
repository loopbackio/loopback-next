// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from 'testlab';
import * as util from 'loopback/test/support/util';
import {Server, Application} from 'loopback';
import {Client} from './../../support/client';
import {Controller} from '../../../lib/controller';

describe('Bootstrapping - Single server', () => {
  describe('Single application', () => {
    context('with a user-defined controller', () => {
      let app: Application;
      let client: Client;
      before(setupAppAndClient);

      it('returns the correct response for a basic request', async () => {
        const res = await client.get('/?msg=hello');
        expect(res).to.eql({status: 200, response: {body: 'hello'}});
      });

      async function setupAppAndClient() {
        app = util.createApp();
        const server = util.createServer();
        server.bind('application.myApp').to(app);
        class EchoController extends Controller {
          public echo(msg: string) {
            return msg;
          }
        }
        const echoController = new EchoController();
        app.bind('controller.echo').to(EchoController);
        await server.start();

        client = new Client(server);
      }
    });
  });
});
