import {supertest, createClientForHandler, sinon} from '@loopback/testlab';
import {
  RestApplication,
  RestServer,
  get,
  param,
  post,
  requestBody,
} from '../../..';

describe('Coercion', () => {
  let app: RestApplication;
  let server: RestServer;
  let client: supertest.SuperTest<supertest.Test>;

  before(givenAnApplication);
  before(givenAServer);
  before(givenAClient);

  after(async () => {
    await app.stop();
  });

  class MyController {
    @get('/create-number/{num}')
    getNumber(@param.path.number('num') num: number) {
      return num;
    }

    @get('/create-boolean')
    getBoolean(@param.query.boolean('bool') bool: boolean) {
      return bool;
    }

    @post('/create-object/')
    createObject(@requestBody() obj: object) {}
  }

  it('coerces a number', async () => {
    const spy = sinon.spy(MyController.prototype, 'getNumber');
    await client.get('/create-number/13').expect(200);
    sinon.assert.calledWithExactly(spy, 13);
    sinon.assert.neverCalledWith(spy, '13');
    spy.restore();
  });

  it('coerces "false" into a boolean', async () => {
    const spy = sinon.spy(MyController.prototype, 'getBoolean');
    await client.get('/create-boolean?bool=false').expect(200);
    sinon.assert.calledWithExactly(spy, false);
    sinon.assert.neverCalledWith(spy, 'false');
    spy.restore();
  });

  it('coerces "true" into a boolean', async () => {
    const spy = sinon.spy(MyController.prototype, 'getBoolean');
    await client.get('/create-boolean?bool=true').expect(200);
    sinon.assert.calledWithExactly(spy, true);
    sinon.assert.neverCalledWith(spy, 'true');
    spy.restore();
  });

  it('works with requestBody', async () => {
    await client
      .post('/create-object')
      .send({foo: 'bar'})
      .expect(200);
  });

  async function givenAnApplication() {
    app = new RestApplication();
    app.controller(MyController);
    await app.start();
  }

  async function givenAServer() {
    server = await app.getServer(RestServer);
  }

  async function givenAClient() {
    client = await createClientForHandler(server.requestHandler);
  }
});
