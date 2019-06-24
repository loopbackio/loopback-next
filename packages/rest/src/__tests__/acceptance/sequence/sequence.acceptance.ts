// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {inject} from '@loopback/context';
import {Application} from '@loopback/core';
import {anOpenApiSpec} from '@loopback/openapi-spec-builder';
import {api} from '@loopback/openapi-v3';
import {Client, createClientForHandler} from '@loopback/testlab';
import {
  ControllerClass,
  ControllerInstance,
  DefaultSequence,
  FindRoute,
  HttpServerLike,
  InvokeMethod,
  ParseParams,
  Reject,
  RequestContext,
  RestApplication,
  RestBindings,
  RestComponent,
  RestServer,
  Send,
  SequenceHandler,
} from '../../..';

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
    await whenIRequest()
      .get('/name')
      .expect('SequenceApp');
  });

  it('allows users to define a custom sequence as a function', () => {
    server.handler(({response}, sequence) => {
      sequence.send(response, 'hello world');
    });
    return whenIRequest()
      .get('/')
      .expect('hello world');
  });

  it('allows users to define a custom sequence as a class', async () => {
    class MySequence implements SequenceHandler {
      constructor(@inject(SequenceActions.SEND) private send: Send) {}

      async handle({response}: RequestContext) {
        this.send(response, 'hello world');
      }
    }
    // bind user defined sequence
    server.sequence(MySequence);

    await whenIRequest()
      .get('/')
      .expect('hello world');
  });

  it('allows users to bind a custom sequence class', () => {
    class MySequence implements SequenceHandler {
      constructor(
        @inject(SequenceActions.FIND_ROUTE) protected findRoute: FindRoute,
        @inject(SequenceActions.PARSE_PARAMS)
        protected parseParams: ParseParams,
        @inject(SequenceActions.INVOKE_METHOD) protected invoke: InvokeMethod,
        @inject(SequenceActions.SEND) protected send: Send,
      ) {}

      async handle(context: RequestContext) {
        const {request, response} = context;
        const route = this.findRoute(request);
        const args = await this.parseParams(request, route);
        const result = await this.invoke(route, args);
        this.send(response, `MySequence ${result}`);
      }
    }

    server.sequence(MySequence);

    return whenIRequest()
      .get('/name')
      .expect('MySequence SequenceApp');
  });

  it('allows users to bind a custom sequence class via app.sequence()', async () => {
    class MySequence implements SequenceHandler {
      constructor(@inject(SequenceActions.SEND) protected send: Send) {}

      async handle({response}: RequestContext) {
        this.send(response, 'MySequence was invoked.');
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
    const reject: Reject = ({response}, error) => {
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
    server.handler((context, sequence) => {
      sequence.send(context.response, context.getSync('test'));
    });

    return whenIRequest()
      .get('/')
      .expect('hello world');
  });

  it('makes ctx available in a custom sequence class', () => {
    class MySequence extends DefaultSequence {
      constructor(
        @inject(SequenceActions.FIND_ROUTE) protected findRoute: FindRoute,
        @inject(SequenceActions.PARSE_PARAMS)
        protected parseParams: ParseParams,
        @inject(SequenceActions.INVOKE_METHOD) protected invoke: InvokeMethod,
        @inject(SequenceActions.SEND) public send: Send,
        @inject(SequenceActions.REJECT) public reject: Reject,
      ) {
        super(findRoute, parseParams, invoke, send, reject);
      }

      async handle(context: RequestContext) {
        this.send(context.response, context.getSync('test'));
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
    return createClientForHandler(restServerOrApp.requestHandler);
  }
});
