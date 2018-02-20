// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {anOperationSpec} from '@loopback/openapi-spec-builder';
import {Binding, Context} from '@loopback/context';
import {Application} from '@loopback/core';
import {
  RestServer,
  BindElement,
  GetFromContext,
  Route,
  InvokeMethod,
  RestBindings,
  RestComponent,
} from '../../..';

describe('RestServer', () => {
  describe('"bindElement" binding', () => {
    it('returns a function for creating new bindings', async () => {
      const ctx = await givenRequestContext();
      const bindElement = await ctx.get<BindElement>(RestBindings.BIND_ELEMENT);
      const binding = bindElement('foo').to('bar');
      expect(binding).to.be.instanceOf(Binding);
      expect(ctx.getSync('foo')).to.equal('bar');
    });
  });

  describe('"getFromContext" binding', () => {
    it('returns a function for getting a value from the context', async () => {
      const ctx = await givenRequestContext();
      const getFromContext = await ctx.get<GetFromContext>(
        RestBindings.GET_FROM_CONTEXT,
      );
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
      const invokeMethod = await ctx.get<InvokeMethod>(
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
      const host = await server.getSync(RestBindings.HOST);
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
