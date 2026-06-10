// Copyright IBM Corp. and LoopBack contributors 2024. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Client,
  createRestAppClient,
  expect,
  givenHttpServerConfig,
} from '@loopback/testlab';
import {get, param, RestApplication} from '../../..';

describe('Query parameter array limit', () => {
  let app: RestApplication;
  let client: Client;

  afterEach(async () => {
    if (app) await app.stop();
  });

  context('with default arrayLimit (20)', () => {
    beforeEach(async () => {
      app = givenApplication();
      await app.start();
      client = createRestAppClient(app);
    });

    it('parses arrays with 20 items correctly', async () => {
      const ids = Array.from({length: 20}, (_, i) => (i + 1).toString());
      const query = ids.map(id => `ids=${id}`).join('&');

      const response = await client.get(`/test?${query}`).expect(200);
      expect(response.body.ids).to.eql(ids);
    });

    it('converts arrays with 21+ items to objects (qs default behavior)', async () => {
      const ids = Array.from({length: 21}, (_, i) => (i + 1).toString());
      const query = ids.map(id => `ids=${id}`).join('&');

      const response = await client.get(`/test?${query}`).expect(200);

      expect(response.body.ids).to.be.Object();
      expect(Array.isArray(response.body.ids)).to.be.false();
      expect(response.body.ids).to.have.property('0', '1');
      expect(response.body.ids).to.have.property('20', '21');
    });
  });

  context('with custom arrayLimit (100)', () => {
    beforeEach(async () => {
      app = givenApplication({
        rest: {
          queryParser: {
            arrayLimit: 100,
          },
        },
      });
      await app.start();
      client = createRestAppClient(app);
    });

    it('parses arrays with 21 items correctly', async () => {
      const ids = Array.from({length: 21}, (_, i) => (i + 1).toString());
      const query = ids.map(id => `ids=${id}`).join('&');

      const response = await client.get(`/test?${query}`).expect(200);
      expect(response.body.ids).to.eql(ids);
      expect(Array.isArray(response.body.ids)).to.be.true();
    });

    it('parses arrays with 50 items correctly', async () => {
      const ids = Array.from({length: 50}, (_, i) => (i + 1).toString());
      const query = ids.map(id => `ids=${id}`).join('&');

      const response = await client.get(`/test?${query}`).expect(200);
      expect(response.body.ids).to.eql(ids);
      expect(Array.isArray(response.body.ids)).to.be.true();
    });

    it('parses arrays with 100 items correctly', async () => {
      const ids = Array.from({length: 100}, (_, i) => (i + 1).toString());
      const query = ids.map(id => `ids=${id}`).join('&');

      const response = await client.get(`/test?${query}`).expect(200);
      expect(response.body.ids).to.eql(ids);
      expect(Array.isArray(response.body.ids)).to.be.true();
    });

    it('converts arrays with 101+ items to objects (exceeds limit)', async () => {
      const ids = Array.from({length: 101}, (_, i) => (i + 1).toString());
      const query = ids.map(id => `ids=${id}`).join('&');

      const response = await client.get(`/test?${query}`).expect(200);

      expect(response.body.ids).to.be.Object();
      expect(Array.isArray(response.body.ids)).to.be.false();
      expect(response.body.ids).to.have.property('0', '1');
      expect(response.body.ids).to.have.property('100', '101');
    });
  });

  context('with arrayLimit set to 1000', () => {
    beforeEach(async () => {
      app = givenApplication({
        rest: {
          queryParser: {
            arrayLimit: 1000,
          },
        },
      });
      await app.start();
      client = createRestAppClient(app);
    });

    it('parses arrays with 500 items correctly', async () => {
      const ids = Array.from({length: 500}, (_, i) => (i + 1).toString());
      const query = ids.map(id => `ids=${id}`).join('&');

      const response = await client.get(`/test?${query}`).expect(200);
      expect(response.body.ids).to.eql(ids);
      expect(Array.isArray(response.body.ids)).to.be.true();
    });
  });

  function givenApplication(config?: object) {
    const testApp = new RestApplication({
      ...givenHttpServerConfig(),
      ...config,
    });

    class TestController {
      @get('/test')
      test(
        @param.array('ids', 'query', {type: 'string'})
        ids?: string[],
      ): object {
        return {ids};
      }
    }

    testApp.controller(TestController);
    return testApp;
  }
});
