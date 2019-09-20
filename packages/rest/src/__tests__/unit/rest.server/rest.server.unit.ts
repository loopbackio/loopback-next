// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Binding, Context} from '@loopback/context';
import {Application} from '@loopback/core';
import {anOperationSpec} from '@loopback/openapi-spec-builder';
import {expect} from '@loopback/testlab';
import {
  RequestBodyParserOptions,
  RestBindings,
  RestComponent,
  RestServer,
  RestServerConfig,
  Route,
} from '../../..';

describe('RestServer', () => {
  describe('"bindElement" binding', () => {
    it('returns a function for creating new bindings', async () => {
      const ctx = await givenRequestContext();
      const bindElement = await ctx.get(RestBindings.BIND_ELEMENT);
      const binding = bindElement('foo').to('bar');
      expect(binding).to.be.instanceOf(Binding);
      expect(ctx.getSync('foo')).to.equal('bar');
    });
  });

  describe('"getFromContext" binding', () => {
    it('returns a function for getting a value from the context', async () => {
      const ctx = await givenRequestContext();
      const getFromContext = await ctx.get(RestBindings.GET_FROM_CONTEXT);
      ctx.bind('foo').to('bar');
      expect(await getFromContext('foo')).to.equal('bar');
    });
  });

  describe('"invokeMethod" binding', () => {
    it('returns a function for invoking a route handler', async () => {
      function greet() {
        return 'Hello world';
      }

      const route = new Route(
        'get',
        '/greet',
        anOperationSpec().build(),
        greet,
      );

      const ctx = await givenRequestContext();
      const invokeMethod = await ctx.get(
        RestBindings.SequenceActions.INVOKE_METHOD,
      );

      const result = await invokeMethod(route, []);
      expect(result).to.equal('Hello world');
    });
  });

  describe('configuration', () => {
    it('uses http port 3000 by default', async () => {
      const app = new Application();
      app.component(RestComponent);
      const server = await app.getServer(RestServer);
      expect(server.getSync(RestBindings.PORT)).to.equal(3000);
    });

    it('uses undefined http host by default', async () => {
      const app = new Application();
      app.component(RestComponent);
      const server = await app.getServer(RestServer);
      const host = await server.get(RestBindings.HOST);
      expect(host).to.be.undefined();
    });

    it('can set port 0', async () => {
      const app = new Application({
        rest: {port: 0},
      });
      app.component(RestComponent);
      const server = await app.getServer(RestServer);
      expect(server.getSync(RestBindings.PORT)).to.equal(0);
    });

    it('honors host/port', async () => {
      const app = new Application({
        rest: {port: 4000, host: 'my-host'},
      });
      app.component(RestComponent);
      const server = await app.getServer(RestServer);
      expect(server.getSync(RestBindings.PORT)).to.equal(4000);
      expect(server.getSync(RestBindings.HOST)).to.equal('my-host');
    });

    it('honors unix socket path', async () => {
      const path = '/var/run/loopback.sock';
      const app = new Application({
        rest: {path},
      });
      app.component(RestComponent);
      const server = await app.getServer(RestServer);
      expect(server.getSync(RestBindings.PATH)).to.equal(path);
    });

    it('honors named pipe path', async () => {
      const path = '\\\\.\\pipe\\loopback';
      const app = new Application({
        rest: {path},
      });
      app.component(RestComponent);
      const server = await app.getServer(RestServer);
      expect(server.getSync(RestBindings.PATH)).to.equal(path);
    });

    it('honors basePath in config', async () => {
      const app = new Application({
        rest: {port: 0, basePath: '/api'},
      });
      app.component(RestComponent);
      const server = await app.getServer(RestServer);
      expect(server.getSync(RestBindings.BASE_PATH)).to.equal('/api');
    });

    it('honors basePath via api', async () => {
      const app = new Application({
        rest: {port: 0},
      });
      app.component(RestComponent);
      const server = await app.getServer(RestServer);
      server.basePath('/api');
      expect(server.getSync(RestBindings.BASE_PATH)).to.equal('/api');
    });

    it('rejects basePath if request handler is created', async () => {
      const app = new Application({
        rest: {port: 0},
      });
      app.component(RestComponent);
      const server = await app.getServer(RestServer);
      expect(() => {
        // Force the `getter` function to be triggered by referencing
        // `server.requestHandler` so that the servers has `requestHandler`
        // populated to prevent `basePath` to be set.
        if (server.requestHandler) {
          server.basePath('/api');
        }
      }).to.throw(
        /Base path cannot be set as the request handler has been created/,
      );
    });

    it('honors requestBodyParser options in config', async () => {
      const parserOptions: RequestBodyParserOptions = {json: {limit: '1mb'}};
      const app = new Application({
        rest: {requestBodyParser: parserOptions},
      });
      app.component(RestComponent);
      const server = await app.getServer(RestServer);
      expect(server.getSync(RestBindings.REQUEST_BODY_PARSER_OPTIONS)).to.equal(
        parserOptions,
      );
    });

    describe('express settings', () => {
      class TestRestServer extends RestServer {
        constructor(application: Application, config: RestServerConfig) {
          super(application, config);
          this._setupRequestHandlerIfNeeded();
        }

        get expressApp() {
          return this._expressApp;
        }
      }

      it('honors expressSettings', () => {
        const app = new Application();
        const server = new TestRestServer(app, {
          expressSettings: {
            'x-powered-by': false,
            env: 'production',
          },
        });
        const expressApp = server.expressApp;
        expect(expressApp.get('x-powered-by')).to.equal(false);
        expect(expressApp.get('env')).to.equal('production');
        // `extended` is the default setting by Express
        expect(expressApp.get('query parser')).to.equal('extended');
        expect(expressApp.get('not set')).to.equal(undefined);
      });

      it('honors strict', () => {
        const app = new Application();
        const server = new TestRestServer(app, {
          router: {
            strict: true,
          },
        });
        const expressApp = server.expressApp;
        expect(expressApp.get('strict routing')).to.equal(true);
      });
    });
  });

  async function givenRequestContext() {
    const app = new Application();
    app.component(RestComponent);
    const server = await app.getServer(RestServer);
    const requestContext = new Context(server);
    requestContext.bind(RestBindings.Http.CONTEXT).to(requestContext);
    return requestContext;
  }
});
