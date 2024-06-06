// Copyright IBM Corp. and LoopBack contributors 2019,2020. All Rights Reserved.
// Node module: @loopback/rest-crud
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  defineCrudRepositoryClass,
  Entity,
  EntityCrudRepository,
  juggler,
  model,
  property,
} from '@loopback/repository';
import {HttpErrors, RestApplication, Request} from '@loopback/rest';
import {
  Client,
  createRestAppClient,
  givenHttpServerConfig,
} from '@loopback/testlab';
import {defineCrudRestController} from '../..';
import {
  authenticate,
  AuthenticationComponent,
  AuthenticationStrategy,
  registerAuthenticationStrategy,
} from '@loopback/authentication';
import {UserProfile, securityId} from '@loopback/security';

// Define a simple mock strategy
class MockAuthenticationStrategy implements AuthenticationStrategy {
  name = 'custom-strategy';

  async authenticate(request: Request): Promise<UserProfile | undefined> {
    const authHeader =
      request.headers.authorization || request.headers?.Authorization;
    if (!authHeader) {
      throw new HttpErrors.Unauthorized('Authorization header not found.');
    }
    return {
      [securityId]: '1',
      email: 'testing@loopback.io',
      name: 'Test User',
    };
  }
}

// In this test scenario, we create a customer to test authentication
// for rest-crud (model-endpoints) based apis.
//
// Please don't add any other scenarios to this test file, create a new file
// for each scenario instead.

describe('CrudRestController for a simple Product model', () => {
  @model()
  class Customer extends Entity {
    @property({id: true})
    id: number;

    @property({required: true})
    name: string;

    @property()
    description?: string;

    constructor(data: Partial<Customer>) {
      super(data);
    }
  }

  let app: RestApplication;
  let repo: EntityCrudRepository<Customer, typeof Customer.prototype.id>;

  let client: Client;

  const PATCH_DATA = {description: 'patched'};
  Object.freeze(PATCH_DATA);

  before(setupTestScenario);
  after(stopTheApp);

  describe('authentication', () => {
    it('fails to create a Customer without credentials', async () => {
      await client.post('/customers').send({name: 'Jane Doe'}).expect(401);
    });

    it('fails to fetch all Customers without credentials', async () => {
      await client.get('/customers').expect(401);
    });

    it('fails to fetch a single Customer without credentials', async () => {
      await client.get('/customers/1').expect(401);
    });

    it('fails to fetch Customer count without credentials', async () => {
      await client.get('/customers/count').expect(401);
    });

    it('fails to update Customers without credentials', async () => {
      await client.patch('/customers').send(PATCH_DATA).expect(401);
    });

    it('fails to update a single Customer without credentials', async () => {
      await client.patch('/customers/1').send(PATCH_DATA).expect(401);
    });

    it('fails to replace a single Customer without credentials', async () => {
      await client.put('/customers/1').send(PATCH_DATA).expect(401);
    });

    it('fails to delete a single Customer without credentials', async () => {
      await client.del('/customers/1').expect(401);
    });

    it('succeeds when credentaisl are provied', async () => {
      await client
        .get('/customers')
        .set('Authorization', 'Bearer mock-token-value')
        .expect(200);
    });
  });

  async function setupTestScenario() {
    const CustomerCrudRestController = defineCrudRestController<
      Customer,
      typeof Customer.prototype.id,
      'id'
    >(Customer, {
      basePath: '/customers',
      authenticate,
      strategy: 'custom-strategy',
      auth: {
        post: true,
        patch: true,
        deleteById: true,
        putById: true,
        count: true,
        get: true,
        getById: true,
        patchById: true,
      },
    });

    const db = new juggler.DataSource({connector: 'memory'});

    const CustomerRepository = defineCrudRepositoryClass(Customer);

    repo = new CustomerRepository(db);

    class CustomerController extends CustomerCrudRestController {
      constructor() {
        super(repo);
      }
    }

    app = new RestApplication({rest: givenHttpServerConfig()});
    app.component(AuthenticationComponent);
    registerAuthenticationStrategy(app, MockAuthenticationStrategy);
    app
      .bind('authentication.strategy.custom-strategy')
      .toClass(MockAuthenticationStrategy);
    app.controller(CustomerController);

    await app.start();
    client = createRestAppClient(app);
  }

  async function stopTheApp() {
    await app.stop();
  }
});
