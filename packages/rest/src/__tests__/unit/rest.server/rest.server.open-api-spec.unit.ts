// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application} from '@loopback/core';
import {anOpenApiSpec, anOperationSpec} from '@loopback/openapi-spec-builder';
import {get, post, requestBody} from '@loopback/openapi-v3';
import {model, property} from '@loopback/repository';
import {expect, validateApiSpec} from '@loopback/testlab';
import {
  createControllerFactoryForClass,
  RestComponent,
  RestServer,
} from '../../..';

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
    const binding = server.route('get', '/greet', {responses: {}}, greet);
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
    server.route('get', '/greet', {responses: {}}, greet);

    const spec = server.getApiSpec();
    expect(spec.paths).to.eql({
      '/greet': {
        get: {
          responses: {},
        },
      },
    });
  });

  it('ignores routes marked as "x-visibility" via app.route(route)', () => {
    function greet() {}
    function meet() {}
    server.route(
      'get',
      '/greet',
      {'x-visibility': 'undocumented', responses: {}, spec: {}},
      greet,
    );
    server.route('get', '/meet', {responses: {}, spec: {}}, meet);
    const spec = server.getApiSpec();
    expect(spec.paths).to.eql({
      '/meet': {
        get: {
          responses: {},
          spec: {},
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

  it('ignores routes marked as "x-visibility" via app.route(..., Controller, method)', () => {
    class GreetController {
      greet() {}
    }

    class MeetController {
      meet() {}
    }

    server.route(
      'get',
      '/greet',
      {'x-visibility': 'undocumented', responses: {}},
      GreetController,
      createControllerFactoryForClass(GreetController),
      'greet',
    );

    server.route(
      'get',
      '/meet',
      {responses: {}},
      MeetController,
      createControllerFactoryForClass(MeetController),
      'meet',
    );

    const spec = server.getApiSpec();
    expect(spec.paths).to.eql({
      '/meet': {
        get: {
          responses: {},
          'x-controller-name': 'MeetController',
          'x-operation-name': 'meet',
          tags: ['MeetController'],
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
          operationId: 'MyController.greet',
          tags: ['MyTag'],
        },
      },
    });
  });

  it('emits all media types for request body', () => {
    const expectedOpSpec = anOperationSpec()
      .withRequestBody({
        description: 'Any object value.',
        required: true,
        content: {
          'application/json': {
            schema: {type: 'object'},
          },
          'application/x-www-form-urlencoded': {
            schema: {type: 'object'},
          },
        },
      })
      .withResponse(200, {
        content: {
          'application/json': {
            schema: {
              type: 'object',
            },
          },
        },
        description: '',
      })
      .build();

    class MyController {
      @post('/show-body', expectedOpSpec)
      showBody(body: object) {
        return body;
      }
    }
    app.controller(MyController);

    const spec = server.getApiSpec();
    expect(spec.paths['/show-body'].post).to.containDeep(expectedOpSpec);
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
          operationId: 'MyController.greet',
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
        additionalProperties: false,
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
    server.route('get', '/greet', {responses: {}}, greet);

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
