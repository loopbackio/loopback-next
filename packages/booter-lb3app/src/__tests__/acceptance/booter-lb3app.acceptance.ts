// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/booter-lb3app
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {OpenApiSpec, OperationObject} from '@loopback/rest';
import {Client, expect} from '@loopback/testlab';
import * as _ from 'lodash';
import {
  CoffeeApplication,
  givenCoffeeShop,
  givenUser,
  setupApplication,
} from '../test-helper';
const lb3app = require('../../../fixtures/lb3app/server/server');

describe('booter-lb3app', () => {
  let app: CoffeeApplication;
  let client: Client;

  before(async () => {
    ({app, client} = await setupApplication({
      lb3app: {
        path: '../fixtures/lb3app/server/server',
      },
    }));
  });

  after('closes application', async () => {
    if (app) await app.stop();
  });

  it('throws error if lb3 app is not found', async () => {
    await expect(
      setupApplication({
        lb3app: {
          path: '../fixtures/lb3app/wrong/server',
        },
      }),
    ).to.be.rejectedWith(/Cannot find module/);
  });

  context('generated OpenAPI spec', () => {
    it('uses different request-body schema for "create" operation', () => {
      const spec = app.restServer.getApiSpec();
      const createOp: OperationObject = spec.paths['/api/CoffeeShops'].post;
      expect(createOp.requestBody).to.containDeep({
        content: {
          'application/json': {
            schema: {$ref: '#/components/schemas/_new_CoffeeShop'},
          },
        },
      });

      const schemas = (spec.components || {}).schemas || {};
      expect(schemas._new_CoffeeShop)
        .to.have.property('properties')
        .eql({
          // id is excluded, it is not allowed in CREATE requests
          name: {type: 'string'},
          city: {type: 'string'},
          coffees: {
            type: 'array',
            items: {$ref: '#/components/schemas/Coffee'},
          },
        });
    });

    it('includes the target model as a property of the source model in a relation', () => {
      const spec = app.restServer.getApiSpec();
      const schemas = (spec.components || {}).schemas || {};

      expect(schemas.CoffeeShop)
        .to.have.property('properties')
        .eql({
          name: {type: 'string'},
          city: {type: 'string'},
          id: {type: 'number', format: 'double'},
          coffees: {
            // default is excluded
            type: 'array',
            items: {$ref: '#/components/schemas/Coffee'},
          },
        });
    });
  });

  context('mounting full LoopBack 3 application', () => {
    it('creates and gets a LoopBack 3 CoffeeShop instance', async () => {
      const coffeeShop = givenCoffeeShop();
      const response = await client
        .post('/api/CoffeeShops')
        .send(coffeeShop)
        .expect(200);

      expect(response.body).to.containDeep(
        _.pick(coffeeShop, ['name', 'city']),
      );
      const result = await client.get(`/api/CoffeeShops/${response.body.id}`);
      expect(result.body).to.containDeep(_.pick(coffeeShop, ['name', 'city']));
    });

    it('gets route defined outside a model', async () => {
      await client.get('/coffee').expect(200, 'shop');
    });

    it('gets a simple LoopBack 3 route', async () => {
      const currentDate = new Date();
      const currentHour = currentDate.getHours();
      const response = await client.get('/api/CoffeeShops/status').expect(200);

      if (currentHour >= 6 && currentHour < 20) {
        expect(response.body.status).to.eql('We are open for business.');
      } else {
        expect(response.body.status).to.eql(
          'Sorry, we are closed. Open daily from 6am to 8pm.',
        );
      }
    });

    it('includes LoopBack 3 endpoints with `/api` base in OpenApiSpec', () => {
      const apiSpec = app.restServer.getApiSpec();
      const paths = Object.keys(apiSpec.paths);
      expect(paths).to.containDeep([
        '/api/CoffeeShops/{id}',
        '/api/CoffeeShops',
        '/api/CoffeeShops/count',
      ]);
    });

    context('LoopBack 3 authentication', () => {
      before(async () => {
        await givenUser();
      });

      it('allows user to make a request if they are authenticated', async () => {
        const User = lb3app.models.User;

        const token = await User.login({
          email: 'sample@email.com',
          password: 'L00pBack!',
        });

        const response = await client
          .get(`/api/CoffeeShops/greet?access_token=${token.id}`)
          .expect(200);

        expect(response.body.undefined).to.eql('Hello from this Coffee Shop');

        await User.logout(token.id);
      });

      it('does not allow user to make a request if they are not authenticated', async () => {
        await client.get('/api/CoffeeShops/greet').expect(401);
      });
    });
  });

  context('mounting a simple LoopBack 3 application', () => {
    before(async () => {
      ({app, client} = await setupApplication({
        lb3app: {path: '../fixtures/minimal-app'},
      }));
    });

    it('gets a simple LoopBack 3 route', async () => {
      await client.get('/hello').expect(200, 'hello');
    });
  });

  context('mounting routes only of LoopBack 3 application', () => {
    before(async () => {
      ({app, client} = await setupApplication({
        lb3app: {
          path: '../fixtures/lb3app/server/server',
          mode: 'restRouter',
          restApiRoot: '/coffees',
        },
      }));
    });

    it('creates and gets a LoopBack 3 CoffeeShop instance', async () => {
      const coffeeShop = givenCoffeeShop();
      const response = await client
        .post('/coffees/CoffeeShops')
        .send(coffeeShop)
        .expect(200);
      expect(response.body).to.containDeep(
        _.pick(coffeeShop, ['name', 'city']),
      );

      const result = await client.get(
        `/coffees/CoffeeShops/${response.body.id}`,
      );
      expect(result.body).to.containDeep(_.pick(coffeeShop, ['name', 'city']));
    });

    it('does not get route defined outside a model', async () => {
      await client.get('/coffee').expect(404);
    });
  });

  context('using specTransformer to modify OpenAPI spec', () => {
    before(async () => {
      ({app, client} = await setupApplication({
        lb3app: {
          path: '../fixtures/lb3app/server/server',
          specTransformer: (spec: OpenApiSpec): OpenApiSpec =>
            _.merge(spec, {
              paths: {
                '/CoffeeShops': {
                  post: {
                    summary: 'just a very simple modification',
                  },
                },
              },
            }),
        },
      }));
    });

    it('does apply the spec modification', () => {
      const spec = app.restServer.getApiSpec();
      const createOp: OperationObject = spec.paths['/api/CoffeeShops'].post;
      expect(createOp.summary).to.eql('just a very simple modification');
    });
  });

  context('binding LoopBack 3 datasources', () => {
    before(async () => {
      ({app, client} = await setupApplication({
        lb3app: {path: '../fixtures/app-with-model'},
      }));
    });

    it('binds datasource to the context', async () => {
      const expected = require('../../../fixtures/app-with-model').dataSources
        .memory;
      const dsBindings = app.findByTag('datasource');
      const key = dsBindings[0].key;
      const ds = await app.get(key);
      expect(ds).to.eql(expected);
    });
  });
});
