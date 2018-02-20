// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  ServerRequest,
  ServerResponse,
  Route,
  RestBindings,
  RestServer,
  RestComponent,
  RestApplication,
} from '../../..';

import {api, get, param} from '@loopback/openapi-v2';

import {Application} from '@loopback/core';

import {
  ParameterObject,
  OperationObject,
  ResponseObject,
} from '@loopback/openapi-spec';

import {expect, Client, createClientForHandler} from '@loopback/testlab';
import {anOpenApiSpec, anOperationSpec} from '@loopback/openapi-spec-builder';
import {inject, Context} from '@loopback/context';
import {ControllerClass} from '../../../src/router/routing-table';

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
  it('supports basic usage', async () => {
    const app = givenAnApplication();
    const server = await givenAServer(app);
    const spec = anOpenApiSpec()
      .withOperation(
        'get',
        '/echo',
        anOperationSpec()
          .withOperationName('echo')
          .withParameter({
            name: 'msg',
            in: 'query',
            type: 'string',
          })
          .withStringResponse(),
      )
      .build();

    @api(spec)
    class EchoController {
      async echo(msg: string): Promise<string> {
        return msg;
      }
    }
    givenControllerInApp(app, EchoController);

    return (
      whenIMakeRequestTo(server)
        .get('/echo?msg=hello%20world')
        // Then I get the result `hello world` from the `Method`
        .expect('hello world')
    );
  });

  it('allows controllers to define the API using decorators', async () => {
    const spec = anOperationSpec()
      .withParameter({name: 'name', in: 'query', type: 'string'})
      .withStringResponse()
      .build();

    class MyController {
      @get('/greet', spec)
      greet(name: string) {
        return `hello ${name}`;
      }
    }

    const app = givenAnApplication();
    const server = await givenAServer(app);
    givenControllerInApp(app, MyController);

    return (
      whenIMakeRequestTo(server)
        .get('/greet?name=world')
        // Then I get the result `hello world` from the `Method`
        .expect('hello world')
    );
  });

  it('allows controllers to define params via decorators', async () => {
    class MyController {
      @get('/greet')
      @param.query.string('name')
      greet(name: string) {
        return `hello ${name}`;
      }
    }
    const app = givenAnApplication();
    const server = await givenAServer(app);
    givenControllerInApp(app, MyController);
    return (
      whenIMakeRequestTo(server)
        .get('/greet?name=world')
        // Then I get the result `hello world` from the `Method`
        .expect('hello world')
    );
  });

  it('allows controllers to use method DI with mixed params', async () => {
    class MyController {
      @get('/greet')
      greet(
        @param.query.string('name') name: string,
        @inject('hello.prefix') prefix: string,
      ) {
        return `${prefix} ${name}`;
      }
    }
    const app = givenAnApplication();
    app.bind('hello.prefix').to('Hello');
    const server = await givenAServer(app);
    givenControllerInApp(app, MyController);
    return (
      whenIMakeRequestTo(server)
        .get('/greet?name=world')
        // Then I get the result `hello world` from the `Method`
        .expect('Hello world')
    );
  });

  it('allows controllers to use method DI without rest params', async () => {
    class MyController {
      @get('/greet')
      greet(@inject('hello.prefix') prefix: string) {
        return `${prefix} world`;
      }
    }
    const app = givenAnApplication();
    app.bind('hello.prefix').to('Hello');
    const server = await givenAServer(app);
    givenControllerInApp(app, MyController);
    return (
      whenIMakeRequestTo(server)
        .get('/greet')
        // Then I get the result `hello world` from the `Method`
        .expect('Hello world')
    );
  });

  it('reports an error if not all parameters can be resolved', async () => {
    class MyController {
      @get('/greet')
      greet(
        @param.query.string('firstName') firstName: string,
        lastName: string,
        @inject('hello.prefix') prefix: string,
      ) {
        return `${prefix} ${firstName} ${lastName}`;
      }
    }
    const app = givenAnApplication();
    app.bind('hello.prefix').to('Hello');
    const server = await givenAServer(app);
    givenControllerInApp(app, MyController);
    return expect(whenIMakeRequestTo(server).get('/greet?firstName=John'))
      .to.be.rejectedWith(
        'Cannot resolve injected arguments for ' +
          'MyController.prototype.greet[1]: The arguments[1] is not ' +
          'decorated for dependency injection, but a value is not supplied',
      )
      .catch(err => {});
  });

  it('injects controller constructor arguments', async () => {
    const app = givenAnApplication();
    const server = await givenAServer(app);
    server.bind('application.name').to('TestApp');

    const spec = anOpenApiSpec()
      .withOperation(
        'get',
        '/name',
        anOperationSpec()
          .withOperationName('getName')
          .withStringResponse(),
      )
      .build();

    @api(spec)
    class InfoController {
      constructor(@inject('application.name') public appName: string) {}

      async getName(): Promise<string> {
        return this.appName;
      }
    }
    givenControllerInApp(app, InfoController);

    return whenIMakeRequestTo(server)
      .get('/name')
      .expect('TestApp');
  });

  it('creates a new child context for each request', async () => {
    const app = givenAnApplication();
    const server = await givenAServer(app);
    server.bind('flag').to('original');

    // create a special binding returning the current context instance
    server.bind('context').getValue = ctx => ctx;

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
        return this.ctx.get<string>('flag');
      }
    }
    givenControllerInApp(app, FlagController);

    // Rebind "flag" to "modified". Since we are modifying
    // the per-request child context, the change should
    // be discarded after the request is done.
    await whenIMakeRequestTo(server).put('/flag');

    // Get the value "flag" is bound to.
    // This should return the original value.
    await whenIMakeRequestTo(server)
      .get('/flag')
      .expect('original');
  });

  it('binds request and response objects', async () => {
    const app = givenAnApplication();
    const server = await givenAServer(app);

    const spec = anOpenApiSpec()
      .withOperationReturningString('get', '/status', 'getStatus')
      .build();

    @api(spec)
    class StatusController {
      constructor(
        @inject(RestBindings.Http.REQUEST) private request: ServerRequest,
        @inject(RestBindings.Http.RESPONSE) private response: ServerResponse,
      ) {}

      async getStatus(): Promise<string> {
        this.response.statusCode = 202; // 202 Accepted
        return this.request.method as string;
      }
    }
    givenControllerInApp(app, StatusController);

    return whenIMakeRequestTo(server)
      .get('/status')
      .expect(202, 'GET');
  });

  it('binds controller constructor object and operation', async () => {
    const app = givenAnApplication();
    const server = await givenAServer(app);
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

    return whenIMakeRequestTo(server)
      .get('/name')
      .expect({
        ctor: 'GetCurrentController',
        operation: 'getControllerName',
      });
  });

  it('supports function-based routes', async () => {
    const app = givenAnApplication();
    const server = await givenAServer(app);

    const routeSpec = <OperationObject>{
      parameters: [
        <ParameterObject>{name: 'name', in: 'query', type: 'string'},
      ],
      responses: {
        200: <ResponseObject>{
          description: 'greeting text',
          schema: {type: 'string'},
        },
      },
    };

    function greet(name: string) {
      return `hello ${name}`;
    }

    const route = new Route('get', '/greet', routeSpec, greet);
    server.route(route);

    const client = whenIMakeRequestTo(server);
    await client.get('/greet?name=world').expect(200, 'hello world');
  });

  it('supports handler routes declared via API specification', async () => {
    const app = givenAnApplication();
    const server = await givenAServer(app);

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

    server.api(spec);

    const client = whenIMakeRequestTo(server);
    await client.get('/greet?name=world').expect(200, 'hello world');
  });

  it('supports API spec with no paths property', async () => {
    const app = givenAnApplication();
    const server = await givenAServer(app);
    const spec = anOpenApiSpec().build();
    delete spec.paths;
    server.api(spec);
  });

  it('supports API spec with a path with no verbs', async () => {
    const app = givenAnApplication();
    const server = await givenAServer(app);
    const spec = anOpenApiSpec().build();
    spec.paths = {'/greet': {}};
    server.api(spec);
  });

  it('supports controller routes declared via API spec', async () => {
    const app = givenAnApplication();
    const server = await givenAServer(app);

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
          .withExtension('x-controller-name', 'MyController'),
      )
      .build();

    server.api(spec);
    app.controller(MyController);

    const client = whenIMakeRequestTo(server);
    await client.get('/greet?name=world').expect(200, 'hello world');
  });

  it('supports controller routes declared via API spec with basePath', async () => {
    const app = givenAnApplication();
    const server = await givenAServer(app);

    @api({basePath: '/my', paths: {}})
    class MyController {
      @get('/greet')
      greet(@param.query.string('name') name: string) {
        return `hello ${name}`;
      }
    }

    app.controller(MyController);

    const client = whenIMakeRequestTo(server);
    await client.get('/my/greet?name=world').expect(200, 'hello world');
  });

  it('reports operations bound to unknown controller', async () => {
    const app = givenAnApplication();
    const server = await givenAServer(app);
    const spec = anOpenApiSpec()
      .withOperation(
        'get',
        '/greet',
        anOperationSpec()
          .withOperationName('greet')
          .withExtension('x-controller-name', 'UnknownController'),
      )
      .build();

    server.api(spec);

    return server.start().then(
      ok => {
        throw new Error('server.start() should have failed');
      },
      err => expect(err.message).to.match(/UnknownController/),
    );
  });

  it('reports operations with no handler', async () => {
    const app = givenAnApplication();
    const server = await givenAServer(app);
    const spec = anOpenApiSpec()
      .withOperationReturningString('get', '/greet')
      .build();

    server.api(spec);

    return server.start().then(
      ok => {
        throw new Error('server.start() should have failed');
      },
      err => expect(err.message).to.match(/no handler/),
    );
  });

  it('supports controller routes defined via server.route()', async () => {
    const app = givenAnApplication();
    const server = await givenAServer(app);

    class MyController {
      greet(name: string) {
        return `hello ${name}`;
      }
    }

    const spec = anOperationSpec()
      .withParameter({name: 'name', in: 'query', type: 'string'})
      .build();

    server.route('get', '/greet', spec, MyController, 'greet');

    const client = whenIMakeRequestTo(server);
    await client.get('/greet?name=world').expect(200, 'hello world');
  });

  describe('RestApplication', () => {
    it('supports function-based routes declared via app.route()', async () => {
      const app = new RestApplication();

      const routeSpec = <OperationObject>{
        parameters: [
          <ParameterObject>{name: 'name', in: 'query', type: 'string'},
        ],
        responses: {
          200: <ResponseObject>{
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

      const server = await givenAServer(app);
      const client = whenIMakeRequestTo(server);
      await client.get('/greet?name=world').expect(200, 'hello world');
    });

    it('supports controller routes declared via app.api()', async () => {
      const app = new RestApplication();

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
            .withExtension('x-controller-name', 'MyController'),
        )
        .build();

      app.api(spec);
      app.controller(MyController);

      const server = await givenAServer(app);
      const client = whenIMakeRequestTo(server);
      await client.get('/greet?name=world').expect(200, 'hello world');
    });

    it('supports controller routes defined via app.route()', async () => {
      const app = new RestApplication();

      class MyController {
        greet(name: string) {
          return `hello ${name}`;
        }
      }

      const spec = anOperationSpec()
        .withParameter({name: 'name', in: 'query', type: 'string'})
        .build();

      app.route('get', '/greet', spec, MyController, 'greet');

      const server = await givenAServer(app);
      const client = whenIMakeRequestTo(server);
      await client.get('/greet?name=world').expect(200, 'hello world');
    });
  });

  /* ===== HELPERS ===== */

  function givenAnApplication() {
    const app = new Application();
    app.component(RestComponent);
    return app;
  }
  async function givenAServer(app: Application) {
    return await app.getServer(RestServer);
  }

  function givenControllerInApp(app: Application, controller: ControllerClass) {
    app.controller(controller);
  }

  function whenIMakeRequestTo(server: RestServer): Client {
    return createClientForHandler(server.handleHttp);
  }
});
