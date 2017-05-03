// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {SwaggerRouter} from '../../../src/router/SwaggerRouter';
import * as http from 'http';
import * as request from 'request-promise';
import { FullRequestResponse } from './../../support/FullRequestResponse';
import * as bluebird from 'bluebird';
import {expect} from '@loopback/testlab';
import {listen} from '../../support/util';
import {OpenApiSpec, ParameterObject} from '@loopback/openapi-spec';
import {givenOpenApiSpec} from '@loopback/openapi-spec-builder';

describe('SwaggerRouter', () => {
  beforeEach(givenRouter);

  context('with a simple HelloWorld controller', () => {
    beforeEach(function setupHelloController() {
      const spec = givenOpenApiSpec()
        .withOperationReturningString('get', '/hello', 'greet')
        .build();

      class HelloController {
        public async greet(): Promise<string> {
          return 'Hello world!';
        }
      }

      givenControllerClass(HelloController, spec);
    });

    it('handles simple "GET /hello" requests', async () => {
      const response = await requestEndpoint('GET', '/hello');
      expect(response.statusCode).to.equal(200);
      expect(response.body).to.equal('Hello world!', 'body');
    });
  });

  context('with a controller with operations at different paths/verbs', () => {
    beforeEach(function setupHelloController() {
      const spec = givenOpenApiSpec()
        .withOperationReturningString('get', '/hello', 'hello')
        .withOperationReturningString('get', '/bye', 'bye')
        .withOperationReturningString('post', '/hello', 'postHello')
        .build();

      class HelloController {
        public async hello(): Promise<string> {
          return 'hello';
        }

        public async bye(): Promise<string> {
          return 'bye';
        }

        public async postHello(): Promise<string> {
          return 'hello posted';
        }
      }

      givenControllerClass(HelloController, spec);
    });

    it('executes hello() for "GET /hello"', async () => {
      const response = await requestEndpoint('GET', '/hello');
      expect(response.body).to.equal('hello');
    });

    it('executes bye() for "GET /bye"', async () => {
      const response = await requestEndpoint('GET', '/bye');
      expect(response.body).to.equal('bye');
    });

    it('executes postHello() for "POST /hello', async () => {
      const response = await requestEndpoint('POST', '/hello');
      expect(response.body).to.equal('hello posted');
    });

    it('returns 404 for path not handled', async () => {
      const response = await requestEndpoint('GET', '/unknown-path');
      expect(response.statusCode).to.equal(404);
    });

    it('returns 404 for verb not handled', async () => {
      const response = await requestEndpoint('POST', '/bye');
      expect(response.statusCode).to.equal(404);
    });
  });

context('with an operation echoing a string parameter from query', () => {
    beforeEach(function setupEchoController() {
      const spec = givenOpenApiSpec()
        .withOperation('get', '/echo', {
          'x-operation-name': 'echo',
          parameters: [
            // the type cast is not required, but improves Intellisense
            <ParameterObject> {
              name: 'msg',
              in: 'query',
              type: 'string',
            },
          ],
          responses: {
            '200': {
              type: 'string',
            },
          },
        })
        .build();

      class EchoController {
        public async echo(msg: string): Promise<string> {
          return msg;
        }
      }

      givenControllerClass(EchoController, spec);
    });

    it('returns "hello" for "?msg=hello"', async () => {
      const response = await requestEndpoint('GET', '/echo?msg=hello');
      expect(response.body).to.equal('hello');
    });

    it('url-decodes the parameter value', async () => {
      const response = await requestEndpoint('GET', '/echo?msg=hello%20world');
      expect(response.body).to.equal('hello world');
    });

    it('ignores other query fields', async () => {
      const response = await requestEndpoint('GET', '/echo?msg=hello&ignoreKey=ignoreMe');
      expect(response.body).to.equal('hello');
    });
  });

  context('with a path-parameter route', () => {
    beforeEach(givenRouteParamController);

    it('returns "admin" for "/users/admin"', async () => {
      const response = await requestEndpoint('GET', '/users/admin');
      expect(response.body).to.equal('admin');
    });

    function givenRouteParamController() {
      const spec = givenOpenApiSpec()
        .withOperation('get', '/users/{username}', {
          'x-operation-name': 'getUserByUsername',
          parameters: [
            <ParameterObject> {
              name: 'username',
              in: 'path',
              description: 'The name of the user to look up.',
              required: true,
              type: 'string',
            },
          ],
          responses: {
            200: {
              schema: {
                type: 'string',
              },
            },
          },
        })
        .build();

      class RouteParamController {
        public async getUserByUsername(userName: string): Promise<string> {
          return userName;
        }
      }

      givenControllerClass(RouteParamController, spec);
    }
  });

  context('with a header-parameter route', () => {
    beforeEach(givenHeaderParamController);

    it('returns the value sent in the header', async () => {
      const response = await requestEndpointWithOptions({
        method: 'GET',
        url: '/show-authorization',
        headers: { authorization: 'admin' },
      });
      expect(response.body).to.equal('admin');
    });

    function givenHeaderParamController() {
      const spec = givenOpenApiSpec()
        .withOperation('get', '/show-authorization', {
          'x-operation-name': 'showAuthorization',
          parameters: [
            <ParameterObject> {
              name: 'Authorization',
              in: 'header',
              description: 'Authorization credentials.',
              required: true,
              type: 'string',
            },
          ],
          responses: {
            200: {
              schema: {
                type: 'string',
              },
            },
          },
        })
        .build();

      class RouteParamController {
        async showAuthorization(auth: string): Promise<string> {
          return auth;
        }
      }

      givenControllerClass(RouteParamController, spec);
    }
  });

  context('with a formData-parameter route', () => {
    beforeEach(givenFormDataParamController);

    it('returns the value sent in json-encoded body', async () => {
      const response = await requestEndpointWithOptions({
        method: 'POST',
        url: '/show-formdata',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({key: 'value'}),
      });
      expect(response.statusCode).to.equal(200);
      expect(response.body).to.equal('value');
    });

    it('rejects url-encoded request body', async () => {
      logErrorsExcept(415);
      const response = await requestEndpointWithOptions({
        method: 'POST',
        url: '/show-formdata',
        form: {key: 'value'},
      });
      expect(response.statusCode).to.equal(415);
    });

    it('returns 400 for malformed JSON body', async () => {
      logErrorsExcept(400);
      const response = await requestEndpointWithOptions({
        method: 'POST',
        url: '/show-formdata',
        headers: {'content-type': 'application/json'},
        body: 'malformed-json',
      });
      expect(response.statusCode).to.equal(400);
    });

    function givenFormDataParamController() {
      const spec = givenOpenApiSpec()
        .withOperation('post', '/show-formdata', {
          'x-operation-name': 'showFormData',
          parameters: [
            <ParameterObject> {
              name: 'key',
              in: 'formData',
              description: 'Any value.',
              required: true,
              type: 'string',
            },
          ],
          responses: {
            200: {
              schema: {
                type: 'string',
              },
            },
          },
        })
        .build();

      class RouteParamController {
        async showFormData(key: string): Promise<string> {
          return key;
        }
      }

      givenControllerClass(RouteParamController, spec);
    }
  });

  context('with a body-parameter route', () => {
    beforeEach(givenBodyParamController);

    it('returns the value sent in json-encoded body', async () => {
      const response = await requestEndpointWithOptions({
        method: 'POST',
        url: '/show-body',
        json: true,
        body: {key: 'value'},
      });
      expect(response.statusCode).to.equal(200);
      expect(response.body).to.deepEqual({key: 'value'});
    });

    it('rejects url-encoded request body', async () => {
      logErrorsExcept(415);
      const response = await requestEndpointWithOptions({
        method: 'POST',
        url: '/show-body',
        form: {key: 'value'},
      });
      expect(response.statusCode).to.equal(415);
    });

    it('returns 400 for malformed JSON body', async () => {
      logErrorsExcept(400);
      const response = await requestEndpointWithOptions({
        method: 'POST',
        url: '/show-body',
        headers: {'content-type': 'application/json'},
        body: 'malformed-json',
      });
      expect(response.statusCode).to.equal(400);
    });

    function givenBodyParamController() {
      const spec = givenOpenApiSpec()
        .withOperation('post', '/show-body', {
          'x-operation-name': 'showBody',
          parameters: [
            <ParameterObject> {
              name: 'data',
              in: 'body',
              description: 'Any object value.',
              required: true,
              type: 'object',
            },
          ],
          responses: {
            200: {
              schema: {
                type: 'object',
              },
            },
          },
        })
        .build();

      class RouteParamController {
        async showBody(data: Object): Promise<Object> {
          return data;
        }
      }

      givenControllerClass(RouteParamController, spec);
    }
  });

  context('response serialization', () => {
    it('converts object result to a JSON response', async () => {
      const spec = givenOpenApiSpec()
        .withOperation('get', '/object', {
          'x-operation-name': 'getObject',
          responses: {
            '200': { type: 'object' },
          },
        })
        .build();

      class TestController {
        public async getObject(): Promise<Object> {
          return {key: 'value'};
        }
      }

      givenControllerClass(TestController, spec);

      const response = await requestEndpoint('GET', '/object');
      expect(response.statusCode).to.equal(200, 'statusCode');
      expect(response.headers['content-type']).to.match(/^application\/json($|;)/);
      expect(response.body).to.equal('{"key":"value"}', 'body');
    });
  });

  let router: SwaggerRouter;
  function givenRouter() {
    router = new SwaggerRouter();
  }

  // tslint:disable-next-line:no-any
  function givenControllerClass(ctor: new (...args: any[]) => Object, spec: OpenApiSpec) {
    router.controller((req, res) => new ctor(), spec);
  }

  async function requestEndpoint(verb: string, path: string): Promise<FullRequestResponse> {
    return requestEndpointWithOptions({
      url: path,
      method: verb,
    });
  }

  async function requestEndpointWithOptions(options: request.Options): Promise<FullRequestResponse> {
    const server = http.createServer(router.handler);
    const baseUrl = await listen(server);

    options = Object.assign({}, options, {
      baseUrl,
      simple: false,
      resolveWithFullResponse: true,
    });
    return request(options);
  }

  function logErrorsExcept(ignoreStatusCode: number) {
    const oldLogger = router.logError;
    router.logError = function logErrorConditionally(req: http.ServerRequest, statusCode: number, err: Error | string) {
      if (statusCode === ignoreStatusCode) return;
      // tslint:disable-next-line:no-invalid-this
      oldLogger.apply(this, arguments);
    };
  }
});
