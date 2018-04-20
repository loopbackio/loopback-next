import {
  RestApplication,
  get,
  param,
  RestServer,
  post,
  requestBody,
} from '@loopback/rest';
import {validate, validatable} from '../..';
import {supertest, createClientForHandler, expect} from '@loopback/testlab';
import {model, property} from '@loopback/repository';
import {getJsonSchema, JsonDefinition} from '@loopback/repository-json-schema';

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

  @model()
  class TestModel {
    @property() str: string;
    @property() num: number;
  }

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

    @post('/custom')
    @validatable()
    custom(
      @requestBody()
      @validate(getJsonSchema(TestModel))
      body: TestModel,
    ) {}
  }
  it('simple valid', async () => {
    await client.get('/simple?str=foo@bar.com').expect(200);
  });

  it('simple invalid', async () => {
    const res = await client.get('/simple?str=foo.bar').expect(422);
    expect(res.body.message).to.match(/should match format "email"/);
  });

  it('multiple valid', async () => {
    await client.get('/multiple/10?str=foo@bar.com&num2=7').expect(200);
  });

  it('multiple invalid', async () => {
    const res = await client
      .get('/multiple/10?str=foo@bar.com&num2=6')
      .expect(422);
    expect(res.body.message).to.match(/should be >= 7/);
  });

  it('select valid', async () => {
    await client.get('/select/5?str=foo@bar.com&num2=7').expect(200);
  });

  it('select invalid', async () => {
    const res = await client
      .get('/select/5?str=foo@bar.com&num2=6')
      .expect(422);
    expect(res.body.message).to.match(/should be >= 7/);
  });

  it('custom valid', async () => {
    await client
      .post('/custom')
      .send({
        str: 'testString',
        num: 10,
      })
      .expect(200);
  });

  it('custom invalid', async () => {
    const res = await client
      .post('/custom')
      .send({
        str: 10,
        num: 10,
      })
      .expect(422);
    expect(res.body.message).to.match(/should be string/);
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
