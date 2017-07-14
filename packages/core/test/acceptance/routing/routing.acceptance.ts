// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Application,
  api,
  OpenApiSpec,
  ParameterObject,
  OperationObject,
  ServerRequest,
  ServerResponse,
  ResponseObject,
  Route,
} from '../../..';
import {expect, Client, createClientForApp} from '@loopback/testlab';
import {anOpenApiSpec, anOperationSpec} from '@loopback/openapi-spec-builder';
import {inject, Constructor, Context} from '@loopback/context';

/* # Feature: Routing
 * - In order to build REST APIs
 * - As an app developer
 * - I want the framework to handle the request to controller method routing
 * - So that I can focus on my implementing the methods and not the routing
 */
describe('Routing', () => {
  /* ## Scenario: Basic Usage
   * - Given an `Application`
   * - And API spec describing a single endpoint accepting a "msg" query field
   * - And a controller implementing that API spec
   * - When I make a request to the `Application` with `?msg=hello%20world`
   * - Then I get the result `hello world` from the `Method`
   */
  it('supports basic usage', () => {
    const app = givenAnApplication();

    const spec = anOpenApiSpec()
      .withOperation('get', '/echo', anOperationSpec()
        .withOperationName('echo')
        .withParameter({
            name: 'msg',
            in: 'query',
            type: 'string',
          })
        .withStringResponse())
      .build();

    @api(spec)
    class EchoController {
      async echo(msg: string): Promise<string> {
        return msg;
      }
    }
    givenControllerInApp(app, EchoController);

    return whenIMakeRequestTo(app).get('/echo?msg=hello%20world')
      // Then I get the result `hello world` from the `Method`
      .expect('hello world');
  });

  it('injects controller constructor arguments', () => {
    const app = givenAnApplication();
    app.bind('application.name').to('TestApp');

    const spec = anOpenApiSpec()
      .withOperation('get', '/name', anOperationSpec()
        .withOperationName('getName')
        .withStringResponse())
      .build();

    @api(spec)
    class InfoController {
      constructor(@inject('application.name') public appName: string) {}

      async getName(): Promise<string> {
        return this.appName;
      }
    }
    givenControllerInApp(app, InfoController);

    return whenIMakeRequestTo(app).get('/name').expect('TestApp');
  });

  it('creates a new child context for each request', async () => {
    const app = givenAnApplication();
    app.bind('flag').to('original');

    // create a special binding returning the current context instance
    app.bind('context').getValue = ctx => ctx;

    const spec = anOpenApiSpec()
      .withOperationReturningString('put', '/flag', 'setFlag')
      .withOperationReturningString('get', '/flag', 'getFlag')
      .build();

    @api(spec)
    class FlagController {
      constructor(@inject('context') private ctx: Context) {}

      async setFlag(): Promise<string> {
        this.ctx.bind('flag').to('modified');
        return 'modified';
      }

      async getFlag(): Promise<string> {
        return this.ctx.get('flag');
      }
    }
    givenControllerInApp(app, FlagController);

    // Rebind "flag" to "modified". Since we are modifying
    // the per-request child context, the change should
    // be discarded after the request is done.
    await whenIMakeRequestTo(app).put('/flag');

    // Get the value "flag" is bound to.
    // This should return the original value.
    await whenIMakeRequestTo(app).get('/flag').expect('original');
  });

  it('binds request and response objects', () => {
    const app = givenAnApplication();

    const spec = anOpenApiSpec()
      .withOperationReturningString('get', '/status', 'getStatus')
      .build();

    @api(spec)
    class StatusController {
      constructor(
        @inject('http.request') private request: ServerRequest,
        @inject('http.response') private response: ServerResponse,
      ) {}

      async getStatus(): Promise<string> {
        this.response.statusCode = 202; // 202 Accepted
        return this.request.method as string;
      }
    }
    givenControllerInApp(app, StatusController);

    return whenIMakeRequestTo(app).get('/status').expect(202, 'GET');
  });

  it('binds controller constructor object and operation', () => {
    const app = givenAnApplication();

    const spec = anOpenApiSpec()
      .withOperationReturningString('get', '/name', 'getControllerName')
      .build();

    @api(spec)
    class GetCurrentController {
      constructor(
        @inject('controller.current.ctor') private ctor: Function,
        @inject('controller.current.operation') private operation: string,
      ) {
        expect(GetCurrentController).eql(ctor);
      }

      async getControllerName(): Promise<object> {
        return {
          ctor: this.ctor.name,
          operation: this.operation,
        };
      }
    }
    givenControllerInApp(app, GetCurrentController);

    return whenIMakeRequestTo(app).get('/name').expect({
      ctor: 'GetCurrentController',
      operation: 'getControllerName',
    });
  });

  it('supports function-based routes', async () => {
    const app = givenAnApplication();

    const routeSpec = <OperationObject> {
      parameters: [
        <ParameterObject> {name: 'name', in: 'query', type: 'string'},
      ],
      responses: {
        200: <ResponseObject> {
          description: 'greeting text',
          schema: {type: 'string'},
        },
      },
    };

    function greet(name: string) {
      return `hello ${name}`;
    }

    const route = new Route('get', '/greet', routeSpec, greet);
    app.route(route);

    const client = whenIMakeRequestTo(app);
    await client.get('/greet?name=world').expect(200, 'hello world');
  });

  it('supports handler routes declared via API specification', async () => {
    const app = givenAnApplication();

    function greet(name: string) {
      return `hello ${name}`;
    }

    const spec = anOpenApiSpec()
      .withOperation(
        'get',
        '/greet',
        anOperationSpec()
          .withParameter({name: 'name', in: 'query', type: 'string'})
          .withExtension('x-operation', greet),
      )
      .build();

    app.api(spec);

    const client = whenIMakeRequestTo(app);
    await client.get('/greet?name=world').expect(200, 'hello world');
  });

  it('supports API spec with no paths property', () => {
    const app = givenAnApplication();
    const spec = anOpenApiSpec().build();
    delete spec.paths;
    app.api(spec);
  });

  it('supports API spec with a path with no verbs', () => {
    const app = givenAnApplication();
    const spec = anOpenApiSpec().build();
    spec.paths = {'/greet': {}};
    app.api(spec);
  });

  it('supports controller routes declared via API spec', async () => {
    const app = givenAnApplication();

    class MyController {
      greet(name: string) {
        return `hello ${name}`;
      }
    }

    const spec = anOpenApiSpec()
      .withOperation(
        'get',
        '/greet',
        anOperationSpec()
          .withParameter({name: 'name', in: 'query', type: 'string'})
          .withExtension('x-operation-name', 'greet')
          .withExtension('x-controller', 'MyController'),
      )
      .build();

    app.api(spec);
    app.controller(MyController);

    const client = whenIMakeRequestTo(app);
    await client.get('/greet?name=world').expect(200, 'hello world');
  });

  /* ===== HELPERS ===== */

  function givenAnApplication() {
    return new Application();
  }

  function givenControllerInApp<T>(
    app: Application,
    controller: Constructor<T>,
  ) {
    app.controller(controller);
  }

  function whenIMakeRequestTo(app: Application): Client {
    return createClientForApp(app);
  }
});
