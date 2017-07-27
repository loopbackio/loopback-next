// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect, validateApiSpec} from '@loopback/testlab';
import {Application, api, get, Route} from '../../..';
import {anOpenApiSpec} from '@loopback/openapi-spec-builder';

describe('Application.getApiSpec()', () => {
  let app: Application;
  beforeEach(givenApplication);

  it('comes with a valid default spec', async () => {
    await validateApiSpec(app.getApiSpec());
  });

  it('honours API defined via app.api()', () => {
    app.api({
      swagger: '2.0',
      info: {
        title: 'Test API',
        version: '1.0.0',
      },
      host: 'example.com:8080',
      basePath: '/api',
      paths: {},
      'x-foo': 'bar',
    });

    const spec = app.getApiSpec();
    expect(spec).to.deepEqual({
      swagger: '2.0',
      info: {
        title: 'Test API',
        version: '1.0.0',
      },
      host: 'example.com:8080',
      basePath: '/api',
      paths: {},
      'x-foo': 'bar',
    });
  });

  it('returns routes registered via app.route(route)', () => {
    function greet() {}
    app.route(new Route('get', '/greet', {responses: {}}, greet));

    const spec = app.getApiSpec();
    expect(spec.paths).to.eql({
      '/greet': {
        get: {
          responses: {},
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

    const spec = app.getApiSpec();
    expect(spec.paths).to.eql({
      '/greet': {
        get: {
          responses: {},
          'x-operation-name': 'greet',
        },
      },
    });
  });

  it('preserves routes specified in app.api()', () => {
    function status() {}
    app.api(
      anOpenApiSpec()
        .withOperation('get', '/status', {
          'x-operation': status,
          responses: {},
        })
        .build(),
    );

    function greet() {}
    app.route(new Route('get', '/greet', {responses: {}}, greet));

    const spec = app.getApiSpec();
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

  function givenApplication() {
    app = new Application();
  }
});
