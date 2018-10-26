// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {createRestAppClient, Client} from '@loopback/testlab';
import {RestApplication} from '../..';
import * as path from 'path';
import * as fs from 'fs';

const FIXTURES = path.resolve(__dirname, '../../../fixtures');

describe('RestApplication (integration)', () => {
  let restApp: RestApplication;
  let client: Client;

  beforeEach(givenAnApplication);
  beforeEach(givenClient);
  afterEach(async () => {
    await restApp.stop();
  });

  it('serves static assets', async () => {
    const root = FIXTURES;
    const content = fs
      .readFileSync(path.join(root, 'index.html'))
      .toString('utf-8');
    await client
      .get('/index.html')
      .expect(200)
      .expect(content);
  });

  it('returns 404 if asset is not found', async () => {
    await client.get('/404.html').expect(404);
  });

  function givenAnApplication() {
    const root = FIXTURES;
    restApp = new RestApplication({rest: {port: 0, host: '127.0.0.1'}});
    restApp.static('/', root);
  }

  async function givenClient() {
    await restApp.start();
    return (client = createRestAppClient(restApp));
  }
});
