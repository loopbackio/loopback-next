// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/example-express-composition
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Client} from '@loopback/testlab';
import {setupExpressApplication} from './test-helper';
import {ExpressServer} from '../../server';

describe('ExpressApplication', () => {
  let server: ExpressServer;
  let client: Client;

  before('setupApplication', async () => {
    ({server, client} = await setupExpressApplication());
  });

  after('closes application', async () => {
    await server.stop();
  });

  it('displays front page', async () => {
    await client
      .get('/')
      .expect(200)
      .expect('Content-Type', /text\/html/);
  });

  it('displays a static page', async () => {
    await client
      .get('/notes.html')
      .expect(200)
      .expect('Content-Type', /text\/html/)
      .expect(/<h2>Notes/);
  });

  it('gets hello world', async () => {
    await client
      .get('/hello')
      .expect(200)
      .expect('Hello world!');
  });

  it('redirects to "api/explorer" from "api/explorer"', async () => {
    await client
      .get('/api/explorer')
      .expect(301)
      .expect('location', '/api/explorer/');
  });

  it('displays explorer page', async () => {
    await client
      .get('/api/explorer/')
      .expect(200)
      .expect('content-type', /html/)
      .expect(/url\: '\/api\/openapi\.json'\,/)
      .expect(/<title>LoopBack API Explorer/);
  });
});
