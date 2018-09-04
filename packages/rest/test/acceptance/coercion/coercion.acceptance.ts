import {supertest, createClientForHandler, sinon} from '@loopback/testlab';
import {RestApplication, get, param} from '../../..';

describe('Coercion', () => {
  let app: RestApplication;
  let client: supertest.SuperTest<supertest.Test>;
  let spy: sinon.SinonSpy;

  before(givenAClient);

  after(async () => {
    await app.stop();
  });

  afterEach(() => spy.restore());

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

    @get('/object-from-query')
    getObjectFromQuery(@param.query.object('filter') filter: Object) {
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

  async function givenAClient() {
    app = new RestApplication();
    app.controller(MyController);
    await app.start();
    client = createClientForHandler(app.requestHandler);
  }
});
