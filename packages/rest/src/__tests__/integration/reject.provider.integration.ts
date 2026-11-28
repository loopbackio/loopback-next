import {
  UniqueConstraintError,
  QueryTimeoutError,
  TableNotFoundError,
  DatabaseConnectionError,
} from '@loopback/repository';
import {Client, createRestAppClient, expect} from '@loopback/testlab';
import {get, RestApplication, RestBindings} from '../..';

describe('RejectProvider - DATABASE_ERROR_MAPPING_OPTIONS', () => {
  let app: RestApplication;
  let client: Client;

  class TestController {
    @get('/test-unique-error')
    testUniqueError() {
      throw new UniqueConstraintError('Duplicate key error');
    }

    @get('/test-timeout-error')
    testTimeoutError() {
      throw new QueryTimeoutError('Query timed out');
    }

    @get('/test-table-not-found')
    testTableNotFound() {
      throw new TableNotFoundError('Table does not exist');
    }

    @get('/test-connection-error')
    testConnectionError() {
      throw new DatabaseConnectionError('Connection failed');
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
    app.bind(RestBindings.DATABASE_ERROR_MAPPING_OPTIONS).to({enabled: true});
    await app.start();
    client = createRestAppClient(app);

    await client.get('/test-unique-error').expect(409);
  });

  it('maps query timeout error to HTTP 504 Gateway Timeout', async () => {
    app.bind(RestBindings.DATABASE_ERROR_MAPPING_OPTIONS).to({enabled: true});
    await app.start();
    client = createRestAppClient(app);

    const res = await client.get('/test-timeout-error').expect(504);
    expect(res.body.error.statusCode).to.equal(504);
  });

  it('maps table not found error to HTTP 400 Bad Request', async () => {
    app.bind(RestBindings.DATABASE_ERROR_MAPPING_OPTIONS).to({enabled: true});
    await app.start();
    client = createRestAppClient(app);

    const res = await client.get('/test-table-not-found').expect(400);
    expect(res.body.error.statusCode).to.equal(400);
  });

  it('maps database connection error to HTTP 503 Service Unavailable', async () => {
    app.bind(RestBindings.DATABASE_ERROR_MAPPING_OPTIONS).to({enabled: true});
    await app.start();
    client = createRestAppClient(app);

    const res = await client.get('/test-connection-error').expect(503);
    expect(res.body.error.statusCode).to.equal(503);
  });

  it('bypasses error mapping (returns 500) when disabled via app.bind()', async () => {
    app.bind(RestBindings.DATABASE_ERROR_MAPPING_OPTIONS).to({enabled: false});
    await app.start();
    client = createRestAppClient(app);

    const res = await client.get('/test-unique-error').expect(500);
    expect(res.body.error.statusCode).to.equal(500);
  });
});
