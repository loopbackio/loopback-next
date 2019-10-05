// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/example-express-composition
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Client, expect} from '@loopback/testlab';
import {HelloObserver} from '../../observers';
import {ExpressServer} from '../../server';
import {setupExpressApplication} from './test-helper';

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
      // expect relative redirect so that it works seamlessly with many forms
      // of base path, whether within the app or applied by a reverse proxy
      .expect('location', './explorer/');
  });

  it('displays explorer page', async () => {
    await client
      .get('/api/explorer/')
      .expect(200)
      .expect('content-type', /html/)
      .expect(/url\: '\.\/openapi\.json'\,/)
      .expect(/<title>LoopBack API Explorer/);
  });

  it('triggers life cycle start', async () => {
    const observer: HelloObserver = await server.lbApp.get(
      'lifeCycleObservers.HelloObserver',
    );
    expect(observer.events.length).to.be.above(0);
    expect(observer.events[0]).to.match(/hello-start$/);
  });
});
