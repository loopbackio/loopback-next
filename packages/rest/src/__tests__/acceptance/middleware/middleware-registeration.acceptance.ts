// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Component, config, Provider} from '@loopback/core';
import {
  createMiddlewareBinding,
  defineInterceptorProvider,
  Middleware,
} from '@loopback/express';
import {SpyAction} from '@loopback/express/src/__tests__/fixtures/spy-config';
import {Client, expect} from '@loopback/testlab';
import {RestApplication} from '../../..';
import {spy, SpyConfig, TestFunction, TestHelper} from './test-helpers';

describe('Express middleware registry', () => {
  let helper: TestHelper;
  let app: RestApplication;
  let client: Client;

  beforeEach(givenTestApp);
  afterEach(() => helper?.stop());

  function runTests(action: SpyAction, testFn: TestFunction) {
    describe(`app.expressMiddleware - ${action}`, () => {
      const spyConfig: SpyConfig = {action};

      it('registers an Express middleware interceptor provider class by factory', () => {
        const binding = app.expressMiddleware(spy, spyConfig);
        return testFn(binding);
      });

      it('registers an Express middleware by component', () => {
        const binding = createMiddlewareBinding(defineInterceptorProvider(spy));
        class MyComponent implements Component {
          bindings = [binding];
        }
        app.component(MyComponent);
        return testFn(binding);
      });

      it('registers an Express middleware interceptor as handler function', () => {
        const binding = app.expressMiddleware(spy, spyConfig, {
          injectConfiguration: false,
          key: 'interceptors.middleware.spy',
        });
        expect(binding.key).to.eql('interceptors.middleware.spy');
        return testFn(binding);
      });
    });
  }

  runTests('log', binding => helper.testSpyLog(binding));
  runTests('mock', binding => helper.testSpyMock(binding));
  runTests('reject', binding => helper.testSpyReject(binding));

  describe('LoopBack middleware registry', () => {
    const spyMiddleware: Middleware = async (middlewareCtx, next) => {
      const {request, response} = middlewareCtx;
      response.set('x-spy-log-req', `${request.method} ${request.path}`);
      await next();
      response.set('x-spy-log-res', `${request.method} ${request.path}`);
    };

    it('registers a LoopBack middleware handler', async () => {
      app.middleware(spyMiddleware, {
        key: 'middleware.spy',
      });
      await testSpyLog();
    });

    it('registers a LoopBack middleware provider', async () => {
      class SpyMiddlewareProvider implements Provider<Middleware> {
        value() {
          return spyMiddleware;
        }
      }
      app.middleware(SpyMiddlewareProvider, {
        key: 'middleware.spy',
      });
      await testSpyLog();
    });

    it('registers a LoopBack middleware provider with config injection', async () => {
      type SpyConfig = {headerName: string};
      class SpyMiddlewareProviderWithConfig implements Provider<Middleware> {
        @config()
        private options: SpyConfig;
        value(): Middleware {
          return async ({request, response}, next) => {
            response.set(
              `${this.options.headerName}-req`,
              `${request.method} ${request.path}`,
            );
            await next();
            response.set(
              `${this.options.headerName}-res`,
              `${request.method} ${request.path}`,
            );
          };
        }
      }
      const binding = app.middleware(SpyMiddlewareProviderWithConfig, {
        key: 'middleware.spy',
      });
      app.configure(binding.key).to({headerName: 'x-spy'});
      await client
        .post('/hello')
        .send('"World"')
        .set('content-type', 'application/json')
        .expect(200, 'Hello, World')
        .expect('x-spy-req', 'POST /hello')
        .expect('x-spy-res', 'POST /hello');
    });

    async function testSpyLog() {
      await client
        .post('/hello')
        .send('"World"')
        .set('content-type', 'application/json')
        .expect(200, 'Hello, World')
        .expect('x-spy-log-req', 'POST /hello')
        .expect('x-spy-log-res', 'POST /hello');
    }
  });

  async function givenTestApp() {
    helper = new TestHelper();
    helper.bindController();
    await helper.start();
    app = helper.app;
    client = helper.client;
  }
});
