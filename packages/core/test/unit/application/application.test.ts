// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect, ShotRequest} from '@loopback/testlab';
import {anOperationSpec} from '@loopback/openapi-spec-builder';
import {Binding, Context} from '@loopback/context';
import {
  Application,
  ServerRequest,
  BindElement,
  GetFromContext,
  Route,
  InvokeMethod,
  CoreBindings,
} from '../../..';

const SequenceActions = CoreBindings.SequenceActions;

describe('Application', () => {
  describe('"logError" binding', () => {
    it('provides a default', async () => {
      const app = new Application();
      const logError = await app.get(SequenceActions.LOG_ERROR);
      expect(logError.length).to.equal(3); // (err, statusCode, request)
    });

    // tslint:disable-next-line:max-line-length
    it('can be customized by overriding Application._logError() method', async () => {
      let lastLog: string = 'logError() was not called';

      class MyApp extends Application {
        protected _logError(
          err: Error,
          statusCode: number,
          request: ServerRequest,
        ) {
          lastLog = `${request.url} ${statusCode} ${err.message}`;
        }
      }

      const app = new MyApp();
      const logError = await app.get(SequenceActions.LOG_ERROR);
      logError(new Error('test-error'), 400, new ShotRequest({url: '/'}));

      expect(lastLog).to.equal('/ 400 test-error');
    });
  });

  describe('"bindElement" binding', () => {
    it('returns a function for creating new bindings', async () => {
      const ctx = givenRequestContext();
      const bindElement: BindElement = await ctx.get(CoreBindings.BIND_ELEMENT);
      const binding = bindElement('foo').to('bar');
      expect(binding).to.be.instanceOf(Binding);
      expect(ctx.getSync('foo')).to.equal('bar');
    });
  });

  describe('"getFromContext" binding', () => {
    it('returns a function for getting a value from the context', async () => {
      const ctx = givenRequestContext();
      const getFromContext: GetFromContext = await ctx.get(
        CoreBindings.GET_FROM_CONTEXT,
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

      const ctx = givenRequestContext();
      const invokeMethod: InvokeMethod = await ctx.get(
        CoreBindings.SequenceActions.INVOKE_METHOD,
      );

      const result = await invokeMethod(route, []);
      expect(result).to.equal('Hello world');
    });
  });

  describe('configuration', () => {
    it('uses http port 3000 by default', () => {
      const app = new Application();
      expect(app.getSync(CoreBindings.HTTP_PORT)).to.equal(3000);
    });

    it('can set port 0', () => {
      const app = new Application({http: {port: 0}});
      expect(app.getSync(CoreBindings.HTTP_PORT)).to.equal(0);
    });
  });

  function givenRequestContext(rootContext: Context = new Application()) {
    const requestContext = new Context(rootContext);
    requestContext.bind(CoreBindings.Http.CONTEXT).to(requestContext);
    return requestContext;
  }
});
