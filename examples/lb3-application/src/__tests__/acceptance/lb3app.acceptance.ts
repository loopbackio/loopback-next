// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/example-lb3-application
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {OpenApiSpec} from '@loopback/rest';
import {Client, expect} from '@loopback/testlab';
import * as _ from 'lodash';
import {CoffeeShopApplication} from '../../application';
import {givenCoffeeShop, setupApplication} from './test-helper';

const lb3App = require('../../../lb3app/server/server');

describe('CoffeeShopApplication', () => {
  let app: CoffeeShopApplication;
  let client: Client;

  before('setupApplication', async () => {
    ({app, client} = await setupApplication());
  });

  after('closes application', async () => {
    if (app) await app.stop();
  });

  context('basic REST calls for LoopBack 3 application', () => {
    it('creates and finds a CoffeeShop', async () => {
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

    it("gets the CoffeeShop's status", async () => {
      const response = await client.get('/api/CoffeeShops/status').expect(200);

      expect(response.body.status).to.be.equalOneOf(
        'We are open for business.',
        'Sorry, we are closed. Open daily from 6am to 8pm.',
      );
    });

    it('gets external route in application', async () => {
      await client.get('/ping').expect(200, 'pong');
    });
  });

  context('LoopBack 3 authentication', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let User: any;

    before(() => {
      User = lb3App.models.User;
    });

    it('creates a User and logs them in and out', async () => {
      const user = await User.create({
        email: 'created@email.com',
        password: 'L00pBack!',
      });

      expect(user.email).to.eql('created@email.com');

      const token = await User.login({
        email: 'created@email.com',
        password: 'L00pBack!',
      });

      expect(token).to.have.properties('ttl', 'userId', 'created', 'id');
      expect(token.userId).to.eql(user.id);

      await User.logout(token.id);
    });

    it('makes an authenticated request', async () => {
      const token = await User.login({
        email: 'created@email.com',
        password: 'L00pBack!',
      });

      const response = await client
        .get(`/api/CoffeeShops/greet?access_token=${token.id}`)
        .expect(200);

      expect(response.body.undefined).to.eql('Hello from this Coffee Shop');
    });

    it('rejects anonymous requests to protected endpoints', async () => {
      await client.get('/api/CoffeeShops/greet').expect(401);
    });

    it("denies request made by another user's access token", async () => {
      const users = await User.create([
        {
          email: 'original@email.com',
          password: 'L00pBack!',
        },
        {
          email: 'other@email.com',
          password: 'L00pBack!',
        },
      ]);

      const token = await User.login({
        email: users[0].email,
        password: 'L00pBack!',
      });

      const otherToken = await User.login({
        email: users[1].email,
        password: 'L00pBack!',
      });

      const response = await client
        .get(`/api/Users/${users[0].id}?access_token=${token.id}`)
        .expect(200);

      expect(response.body).to.containEql({
        email: users[0].email,
        id: users[0].id,
      });

      await client
        .get(`/api/Users/${users[0].id}?access_token=${otherToken.id}`)
        .expect(401);
    });
  });

  context('OpenAPI spec', () => {
    let apiSpec: OpenApiSpec;

    before(async () => {
      apiSpec = app.restServer.getApiSpec();
    });

    it('has the same properties in both the LB3 and LB4 specs', () => {
      const lb4SpecProperties = Object.keys(apiSpec);

      expect(lb4SpecProperties).to.eql([
        'openapi',
        'info',
        'paths',
        'servers',
        'components',
        'tags',
      ]);
    });

    it('uses OpenApi version 3', () => {
      expect(apiSpec.openapi).to.eql('3.0.0');
    });

    it('transfers the tags from the LB3 spec to the LB4 spec', () => {
      expect(apiSpec.tags).to.containDeep([
        {name: 'User', description: undefined, externalDocs: undefined},
        {name: 'CoffeeShop', description: undefined, externalDocs: undefined},
      ]);
    });

    it('transfers the components from the LB3 spec to the LB4 spec', () => {
      const components = apiSpec.components;
      expect(components).to.have.properties('requestBodies', 'schemas');

      expect(components!.requestBodies).to.containDeep({
        CoffeeShop: {
          content: {
            'application/json': {
              schema: {$ref: '#/components/schemas/CoffeeShop'},
            },
          },

          description: 'Model instance data',
        },
      });

      expect(components!.schemas).to.containDeep({
        CoffeeShop: {
          description: undefined,
          properties: {
            name: {type: 'string'},
            city: {type: 'string'},
            id: {type: 'number', format: 'double'},
          },
          required: ['name'],
          additionalProperties: false,
        },
      });
    });

    it('appends the basePath and transfers the paths from the LB3 spec to the LB4 spec', () => {
      const paths = Object.keys(apiSpec.paths);
      expect(paths).to.have.length(32);

      // some of the expected paths
      expect(paths).to.containDeep([
        '/api/Users/{id}/accessTokens/{fk}',
        '/api/Users',
        '/api/Users/{id}/exists',
        '/api/Users/login',
        '/api/CoffeeShops',
        '/api/CoffeeShops/{id}',
        '/api/CoffeeShops/greet',
      ]);
    });

    it("transfers the path's details", () => {
      const CoffeeShopsEndpoint = apiSpec.paths['/api/CoffeeShops'];

      expect(CoffeeShopsEndpoint).to.have.properties([
        'post',
        'patch',
        'put',
        'get',
      ]);

      expect(CoffeeShopsEndpoint['post']).to.containDeep({
        tags: ['CoffeeShop'],
        summary:
          'Create a new instance of the model and persist it into the data source.',
        operationId: 'CoffeeShop.create',
        requestBody: {$ref: '#/components/requestBodies/CoffeeShop'},
        responses: {
          '200': {
            description: 'Request was successful',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/CoffeeShop',
                },
              },
            },
          },
        },
        deprecated: false,
      });
    });
  });
});
