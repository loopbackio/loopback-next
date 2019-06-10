// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Client,
  createRestAppClient,
  givenHttpServerConfig,
  sinon,
} from '@loopback/testlab';
import {get, param, RestApplication} from '../../..';

describe('Coercion', () => {
  let app: RestApplication;
  let client: Client;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let spy: sinon.SinonSpy<[any], any>;

  before(givenAClient);

  after(async () => {
    await app.stop();
  });

  afterEach(() => {
    if (spy) spy.restore();
  });

  class MyController {
    @get('/create-number-from-path/{num}')
    createNumberFromPath(@param.path.number('num') num: number) {
      return num;
    }

    @get('/create-number-from-query')
    createNumberFromQuery(@param.query.number('num') num: number) {
      return num;
    }

    @get('/create-number-from-header')
    createNumberFromHeader(@param.header.number('num') num: number) {
      return num;
    }

    @get('/string-from-query')
    getStringFromQuery(@param.query.string('where') where: string) {
      return where;
    }

    @get('/object-from-query')
    getObjectFromQuery(@param.query.object('filter') filter: object) {
      return filter;
    }
  }

  it('coerces parameter in path from string to number', async () => {
    spy = sinon.spy(MyController.prototype, 'createNumberFromPath');
    await client.get('/create-number-from-path/100').expect(200);
    sinon.assert.calledWithExactly(spy, 100);
  });

  it('coerces parameter in header from string to number', async () => {
    spy = sinon.spy(MyController.prototype, 'createNumberFromHeader');
    await client.get('/create-number-from-header').set({num: 100});
    sinon.assert.calledWithExactly(spy, 100);
  });

  it('coerces parameter in query from string to number', async () => {
    spy = sinon.spy(MyController.prototype, 'createNumberFromQuery');
    await client
      .get('/create-number-from-query')
      .query({num: 100})
      .expect(200);
    sinon.assert.calledWithExactly(spy, 100);
  });

  it('coerces parameter in query from JSON to object', async () => {
    spy = sinon.spy(MyController.prototype, 'getObjectFromQuery');
    await client
      .get('/object-from-query')
      .query({filter: '{"where":{"id":1,"name":"Pen", "active": true}}'})
      .expect(200);
    sinon.assert.calledWithExactly(spy, {
      where: {id: 1, name: 'Pen', active: true},
    });
  });

  it('coerces parameter in query from nested keys to object', async () => {
    spy = sinon.spy(MyController.prototype, 'getObjectFromQuery');
    await client
      .get('/object-from-query')
      .query({
        'filter[where][id]': 1,
        'filter[where][name]': 'Pen',
        'filter[where][active]': true,
      })
      .expect(200);
    sinon.assert.calledWithExactly(spy, {
      // Notice that numeric and boolean values are converted to strings.
      // This is because all values are encoded as strings on URL queries
      // and we did not specify any schema in @param.query.object() decorator.
      where: {
        id: '1',
        name: 'Pen',
        active: 'true',
      },
    });
  });

  it('rejects object value constructed by qs for string parameter', async () => {
    await client
      .get('/string-from-query')
      .query({
        'where[id]': 1,
        'where[name]': 'Pen',
        'where[active]': true,
      })
      .expect(400);
  });

  async function givenAClient() {
    app = new RestApplication({rest: givenHttpServerConfig()});
    app.controller(MyController);
    await app.start();
    client = createRestAppClient(app);
  }
});
