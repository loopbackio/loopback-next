// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Application,
  api,
  ParameterObject,
  ServerRequest,
  ServerResponse,
  ParsedRequest,
  OperationArgs,
  FindRoute,
  InvokeMethod,
  Send,
  Reject,
  SequenceHandler,
  ParseParams,
  DefaultSequence,
  CoreBindings,
} from '../../..';
import {expect, Client, createClientForApp} from '@loopback/testlab';
import {anOpenApiSpec} from '@loopback/openapi-spec-builder';
import {inject, Constructor, Context} from '@loopback/context';
import {ControllerClass} from '../../../src/router/routing-table';

const SequenceActions = CoreBindings.SequenceActions;

/* # Feature: Sequence
 * - In order to build REST APIs
 * - As a framework developer
 * - I want the framework to handle default sequence and user defined sequence
 */
describe('Sequence', () => {
  let app: Application;
  beforeEach(givenAppWithController);

  it('provides a default sequence', async () => {
    whenIMakeRequestTo(app).get('/name').expect('SequenceApp');
  });

  it('allows users to define a custom sequence as a function', () => {
    app.handler((sequence, request, response) => {
      sequence.send(response, 'hello world');
    });
    return whenIMakeRequestTo(app).get('/').expect('hello world');
  });

  it('allows users to define a custom sequence as a class', () => {
    class MySequence implements SequenceHandler {
      constructor(@inject(SequenceActions.SEND) private send: Send) {}

      async handle(req: ParsedRequest, res: ServerResponse) {
        this.send(res, 'hello world');
      }
    }
    // bind user defined sequence
    app.httpSequence(MySequence);

    whenIMakeRequestTo(app).get('/').expect('hello world');
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

      async handle(req: ParsedRequest, res: ServerResponse) {
        const route = this.findRoute(req);
        const args = await this.parseParams(req, route);
        const result = await this.invoke(route, args);
        this.send(res, `MySequence ${result}`);
      }
    }

    app.httpSequence(MySequence);

    return whenIMakeRequestTo(app)
      .get('/name')
      .expect('MySequence SequenceApp');
  });

  it('user-defined Send', () => {
    const send: Send = (response, result) => {
      response.setHeader('content-type', 'text/plain');
      response.end(`CUSTOM FORMAT: ${result}`);
    };
    app.bind(SequenceActions.SEND).to(send);

    return whenIMakeRequestTo(app)
      .get('/name')
      .expect('CUSTOM FORMAT: SequenceApp');
  });

  it('user-defined Reject', () => {
    const reject: Reject = (response, request, error) => {
      response.statusCode = 418; // I'm a teapot
      response.end();
    };
    app.bind(SequenceActions.REJECT).to(reject);

    return whenIMakeRequestTo(app).get('/unknown-url').expect(418);
  });

  it('makes ctx available in a custom sequence handler function', () => {
    app.bind('test').to('hello world');
    app.handler((sequence, request, response) => {
      expect.exists(sequence.ctx);
      sequence.send(response, sequence.ctx.getSync('test'));
    });

    return whenIMakeRequestTo(app).get('/').expect('hello world');
  });

  it('makes ctx available in a custom sequence class', () => {
    class MySequence extends DefaultSequence {
      constructor(
        @inject(CoreBindings.Http.CONTEXT) public ctx: Context,
        @inject(SequenceActions.FIND_ROUTE) protected findRoute: FindRoute,
        @inject(SequenceActions.PARSE_PARAMS)
        protected parseParams: ParseParams,
        @inject(SequenceActions.INVOKE_METHOD) protected invoke: InvokeMethod,
        @inject(SequenceActions.SEND) public send: Send,
        @inject(SequenceActions.REJECT) public reject: Reject,
      ) {
        super(ctx, findRoute, parseParams, invoke, send, reject);
      }

      async handle(req: ParsedRequest, res: ServerResponse) {
        this.send(res, this.ctx.getSync('test'));
      }
    }

    app.httpSequence(MySequence);
    app.bind('test').to('hello world');

    return whenIMakeRequestTo(app).get('/').expect('hello world');
  });

  function givenAppWithController() {
    givenAnApplication();
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
    givenControllerInApp(InfoController);
  }
  /* ===== HELPERS ===== */

  function givenAnApplication() {
    app = new Application();
  }

  function givenControllerInApp(controller: ControllerClass) {
    app.controller(controller);
  }

  function whenIMakeRequestTo(application: Application): Client {
    return createClientForApp(app);
  }
});
