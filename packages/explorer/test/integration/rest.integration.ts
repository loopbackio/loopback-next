// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/explorer
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
import {createRestAppClient} from '@loopback/testlab';
import {RestServerConfig, RestApplication} from '@loopback/rest';
import {ExplorerComponent, ExplorerBindings} from '../..';

describe('API Explorer for REST Server', () => {
  let restApp: RestApplication;

  before(async () => {
    restApp = await givenRestApp({
      rest: {port: 0},
    });
  });

  after(async () => {
    await restApp.stop();
  });

  it('exposes "GET /explorer"', () => {
    const test = createRestAppClient(restApp);
    return test
      .get('/explorer')
      .expect(200, /\<title\>LoopBack API Explorer<\/title\>/)
      .expect('content-type', /text\/html.*/);
  });
});

async function givenRestApp(options?: {rest: RestServerConfig}) {
  const app = new RestApplication(options);
  app.bind(ExplorerBindings.CONFIG).to({});
  // FIXME: Can we mount the ExplorerComponent to a given server?
  app.component(ExplorerComponent);
  await app.start();
  return app;
}
