// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  HttpHandler,
  DefaultSequence,
  writeResultToResponse,
  parseOperationArgs,
  RestBindings,
  FindRouteProvider,
  InvokeMethodProvider,
  RejectProvider,
} from '../..';
import {ControllerSpec, get} from '@loopback/openapi-v3';
import {Context} from '@loopback/context';
import {Client, createClientForHandler, expect} from '@loopback/testlab';
import * as HttpErrors from 'http-errors';
import {ParameterObject, RequestBodyObject} from '@loopback/openapi-v3-types';
import {anOpenApiSpec, anOperationSpec} from '@loopback/openapi-spec-builder';
import {createUnexpectedHttpErrorLogger} from '../helpers';
import * as express from 'express';

const SequenceActions = RestBindings.SequenceActions;

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
            <ParameterObject>{
              name: 'msg',
              in: 'query',
              type: 'string',
            },
          ],
          responses: {
            '200': {
              schema: {
                type: 'string',
              },
              description: '',
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
            <ParameterObject>{
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
              description: '',
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
            <ParameterObject>{
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
              description: '',
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

  context('with a body request route', () => {
    beforeEach(givenBodyParamController);

    it('returns the value sent in json-encoded body', () => {
      return client
        .post('/show-body')
        .send({key: 'value'})
        .expect(200, {key: 'value'});
    });

    it('rejects url-encoded request body', () => {
      logErrorsExcept(415);
      return client
        .post('/show-body')
        .send('key=value')
        .expect(415, {
          error: {
            message:
              'Content-type application/x-www-form-urlencoded is not supported.',
            name: 'UnsupportedMediaTypeError',
            statusCode: 415,
          },
        });
    });

    it('returns 400 for malformed JSON body', () => {
      logErrorsExcept(400);
      return client
        .post('/show-body')
        .set('content-type', 'application/json')
        .send('malformed-json')
        .expect(400, {
          error: {
            message: 'Unexpected token m in JSON at position 0',
            name: 'SyntaxError',
            statusCode: 400,
          },
        });
    });

    function givenBodyParamController() {
      const spec = anOpenApiSpec()
        .withOperation('post', '/show-body', {
          'x-operation-name': 'showBody',
          requestBody: <RequestBodyObject>{
            description: 'Any object value.',
            required: true,
            content: {
              'application/json': {
                schema: {type: 'object'},
              },
            },
          },
          responses: {
            200: {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                  },
                },
              },
              description: '',
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
            '200': {schema: {type: 'object'}, description: ''},
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
    it('handles errors thrown by controller constructor', () => {
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
      return client.get('/hello').expect(500, {
        error: {
          message: 'Internal Server Error',
          statusCode: 500,
        },
      });
    });

    it('handles invocation of an unknown method', async () => {
      const spec = anOpenApiSpec()
        .withOperation(
          'get',
          '/hello',
          anOperationSpec().withOperationName('unknownMethod'),
        )
        .build();

      class TestController {}

      givenControllerClass(TestController, spec);
      logErrorsExcept(404);

      await client.get('/hello').expect(404, {
        error: {
          message: 'Controller method not found: TestController.unknownMethod',
          name: 'NotFoundError',
          statusCode: 404,
        },
      });
    });

    it('handles errors thrown from the method', async () => {
      const spec = anOpenApiSpec()
        .withOperation(
          'get',
          '/hello',
          anOperationSpec().withOperationName('hello'),
        )
        .build();

      class TestController {
        @get('/hello')
        hello() {
          throw new HttpErrors.BadRequest('Bad hello');
        }
      }

      givenControllerClass(TestController, spec);
      logErrorsExcept(400);

      await client.get('/hello').expect(400, {
        error: {
          message: 'Bad hello',
          name: 'BadRequestError',
          statusCode: 400,
        },
      });
    });

    it('handles 500 error thrown from the method', async () => {
      const spec = anOpenApiSpec()
        .withOperation(
          'get',
          '/hello',
          anOperationSpec().withOperationName('hello'),
        )
        .build();

      class TestController {
        @get('/hello')
        hello() {
          throw new HttpErrors.InternalServerError('Bad hello');
        }
      }

      givenControllerClass(TestController, spec);
      logErrorsExcept(500);

      await client.get('/hello').expect(500, {
        error: {
          message: 'Internal Server Error',
          statusCode: 500,
        },
      });
    });

    it('respects error handler options', async () => {
      rootContext.bind(RestBindings.ERROR_WRITER_OPTIONS).to({debug: true});

      const spec = anOpenApiSpec()
        .withOperation(
          'get',
          '/hello',
          anOperationSpec().withOperationName('hello'),
        )
        .build();

      class TestController {
        @get('/hello')
        hello() {
          throw new HttpErrors.InternalServerError('Bad hello');
        }
      }

      givenControllerClass(TestController, spec);
      logErrorsExcept(500);

      const response = await client.get('/hello').expect(500);
      expect(response.body.error).to.containDeep({
        message: 'Bad hello',
        statusCode: 500,
      });
    });
  });

  let rootContext: Context;
  let handler: HttpHandler;
  function givenHandler() {
    rootContext = new Context();
    rootContext.bind(SequenceActions.FIND_ROUTE).toProvider(FindRouteProvider);
    rootContext.bind(SequenceActions.PARSE_PARAMS).to(parseOperationArgs);
    rootContext
      .bind(SequenceActions.INVOKE_METHOD)
      .toProvider(InvokeMethodProvider);
    rootContext
      .bind(SequenceActions.LOG_ERROR)
      .to(createUnexpectedHttpErrorLogger());
    rootContext.bind(SequenceActions.SEND).to(writeResultToResponse);
    rootContext.bind(SequenceActions.REJECT).toProvider(RejectProvider);

    rootContext.bind(RestBindings.SEQUENCE).toClass(DefaultSequence);

    handler = new HttpHandler(rootContext);
    rootContext.bind(RestBindings.HANDLER).to(handler);
  }

  function logErrorsExcept(ignoreStatusCode: number) {
    rootContext
      .bind(SequenceActions.LOG_ERROR)
      .to(createUnexpectedHttpErrorLogger(ignoreStatusCode));
  }

  function givenControllerClass(
    // tslint:disable-next-line:no-any
    ctor: new (...args: any[]) => Object,
    spec: ControllerSpec,
  ) {
    handler.registerController(spec, ctor);
  }

  function givenClient() {
    const app = express();
    app.use((req, res) => {
      handler.handleRequest(req, res).catch(err => {
        // This should never happen. If we ever get here,
        // then it means "handler.handlerRequest()" crashed unexpectedly.
        // We need to make a lot of helpful noise in such case.
        console.error('Request failed.', err.stack);
        if (res.headersSent) return;
        res.statusCode = 500;
        res.end();
      });
    });
    client = createClientForHandler(app);
  }
});
