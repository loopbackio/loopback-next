// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect, validateApiSpec} from '@loopback/testlab';
import {Application} from '@loopback/core';
import {
  RestServer,
  Route,
  RestComponent,
  createControllerFactoryForClass,
} from '../../..';
import {get, post, requestBody} from '@loopback/openapi-v3';
import {anOpenApiSpec} from '@loopback/openapi-spec-builder';
import {model, property} from '@loopback/repository';

describe('RestServer.getApiSpec()', () => {
  let app: Application;
  let server: RestServer;
  beforeEach(givenApplication);

  it('comes with a valid default spec', async () => {
    await validateApiSpec(server.getApiSpec());
  });

  it('honours API defined via app.api()', () => {
    server.api({
      openapi: '3.0.0',
      info: {
        title: 'Test API',
        version: '1.0.0',
      },
      servers: [{url: 'example.com:8080/api'}],
      paths: {},
      'x-foo': 'bar',
    });

    const spec = server.getApiSpec();
    expect(spec).to.deepEqual({
      openapi: '3.0.0',
      info: {
        title: 'Test API',
        version: '1.0.0',
      },
      servers: [{url: 'example.com:8080/api'}],
      paths: {},
      'x-foo': 'bar',
    });
  });

  it('binds a route via app.route(route)', () => {
    function greet() {}
    const binding = server.route(
      new Route('get', '/greet', {responses: {}}, greet),
    );
    expect(binding.key).to.eql('routes.get %2Fgreet');
    expect(binding.tagNames).containEql('route');
  });

  it('binds a route via app.route(..., Controller, method)', () => {
    class MyController {
      greet() {}
    }

    const binding = server.route(
      'get',
      '/greet.json',
      {responses: {}},
      MyController,
      createControllerFactoryForClass(MyController),
      'greet',
    );
    expect(binding.key).to.eql('routes.get %2Fgreet%2Ejson');
    expect(binding.tagNames).containEql('route');
  });

  it('returns routes registered via app.route(route)', () => {
    function greet() {}
    server.route(new Route('get', '/greet', {responses: {}}, greet));

    const spec = server.getApiSpec();
    expect(spec.paths).to.eql({
      '/greet': {
        get: {
          responses: {},
        },
      },
    });
  });

  it('returns routes registered via app.route(..., Controller, method)', () => {
    class MyController {
      greet() {}
    }

    server.route(
      'get',
      '/greet',
      {responses: {}},
      MyController,
      createControllerFactoryForClass(MyController),
      'greet',
    );

    const spec = server.getApiSpec();
    expect(spec.paths).to.eql({
      '/greet': {
        get: {
          responses: {},
          'x-controller-name': 'MyController',
          'x-operation-name': 'greet',
          tags: ['MyController'],
        },
      },
    });
  });

  it('honors tags in the operation spec', () => {
    class MyController {
      @get('/greet', {responses: {'200': {description: ''}}, tags: ['MyTag']})
      greet() {}
    }
    app.controller(MyController);

    const spec = server.getApiSpec();
    expect(spec.paths).to.eql({
      '/greet': {
        get: {
          responses: {'200': {description: ''}},
          'x-controller-name': 'MyController',
          'x-operation-name': 'greet',
          tags: ['MyTag'],
        },
      },
    });
  });

  it('returns routes registered via app.controller()', () => {
    class MyController {
      @get('/greet')
      greet() {}
    }
    app.controller(MyController);

    const spec = server.getApiSpec();
    expect(spec.paths).to.eql({
      '/greet': {
        get: {
          responses: {
            '200': {description: 'Return value of MyController.greet'},
          },
          'x-controller-name': 'MyController',
          'x-operation-name': 'greet',
          tags: ['MyController'],
        },
      },
    });
  });

  it('returns definitions inferred via app.controller()', () => {
    @model()
    class MyModel {
      @property()
      bar: string;
    }
    class MyController {
      @post('/foo')
      createFoo(@requestBody() foo: MyModel) {}
    }
    app.controller(MyController);

    const spec = server.getApiSpec();
    expect(spec.components && spec.components.schemas).to.deepEqual({
      MyModel: {
        title: 'MyModel',
        properties: {
          bar: {
            type: 'string',
          },
        },
      },
    });
  });

  it('preserves routes specified in app.api()', () => {
    function status() {}
    server.api(
      anOpenApiSpec()
        .withOperation('get', '/status', {
          'x-operation': status,
          responses: {},
        })
        .build(),
    );

    function greet() {}
    server.route(new Route('get', '/greet', {responses: {}}, greet));

    const spec = server.getApiSpec();
    expect(spec.paths).to.eql({
      '/greet': {
        get: {
          responses: {},
        },
      },
      '/status': {
        get: {
          responses: {},
        },
      },
    });
  });

  async function givenApplication() {
    app = new Application();
    app.component(RestComponent);
    server = await app.getServer(RestServer);
  }
});
