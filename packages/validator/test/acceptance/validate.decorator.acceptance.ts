import {RestApplication, get, param, RestServer} from '@loopback/rest';
import {validate, validatable} from '../..';
import {supertest, createClientForHandler} from '@loopback/testlab';

describe('validate decorator', () => {
  let app: RestApplication;
  let server: RestServer;
  let client: supertest.SuperTest<supertest.Test>;

  before(givenAnApplication);
  before(givenAServer);
  before(givenAClient);
  before(async () => {
    await app.start();
  });

  after(async () => {
    await app.stop();
  });

  class TestController {
    @get('/simple')
    @validatable()
    simple(
      @param.query.string('str')
      @validate({format: 'email'})
      str: string,
    ) {}

    @get('/multiple/{num1}')
    @validatable()
    multiple(
      @param.query.string('str')
      @validate({format: 'email'})
      str: string,
      @param.path.number('num1')
      @validate({
        multipleOf: 5,
      })
      num1: number,
      @param.query.number('num2')
      @validate({
        minimum: 7,
      })
      num2: number,
    ) {}

    @get('/select/{num1}')
    @validatable()
    select(
      @param.query.string('str')
      @validate({format: 'email'})
      str: string,
      @param.path.number('num1') num1: number,
      @param.query.number('num2')
      @validate({
        minimum: 7,
      })
      num2: number,
    ) {}
  }
  it('simple valid', async () => {
    await client.get('/simple?str=foo@bar.com').expect(200);
  });

  it('simple invalid', async () => {
    await client.get('/simple?str=foo.bar').expect(422);
  });

  it('multiple valid', async () => {
    await client.get('/multiple/10?str=foo@bar.com&num2=7').expect(200);
  });

  it('multiple invalid', async () => {
    await client.get('/multiple/10?str=foo@bar.com&num2=6').expect(422);
  });

  it('select valid', async () => {
    await client.get('/select/5?str=foo@bar.com&num2=7').expect(200);
  });

  it('select invalid', async () => {
    await client.get('/select/5?str=foo@bar.com&num2=6').expect(422);
  });

  function givenAnApplication() {
    app = new RestApplication();
    app.controller(TestController);
  }
  async function givenAServer() {
    server = await app.getServer(RestServer);
  }
  function givenAClient() {
    client = createClientForHandler(server.requestHandler);
  }
});
