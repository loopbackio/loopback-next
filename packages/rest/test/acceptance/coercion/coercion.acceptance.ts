import {supertest, createClientForHandler, sinon} from '@loopback/testlab';
import {
  RestApplication,
  RestServer,
  get,
  param,
  post,
  requestBody,
  RestBindings,
  InvokeMethod,
} from '../../..';

describe.only('Coercion', () => {
  let app: RestApplication;
  let server: RestServer;
  let client: supertest.SuperTest<supertest.Test>;
  let invokeMethod: InvokeMethod;

  before(givenAnApplication);
  before(givenAServer);
  before(givenAClient);

  after(async () => {
    await app.stop();
  });

  class MyController {
    @get('/create-number/{num}')
    createNumber(@param.path.number('num') num: number) {
      return num;
    }

    @post('/create-object/')
    createObject(@requestBody() obj: object) {}
  }

  it('coerces into number', async () => {
    const spy = sinon.spy(MyController.prototype, 'createNumber');
    await client.get('/create-number/13').expect(200);
    sinon.assert.calledWithExactly(spy, 13);
    sinon.assert.neverCalledWith(spy, '13');
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
