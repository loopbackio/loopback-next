// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Client, createClientForHandler} from '@loopback/testlab';
import {BootTestApplication} from '../fakeApp';
import {RestServer} from '@loopback/rest';

describe('@loopback/boot acceptance', () => {
  let rootDir: string;
  let app: BootTestApplication;

  before(getRootDir);
  beforeEach(getApp);
  afterEach(stopApp);

  it('booted controllers / app works as expected', async () => {
    await app.start();

    const server: RestServer = await app.getServer(RestServer);
    const client: Client = createClientForHandler(server.handleHttp);

    await client.get('/').expect(200, 'Hello World');
    await client.get('/world').expect(200, 'Hi from world controller');
    await client.get('/admin').expect(200, 'Hello Admin');
  });

  function getRootDir() {
    rootDir =
      process.cwd().indexOf('packages') > -1
        ? 'dist/test/fakeApp/'
        : 'packages/boot/dist/test/fakeApp/';
  }

  function getApp() {
    app = new BootTestApplication({boot: {rootDir: rootDir}});
  }

  async function stopApp() {
    try {
      await app.stop();
    } catch (err) {
      console.log(`Stopping the app threw an error: ${err}`);
    }
  }
});
