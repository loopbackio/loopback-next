// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  FindRoute,
  InvokeMethod,
  Send,
  Reject,
  SequenceHandler,
  ParseParams,
  DefaultSequence,
  RestBindings,
  RestServer,
  RestComponent,
  RestApplication,
  HttpServerLike,
  HttpContext,
} from '../../..';
import {api} from '@loopback/openapi-v3';
import {Application} from '@loopback/core';
import {expect, createClientForHandler, Client} from '@loopback/testlab';
import {anOpenApiSpec} from '@loopback/openapi-spec-builder';
import {inject, Context} from '@loopback/context';
import {
  ControllerClass,
  ControllerInstance,
} from '../../../src/router/routing-table';

const SequenceActions = RestBindings.SequenceActions;

/* # Feature: Sequence
 * - In order to build REST APIs
 * - As a framework developer
 * - I want the framework to handle default sequence and user defined sequence
 */
describe('Sequence', () => {
  let app: Application;
  let server: RestServer;
  beforeEach(givenAppWithController);
  it('provides a default sequence', async () => {
    whenIRequest()
      .get('/name')
      .expect('SequenceApp');
  });

  it('allows users to define a custom sequence as a function', () => {
    server.handler((sequence, httpCtx) => {
      sequence.send(httpCtx.response, 'hello world');
    });
    return whenIRequest()
      .get('/')
      .expect('hello world');
  });

  it('allows users to define a custom sequence as a class', () => {
    class MySequence implements SequenceHandler {
      constructor(@inject(SequenceActions.SEND) private send: Send) {}

      async handle(httpCtx: HttpContext) {
        this.send(httpCtx.response, 'hello world');
      }
    }
    // bind user defined sequence
    server.sequence(MySequence);

    whenIRequest()
      .get('/')
      .expect('hello world');
  });

  it('allows users to bind a custom sequence class', () => {
    class MySequence {
      constructor(
        @inject(SequenceActions.FIND_ROUTE) protected findRoute: FindRoute,
        @inject(SequenceActions.PARSE_PARAMS)
        protected parseParams: ParseParams,
        @inject(SequenceActions.INVOKE_METHOD) protected invoke: InvokeMethod,
        @inject(SequenceActions.SEND) protected send: Send,
      ) {}

      async handle(httpCtx: HttpContext) {
        const route = this.findRoute(httpCtx.request);
        const args = await this.parseParams(httpCtx.request, route);
        const result = await this.invoke(route, args);
        this.send(httpCtx.response, `MySequence ${result}`);
      }
    }

    server.sequence(MySequence);

    return whenIRequest()
      .get('/name')
      .expect('MySequence SequenceApp');
  });

  it('allows users to bind a custom sequence class via app.sequence()', async () => {
    class MySequence {
      constructor(@inject(SequenceActions.SEND) protected send: Send) {}

      async handle(httpCtx: HttpContext) {
        this.send(httpCtx.response, 'MySequence was invoked.');
      }
    }

    const restApp = new RestApplication();
    restApp.sequence(MySequence);

    await whenIRequest(restApp)
      .get('/name')
      .expect('MySequence was invoked.');
  });

  it('user-defined Send', () => {
    const send: Send = (response, result) => {
      response.setHeader('content-type', 'text/plain');
      response.end(`CUSTOM FORMAT: ${result}`);
    };
    server.bind(SequenceActions.SEND).to(send);

    return whenIRequest()
      .get('/name')
      .expect('CUSTOM FORMAT: SequenceApp');
  });

  it('user-defined Reject', () => {
    const reject: Reject = (response, request, error) => {
      response.statusCode = 418; // I'm a teapot
      response.end();
    };
    server.bind(SequenceActions.REJECT).to(reject);

    return whenIRequest()
      .get('/unknown-url')
      .expect(418);
  });

  it('makes ctx available in a custom sequence handler function', () => {
    app.bind('test').to('hello world');
    server.handler((sequence, httpCtx) => {
      expect.exists(sequence.ctx);
      sequence.send(httpCtx.response, sequence.ctx.getSync('test'));
    });

    return whenIRequest()
      .get('/')
      .expect('hello world');
  });

  it('makes ctx available in a custom sequence class', () => {
    class MySequence extends DefaultSequence {
      constructor(
        @inject(RestBindings.Http.CONTEXT) public ctx: Context,
        @inject(SequenceActions.FIND_ROUTE) protected findRoute: FindRoute,
        @inject(SequenceActions.PARSE_PARAMS)
        protected parseParams: ParseParams,
        @inject(SequenceActions.INVOKE_METHOD) protected invoke: InvokeMethod,
        @inject(SequenceActions.SEND) public send: Send,
        @inject(SequenceActions.REJECT) public reject: Reject,
      ) {
        super(ctx, findRoute, parseParams, invoke, send, reject);
      }

      async handle(httpCtx: HttpContext) {
        this.send(httpCtx.response, this.ctx.getSync('test'));
      }
    }

    server.sequence(MySequence);
    app.bind('test').to('hello world');

    return whenIRequest()
      .get('/')
      .expect('hello world');
  });

  async function givenAppWithController() {
    await givenAnApplication();
    app.bind('application.name').to('SequenceApp');

    const apispec = anOpenApiSpec()
      .withOperation('get', '/name', {
        'x-operation-name': 'getName',
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

    @api(apispec)
    class InfoController {
      constructor(@inject('application.name') public appName: string) {}

      async getName(): Promise<string> {
        return this.appName;
      }
    }
    givenControllerInServer(InfoController);
  }
  /* ===== HELPERS ===== */

  async function givenAnApplication() {
    app = new Application();
    app.component(RestComponent);
    server = await app.getServer(RestServer);
  }

  function givenControllerInServer(
    controller: ControllerClass<ControllerInstance>,
  ) {
    app.controller(controller);
  }

  function whenIRequest(restServerOrApp: HttpServerLike = server): Client {
    return createClientForHandler(restServerOrApp.requestListener);
  }
});
