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
import {promisify} from 'util';
import {GreetingApplication} from '../..';
import {CACHING_SERVICE} from '../../keys';

describe('GreetingApplication', () => {
  let app: GreetingApplication;
  let client: Client;

  before(givenRunningApplicationWithCustomConfiguration);
  after(() => app.stop());

  before(() => {
    client = createRestAppClient(app);
  });

  it('gets a greeting in English', async function() {
    const response = await client
      .get('/greet/Raymond')
      .set('Accept-Language', 'en')
      .expect(200);
    expect(response.body).to.containEql({
      language: 'en',
      greeting: 'Hello, Raymond!',
    });
  });

  it('gets a greeting in Chinese', async function() {
    const response = await client
      .get('/greet/Raymond')
      .set('Accept-Language', 'zh')
      .expect(200);
    expect(response.body).to.containEql({
      language: 'zh',
      greeting: 'Raymond，你好！',
    });
  });

  it('gets a greeting from cache', async function() {
    app.configure(CACHING_SERVICE).to({ttl: 100});
    let response = await client
      .get('/greet/Raymond')
      .set('Accept-Language', 'en')
      .expect(200);
    const msg1 = response.body;
    // Now the result should be cached
    response = await client
      .get('/greet/Raymond')
      .set('Accept-Language', 'en')
      .expect(200);
    expect(response.body).to.eql(msg1);
    // Cache should be expired now
    await promisify(setTimeout)(200);
    response = await client
      .get('/greet/Raymond')
      .set('Accept-Language', 'en')
      .expect(200);
    expect(response.body.timestamp).to.not.eql(msg1.timestamp);
  });

  async function givenRunningApplicationWithCustomConfiguration() {
    app = new GreetingApplication({
      rest: givenHttpServerConfig(),
    });

    // Start Application
    await app.main();
  }
});
