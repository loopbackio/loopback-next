import {UniqueConstraintError} from '@loopback/repository';
import {Client, createRestAppClient, expect} from '@loopback/testlab';
import {get, RestApplication, RestBindings} from '../..';

describe('RejectProvider - DATABASE_ERROR_MAPPING_OPTIONS', () => {
  let app: RestApplication;
  let client: Client;

  class TestController {
    @get('/test-db-error')
    testDbError() {
      throw new UniqueConstraintError('Duplicate key error');
    }
  }

  beforeEach(() => {
    app = new RestApplication({rest: {port: 0}});
    app.bind(RestBindings.SequenceActions.LOG_ERROR).to(() => {});
    app.controller(TestController);
  });

  afterEach(async () => {
    if (app) await app.stop();
  });

  it('maps database error to HTTP 409 Conflict by default', async () => {
    await app.start();
    client = createRestAppClient(app);

    await client.get('/test-db-error').expect(409);
  });

  it('maps database error to 409 Conflict when explicitly enabled', async () => {
    app.bind(RestBindings.DATABASE_ERROR_MAPPING_OPTIONS).to({enabled: true});
    await app.start();
    client = createRestAppClient(app);

    await client.get('/test-db-error').expect(409);
  });

  it('bypasses error mapping (returns 500) when disabled via app.bind()', async () => {
    app.bind(RestBindings.DATABASE_ERROR_MAPPING_OPTIONS).to({enabled: false});
    await app.start();
    client = createRestAppClient(app);

    const res = await client.get('/test-db-error').expect(500);
    expect(res.body.error.statusCode).to.equal(500);
  });
});
