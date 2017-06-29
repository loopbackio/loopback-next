// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  HttpHandler,
  Sequence,
  ServerRequest,
  writeResultToResponse,
  RejectProvider,
} from '../..';
import {Context} from '@loopback/context';
import {expect, Client, createClientForHandler} from '@loopback/testlab';
import {OpenApiSpec, ParameterObject} from '@loopback/openapi-spec';
import {anOpenApiSpec} from '@loopback/openapi-spec-builder';

describe('HttpHandler', () => {
  let client: Client;
  beforeEach(givenHandler);
  beforeEach(givenClient);

  context('with a simple HelloWorld controller', () => {
    beforeEach(function setupHelloController() {
      const spec = anOpenApiSpec()
        .withOperationReturningString('get', '/hello', 'greet')
        .build();

      class HelloController {
        public async greet(): Promise<string> {
          return 'Hello world!';
        }
      }

      givenControllerClass(HelloController, spec);
    });

    it('handles simple "GET /hello" requests', () => {
      return client
        .get('/hello')
        .expect(200)
        .expect('content-type', 'text/plain')
        .expect('Hello world!');
    });
  });

  context('with a controller with operations at different paths/verbs', () => {
    beforeEach(function setupHelloController() {
      const spec = anOpenApiSpec()
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

    it('executes hello() for "GET /hello"', () => {
      return client.get('/hello').expect('hello');
    });

    it('executes bye() for "GET /bye"', () => {
      return client.get('/bye').expect('bye');
    });

    it('executes postHello() for "POST /hello', () => {
      return client.post('/hello').expect('hello posted');
    });

    it('returns 404 for path not handled', () => {
      logErrorsExcept(404);
      return client.get('/unknown-path').expect(404);
    });

    it('returns 404 for verb not handled', () => {
      logErrorsExcept(404);
      return client.post('/bye').expect(404);
    });
  });

  context('with an operation echoing a string parameter from query', () => {
    beforeEach(function setupEchoController() {
      const spec = anOpenApiSpec()
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

    it('returns "hello" for "?msg=hello"', () => {
      return client.get('/echo?msg=hello').expect('hello');
    });

    it('url-decodes the parameter value', () => {
      return client.get('/echo?msg=hello%20world').expect('hello world');
    });

    it('ignores other query fields', () => {
      return client.get('/echo?msg=hello&ignoreKey=ignoreMe').expect('hello');
    });
  });

  context('with a path-parameter route', () => {
    beforeEach(givenRouteParamController);

    it('returns "admin" for "/users/admin"', () => {
      return client.get('/users/admin').expect('admin');
    });

    function givenRouteParamController() {
      const spec = anOpenApiSpec()
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

    it('returns the value sent in the header', () => {
      return client
        .get('/show-authorization')
        .set('authorization', 'admin')
        .expect('admin');
    });

    function givenHeaderParamController() {
      const spec = anOpenApiSpec()
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

    it('returns the value sent in json-encoded body', () => {
      return client
        .post('/show-formdata')
        .send({key: 'value'})
        .expect(200, 'value');
    });

    it('rejects url-encoded request body', () => {
      logErrorsExcept(415);
      return client.post('/show-formdata').send('key=value').expect(415);
    });

    it('returns 400 for malformed JSON body', () => {
      logErrorsExcept(400);
      return client
        .post('/show-formdata')
        .set('content-type', 'application/json')
        .send('malformed-json')
        .expect(400);
    });

    function givenFormDataParamController() {
      const spec = anOpenApiSpec()
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

    it('returns the value sent in json-encoded body', () => {
      return client
        .post('/show-body')
        .send({key: 'value'})
        .expect(200, {key: 'value'});
    });

    it('rejects url-encoded request body', () => {
      logErrorsExcept(415);
      return client.post('/show-body').send('key=value').expect(415);
    });

    it('returns 400 for malformed JSON body', () => {
      logErrorsExcept(400);
      return client
        .post('/show-body')
        .set('content-type', 'application/json')
        .send('malformed-json')
        .expect(400);
    });

    function givenBodyParamController() {
      const spec = anOpenApiSpec()
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
    it('converts object result to a JSON response', () => {
      const spec = anOpenApiSpec()
        .withOperation('get', '/object', {
          'x-operation-name': 'getObject',
          responses: {
            '200': {type: 'object'},
          },
        })
        .build();

      class TestController {
        public async getObject(): Promise<Object> {
          return {key: 'value'};
        }
      }

      givenControllerClass(TestController, spec);

      return client
        .get('/object')
        .expect(200)
        .expect('content-type', /^application\/json($|;)/)
        .expect('{"key":"value"}');
    });
  });

  context('error handling', () => {
    it('handles errors throws by controller constructor', () => {
      const spec = anOpenApiSpec()
        .withOperationReturningString('get', '/hello', 'greet')
        .build();

      class ThrowingController {
        constructor() {
          throw new Error('Thrown from constructor.');
        }
      }

      givenControllerClass(ThrowingController, spec);

      logErrorsExcept(500);
      return client.get('/hello').expect(500);
    });
  });

  let rootContext: Context;
  let handler: HttpHandler;
  function givenHandler() {
    rootContext = new Context();
    rootContext.bind('logError').to(logger);
    rootContext.bind('sequence.actions.send').to(writeResultToResponse);
    rootContext.bind('sequence.actions.reject').toProvider(RejectProvider);
    rootContext.bind('sequence').toClass(Sequence);

    function logger(err: Error, statusCode: number, req: ServerRequest) {
      console.error(
        'Unhandled error in %s %s: %s %s',
        req.method,
        req.url,
        statusCode,
        err.stack || err,
      );
    }

    handler = new HttpHandler(rootContext);
  }

  function givenControllerClass(
    // tslint:disable-next-line:no-any
    ctor: new (...args: any[]) => Object,
    spec: OpenApiSpec,
  ) {
    rootContext.bind('test-controller').toClass(ctor);
    handler.registerController('test-controller', spec);
  }

  function givenClient() {
    client = createClientForHandler((req, res) => {
      handler.handleRequest(req, res).catch(err => {
        console.error('Request failed.', err.stack);
        if (res.headersSent) return;
        res.statusCode = 500;
        res.end();
      });
    });
  }

  function logErrorsExcept(ignoreStatusCode: number) {
    const oldLogger: Function = rootContext.getSync('logError');
    rootContext.bind('logError').to(conditionalLogger);

    function conditionalLogger(
      err: Error,
      statusCode: number,
      req: ServerRequest,
    ) {
      if (statusCode === ignoreStatusCode) return;
      // tslint:disable-next-line:no-invalid-this
      oldLogger.apply(this, arguments);
    }
  }
});
