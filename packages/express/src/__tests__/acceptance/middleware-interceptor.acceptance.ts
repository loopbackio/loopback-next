// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/express
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  config,
  Constructor,
  Context,
  ContextView,
  createBindingFromClass,
  Interceptor,
  Provider,
} from '@loopback/context';
import {InterceptorOrKey} from '@loopback/core';
import {expect} from '@loopback/testlab';
import {
  createInterceptor,
  createMiddlewareInterceptorBinding,
  defineInterceptorProvider,
  ExpressMiddlewareInterceptorProvider,
  registerExpressMiddlewareInterceptor,
  toInterceptor,
} from '../..';
import {ExpressMiddlewareFactory} from '../../types';
import {SpyAction} from '../fixtures/spy-config';
import {spy, SpyConfig, TestFunction, TestHelper} from './test-helpers';

describe('Middleware interceptor', () => {
  let helper: TestHelper;

  context('helpers', () => {
    let spyConfig: SpyConfig;
    before(() => {
      spyConfig = {
        action: 'log',
      };
      helper = new TestHelper();
    });
    before(givenTestApp);
    after(() => helper?.stop());

    it('wraps a middleware handler to interceptor', async () => {
      const fn = spy(spyConfig);
      const interceptor = toInterceptor(fn);
      await testLocalSpyLog(interceptor);
    });

    it('wraps multiple middleware handlers to interceptor', async () => {
      const log = spy({action: 'log'});
      const mock = spy({action: 'mock'});

      // Chain two Express middleware into one interceptor
      const interceptor = toInterceptor(log, mock);
      helper.bindController(interceptor);

      await helper.client
        .post('/hello')
        .send('"World"')
        .set('content-type', 'application/json')
        .expect(200, 'Hello, Spy')
        .expect('x-spy-log', 'POST /hello')
        .expect('x-spy-mock', 'POST /hello');
    });

    it('wraps a middleware factory to interceptor', async () => {
      const interceptor = createInterceptor(spy, spyConfig);
      await testLocalSpyLog(interceptor);
    });
  });

  context('defineInterceptorProvider', () => {
    it('defines a middleware interceptor provider class by factory', () => {
      const cls = defineInterceptorProvider(spy);
      expect(cls.name).to.eql('spyMiddlewareFactory');
      assertProviderClass(cls);
    });

    it('defines a middleware interceptor provider class with name', () => {
      const cls = defineInterceptorProvider(spy, undefined, {
        providerClassName: 'SpyMiddlewareInterceptorProvider',
      });
      expect(cls.name).to.eql('SpyMiddlewareInterceptorProvider');
      assertProviderClass(cls);
    });

    function assertProviderClass(cls: Constructor<Provider<Interceptor>>) {
      const ctx = new Context();
      const binding = createBindingFromClass(cls);
      ctx.add(binding);
      const corsFn = ctx.getSync(binding.key);
      expect(corsFn).to.be.a.Function();
    }
  });

  context('defineInterceptorProvider with watch', () => {
    let spyConfig: SpyConfig;
    before(() => {
      spyConfig = {
        action: 'log',
      };
      helper = new TestHelper();
    });
    before(givenTestApp);
    after(() => helper?.stop());

    it('reloads config changes', async () => {
      const providerClass = defineInterceptorProvider(spy, spyConfig, {
        injectConfiguration: 'watch',
      });
      const binding = createMiddlewareInterceptorBinding(providerClass);
      helper.app.add(binding);
      await testLocalSpyLog(binding.key);

      helper.app.configure(binding.key).to({action: 'mock'});
      await testLocalSpyMock(binding.key);
    });
  });

  function runTests(action: SpyAction, testFn: TestFunction) {
    describe(`registerMiddleware - ${action}`, () => {
      const spyConfig: SpyConfig = {action};
      beforeEach(givenTestApp);
      beforeEach(() => helper.bindController());
      afterEach(() => helper?.stop());

      it('registers a middleware interceptor provider class by factory', () => {
        const binding = registerExpressMiddlewareInterceptor(
          helper.app,
          spy,
          spyConfig,
          {
            global: true,
          },
        );
        return testFn(binding);
      });

      it('registers a middleware interceptor as handler function', () => {
        const binding = registerExpressMiddlewareInterceptor(
          helper.app,
          spy,
          spyConfig,
          {
            global: true,
            injectConfiguration: false,
            key: 'globalInterceptors.middleware.spy',
          },
        );
        expect(binding.key).to.eql('globalInterceptors.middleware.spy');
        return testFn(binding);
      });

      it('registers a middleware interceptor as handler function with name', () => {
        const namedSpyFactory: ExpressMiddlewareFactory<SpyConfig> = cfg =>
          spy(cfg);
        const binding = registerExpressMiddlewareInterceptor(
          helper.app,
          namedSpyFactory,
          spyConfig,
          {
            global: true,
            injectConfiguration: false,
          },
        );
        expect(binding.key).to.eql(
          'globalInterceptors.middleware.namedSpyFactory',
        );
        return testFn(binding);
      });

      it('registers a middleware interceptor as handler function without key', () => {
        const binding = registerExpressMiddlewareInterceptor(
          helper.app,
          spy,
          spyConfig,
          {
            global: true,
            injectConfiguration: false,
          },
        );
        expect(binding.key).to.match(/^globalInterceptors\.middleware\./);
        return testFn(binding);
      });

      it('registers a middleware interceptor provider class', () => {
        class SpyInterceptorProvider extends ExpressMiddlewareInterceptorProvider<
          SpyConfig
        > {
          constructor(@config.view() configView?: ContextView<SpyConfig>) {
            super(spy, configView);
          }
        }
        const binding = createMiddlewareInterceptorBinding(
          SpyInterceptorProvider,
        );
        expect(binding.key).to.eql(
          'globalInterceptors.middleware.SpyInterceptorProvider',
        );
        helper.app.add(binding);
        return testFn(binding);
      });
    });
  }

  runTests('log', binding => helper.testSpyLog(binding));
  runTests('mock', binding => helper.testSpyMock(binding));
  runTests('reject', binding => helper.testSpyReject(binding));

  function givenTestApp() {
    helper = new TestHelper();
    return helper.start();
  }

  async function testLocalSpyLog(interceptor: InterceptorOrKey) {
    helper.bindController(interceptor);

    await helper.assertSpyLog();
  }

  async function testLocalSpyMock(interceptor: InterceptorOrKey) {
    helper.bindController(interceptor);

    await helper.assertSpyMock();
  }
});
