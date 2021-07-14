// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Application,
  BindingScope,
  Constructor,
  Context,
  CoreBindings,
  inject,
} from '@loopback/core';
import {anOpenApiSpec, anOperationSpec} from '@loopback/openapi-spec-builder';
import {
  api,
  get,
  OperationObject,
  param,
  ParameterObject,
  post,
  requestBody,
  ResponseObject,
} from '@loopback/openapi-v3';
import {
  Client,
  createClientForHandler,
  createUnexpectedHttpErrorLogger,
  expect,
} from '@loopback/testlab';
import {
  ControllerClass,
  ControllerInstance,
  createControllerFactoryForClass,
  createControllerFactoryForInstance,
  HttpServerLike,
  RegExpRouter,
  Request,
  Response,
  RestApplication,
  RestBindings,
  RestComponent,
  RestServer,
  SequenceActions,
} from '../../..';

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
      greet(@param.query.string('name') name: string) {
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

  it('allows controllers to define requestBody via decorator', async () => {
    class MyController {
      @post('/greet')
      greet(@requestBody() message: object) {
        return message;
      }
    }
    const app = givenAnApplication();
    const server = await givenAServer(app);
    givenControllerInApp(app, MyController);
    const greeting = {greeting: 'hello world'};
    return whenIMakeRequestTo(server)
      .post('/greet')
      .send(greeting)
      .expect(greeting);
  });

  it('allows mixed use of @requestBody and @param', async () => {
    class MyController {
      @post('/greet')
      greet(
        @param.header.string('language') language: string,
        @requestBody() message: object,
      ) {
        return Object.assign(message, {language: language});
      }
    }
    const app = givenAnApplication();
    const server = await givenAServer(app);
    givenControllerInApp(app, MyController);

    return whenIMakeRequestTo(server)
      .post('/greet')
      .set('language', 'English')
      .send({greeting: 'hello world'})
      .expect({greeting: 'hello world', language: 'English'});
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
    suppressErrorLogsForExpectedHttpError(app, 500);

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
        anOperationSpec().withOperationName('getName').withStringResponse(),
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

    return whenIMakeRequestTo(server).get('/name').expect('TestApp');
  });

  it('creates a new child context for each request', async () => {
    const app = givenAnApplication();
    const server = await givenAServer(app);
    server.bind('flag').to('original');

    // create a special binding returning the current context instance
    server.bind('context').getValue = (ctx: Context) => ctx;

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
    await whenIMakeRequestTo(server).get('/flag').expect('original');
  });

  it('binds request and response objects', async () => {
    const app = givenAnApplication();
    const server = await givenAServer(app);

    const spec = anOpenApiSpec()
      .withOperationReturningString('get', '/status', 'getStatus')
      .withOperationReturningString('get', '/header', 'getHeader')
      .build();

    @api(spec)
    class StatusController {
      constructor(
        @inject(RestBindings.Http.REQUEST) private request: Request,
        @inject(RestBindings.Http.RESPONSE) private response: Response,
      ) {}

      async getStatus(): Promise<string> {
        this.response.statusCode = 202; // 202 Accepted
        return this.request.method as string;
      }

      async getHeader(): Promise<string> {
        this.response.status(202);
        this.response.set('x-custom-res-header', 'xyz');
        return this.request.method as string;
      }
    }
    givenControllerInApp(app, StatusController);

    await whenIMakeRequestTo(server).get('/status').expect(202, 'GET');
    await whenIMakeRequestTo(server)
      .get('/header')
      .expect(202)
      .expect('x-custom-res-header', 'xyz');
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
        @inject(CoreBindings.CONTROLLER_CLASS) private ctor: Function,
        @inject(CoreBindings.CONTROLLER_METHOD_NAME) private operation: string,
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

    return whenIMakeRequestTo(server).get('/name').expect({
      ctor: 'GetCurrentController',
      operation: 'getControllerName',
    });
  });

  describe('current controller', () => {
    let app: Application;
    let server: RestServer;
    let controllerClass: Constructor<ControllerInstance>;

    beforeEach(setupApplicationAndServer);
    beforeEach(setupController);

    it('binds current controller resolved from a transient binding', async () => {
      givenControllerInApp(app, controllerClass);

      await whenIMakeRequestTo(server).get('/name').expect({
        count: 1,
        isSingleton: false,
        result: true,
      });

      // Make a second call
      await whenIMakeRequestTo(server).get('/name').expect({
        count: 1, // The count is still 1 as it's from a new instance
        isSingleton: false,
        result: true,
      });
    });

    it('binds current controller resolved from a singleton binding', async () => {
      app.controller(controllerClass).inScope(BindingScope.SINGLETON);

      await whenIMakeRequestTo(server).get('/name').expect({
        count: 1,
        isSingleton: true,
        result: true,
      });

      // Make a second call
      await whenIMakeRequestTo(server).get('/name').expect({
        count: 2, // The count increases as the controller is singleton
        isSingleton: true,
        result: true,
      });
    });

    async function setupApplicationAndServer() {
      app = givenAnApplication();
      server = await givenAServer(app);
    }

    async function setupController() {
      const spec = anOpenApiSpec()
        .withOperationReturningString('get', '/name', 'checkController')
        .build();

      @api(spec)
      class GetCurrentController {
        private count = 0;
        async checkController(
          @inject('controllers.GetCurrentController')
          inst: GetCurrentController,
          @inject(CoreBindings.CONTROLLER_CURRENT)
          currentInst: GetCurrentController,
        ): Promise<object> {
          return {
            count: ++this.count,
            isSingleton: this === inst,
            result: this === currentInst,
          };
        }
      }
      controllerClass = GetCurrentController;
    }
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

    server.route('get', '/greet', routeSpec, greet);

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
    spec.paths = {};
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

    @api({basePath: '/my'})
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

    server.route(
      'get',
      '/greet',
      spec,
      MyController,
      createControllerFactoryForClass(MyController),
      'greet',
    );

    const client = whenIMakeRequestTo(server);
    await client.get('/greet?name=world').expect(200, 'hello world');
  });

  it('supports controller routes with factory defined via server.route()', async () => {
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

    const factory = createControllerFactoryForClass(MyController);
    server.route('get', '/greet', spec, MyController, factory, 'greet');

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

      app.route('get', '/greet', routeSpec, greet);

      await whenIMakeRequestTo(app)
        .get('/greet?name=world')
        .expect(200, 'hello world');
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

      await whenIMakeRequestTo(app)
        .get('/greet?name=world')
        .expect(200, 'hello world');
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

      const factory = createControllerFactoryForClass(MyController);
      app.route('get', '/greet', spec, MyController, factory, 'greet');

      await whenIMakeRequestTo(app)
        .get('/greet?name=world')
        .expect(200, 'hello world');
    });

    it('supports controller routes via app.route() with a factory', async () => {
      const app = new RestApplication();

      class MyController {
        greet(name: string) {
          return `hello ${name}`;
        }
      }

      class MySubController extends MyController {
        greet(name: string) {
          return super.greet(name) + '!';
        }
      }

      const spec = anOperationSpec()
        .withParameter({name: 'name', in: 'query', type: 'string'})
        .build();

      const factory = createControllerFactoryForInstance(new MySubController());
      app.route('get', '/greet', spec, MyController, factory, 'greet');

      await whenIMakeRequestTo(app)
        .get('/greet?name=world')
        .expect(200, 'hello world!');
    });

    it('provides httpHandler compatible with HTTP server API', async () => {
      const app = new RestApplication();
      app.handler(({response}, sequence) => response.end('hello'));

      await createClientForHandler(app.requestHandler)
        .get('/')
        .expect(200, 'hello');
    });

    it('allows pluggable router', async () => {
      const app = new RestApplication();
      app.bind(RestBindings.ROUTER).toClass(RegExpRouter);
      const server = await app.getServer(RestServer);
      const handler = await server.get(RestBindings.HANDLER);
      // Use a hack to verify the bound router is used by the handler
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((handler as any)._routes._router).to.be.instanceof(RegExpRouter);
    });

    it('matches routes based on their specifics', async () => {
      const app = new RestApplication();

      app.route(
        'get',
        '/greet/{name}',
        anOperationSpec()
          .withParameter({name: 'name', in: 'path', type: 'string'})
          .build(),
        (name: string) => `hello ${name}`,
      );

      app.route(
        'get',
        '/greet/world',
        anOperationSpec().build(),
        () => 'HELLO WORLD',
      );

      await whenIMakeRequestTo(app)
        .get('/greet/john')
        .expect(200, 'hello john');
      await whenIMakeRequestTo(app)
        .get('/greet/world')
        .expect(200, 'HELLO WORLD');
    });

    it('gives precedence to redirect routes over controller methods', async () => {
      class MyController {
        @get('/hello', {
          responses: {},
        })
        hello(): string {
          return 'hello';
        }
        @get('/hello/world')
        helloWorld() {
          return `hello world`;
        }
      }
      const app = givenAnApplication();
      const server = await givenAServer(app);
      server.basePath('/api');
      server.redirect('/test/hello', '/hello/world');
      givenControllerInApp(app, MyController);
      const response = await whenIMakeRequestTo(server)
        .get('/api/test/hello')
        .expect(303);
      // new request to verify the redirect target
      await whenIMakeRequestTo(server)
        .get(response.header.location)
        .expect(200, 'hello world');
    });

    it('gives precedence to redirect routes over route methods', async () => {
      const app = new RestApplication();
      app.route(
        'get',
        '/greet/{name}',
        anOperationSpec()
          .withParameter({name: 'name', in: 'path', type: 'string'})
          .build(),
        (name: string) => `hello ${name}`,
      );
      app.redirect('/hello/john', '/greet/john');
      const response = await whenIMakeRequestTo(app)
        .get('/hello/john')
        .expect(303);
      // new request to verify the redirect target
      await whenIMakeRequestTo(app)
        .get(response.header.location)
        .expect(200, 'hello john');
    });
  });

  /* ===== HELPERS ===== */

  function givenAnApplication() {
    const app = new Application();
    app.component(RestComponent);
    return app;
  }

  function suppressErrorLogsForExpectedHttpError(
    app: Application,
    skipStatusCode: number,
  ) {
    app
      .bind(SequenceActions.LOG_ERROR)
      .to(createUnexpectedHttpErrorLogger(skipStatusCode));
  }

  async function givenAServer(app: Application) {
    return app.getServer(RestServer);
  }

  function givenControllerInApp(
    app: Application,
    controller: ControllerClass<ControllerInstance>,
  ) {
    return app.controller(controller);
  }

  function whenIMakeRequestTo(serverOrApp: HttpServerLike): Client {
    return createClientForHandler(serverOrApp.requestHandler);
  }
});
