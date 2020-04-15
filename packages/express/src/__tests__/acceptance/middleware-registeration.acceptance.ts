// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/express
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {config, Provider} from '@loopback/core';
import {Client, expect} from '@loopback/testlab';
import {ExpressServer, Middleware} from '../../';
import {SpyAction} from '../fixtures/spy-config';
import {spy, SpyConfig, TestFunction, TestHelper} from './test-helpers';

describe('Express middleware registry', () => {
  let helper: TestHelper;
  let server: ExpressServer;
  let client: Client;

  beforeEach(givenTestApp);
  afterEach(() => helper?.stop());

  function runTests(action: SpyAction, testFn: TestFunction) {
    describe(`app.expressMiddleware - ${action}`, () => {
      const spyConfig: SpyConfig = {action};

      it('registers a middleware interceptor provider class by factory', () => {
        const binding = server.expressMiddleware(spy, spyConfig);
        return testFn(binding);
      });

      it('registers a middleware interceptor as handler function', () => {
        const binding = server.expressMiddleware(spy, spyConfig, {
          injectConfiguration: false,
          key: 'interceptors.middleware.spy',
        });
        expect(binding.key).to.eql('interceptors.middleware.spy');
        return testFn(binding);
      });

      it('registers a middleware interceptor as handler function without a key', () => {
        const binding = server.expressMiddleware(spy, spyConfig, {
          injectConfiguration: false,
        });
        expect(binding.key).to.match(/^middleware\./);
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
      server.middleware(spyMiddleware, {
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
      server.middleware(SpyMiddlewareProvider, {
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
      const binding = server.middleware(SpyMiddlewareProviderWithConfig, {
        key: 'middleware.spy',
      });
      server.configure(binding.key).to({headerName: 'x-spy'});
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
    server = helper.app.expressServer;
    client = helper.client;
  }
});
