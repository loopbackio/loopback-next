// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Application,
  BindingScope,
  Constructor,
  CoreTags,
  inject,
} from '@loopback/core';
import {
  InvokeMiddleware,
  InvokeMiddlewareProvider,
  MiddlewareView,
} from '@loopback/express';
import {createUnexpectedHttpErrorLogger, expect} from '@loopback/testlab';
import {once} from 'events';
import {
  DefaultSequence,
  MiddlewareSequence,
  RequestContext,
  RestMiddlewareGroups,
  RestTags,
  SequenceActions,
} from '../../../';
import {SpyAction, SpyConfig} from '../../fixtures/middleware/spy-config';
import {spy, TestHelper} from './test-helpers';

const POST_INVOCATION_MIDDLEWARE = 'middleware.postInvocation';
describe('Middleware in sequence', () => {
  let helper: TestHelper;

  beforeEach(givenTestApp);
  afterEach(() => helper?.stop());

  it('registers a middleware in default slot', () => {
    const binding = helper.app.expressMiddleware(spy, undefined, {
      chain: RestTags.ACTION_MIDDLEWARE_CHAIN,
    });
    return helper.testSpyLog(binding);
  });

  it('registers a middleware in postInvoke slot', () => {
    const binding = helper.app.expressMiddleware(spy, undefined, {
      chain: POST_INVOCATION_MIDDLEWARE,
    });
    return helper.testSpyLog(binding);
  });

  it('registers a middleware in both slots', async () => {
    const firstSpy = helper.app.expressMiddleware(spy, undefined, {
      key: 'middleware.firstSpy',
    });
    const secondSpy = helper.app
      .expressMiddleware(spy, undefined, {
        key: 'middleware.secondSpy',
        chain: POST_INVOCATION_MIDDLEWARE,
      })
      // Set the scope to be `TRANSIENT` so that the new config can be loaded
      .inScope(BindingScope.TRANSIENT);
    await helper.testSpyLog(firstSpy);
    await helper.testSpyReject(secondSpy);
  });

  it('registers a middleware in default slot with sequence 2', () => {
    helper.app.sequence(SequenceWithTwoInvokeMiddleware);
    const binding = helper.app.expressMiddleware(spy, undefined, {
      chain: RestTags.ACTION_MIDDLEWARE_CHAIN,
    });
    return helper.testSpyLog(binding);
  });

  it('allows a middleware to be unregistered', async () => {
    helper.app.sequence(MiddlewareSequence);
    const binding = helper.app.expressMiddleware(spy, undefined, {
      chain: RestTags.REST_MIDDLEWARE_CHAIN,
    });
    await helper.testSpyLog(binding);
    const view = new MiddlewareView(helper.app.restServer, {
      chain: RestTags.REST_MIDDLEWARE_CHAIN,
    });
    helper.app.restServer.unbind(binding.key);

    // Wait until the `unbind` is processed
    await once(view, 'refresh');
    const res = await helper.client
      .post('/hello')
      .send('"World"')
      .set('content-type', 'application/json')
      .expect(200, 'Hello, World');
    expect(res.get('x-spy-log')).to.be.undefined();
  });

  it('reports an error for unreachable middleware groups', async () => {
    suppressErrorLogsForExpectedHttpError(helper.app, 500);
    helper.app.sequence(MiddlewareSequence);
    const binding = helper.app.expressMiddleware(spy, undefined, {
      chain: RestTags.REST_MIDDLEWARE_CHAIN,
      group: 'log',
      upstreamGroups: [RestMiddlewareGroups.INVOKE_METHOD],
    });
    helper.app.restServer.configure<SpyConfig>(binding.key).to({action: 'log'});
    await helper.client
      .post('/hello')
      .send('"World"')
      .set('content-type', 'application/json')
      .expect(500);
  });

  function givenTestApp() {
    helper = new TestHelper();
    // Create another middleware phase
    helper.app
      .bind('middleware.postInvoke')
      .toDynamicValue(InvokeMiddlewareProvider)
      // Configure a different extension point name
      .tag({[CoreTags.EXTENSION_POINT]: POST_INVOCATION_MIDDLEWARE});
    helper.app.sequence(SequenceWithOneInvokeMiddleware);
    helper.bindController();
    return helper.start();
  }

  function suppressErrorLogsForExpectedHttpError(
    app: Application,
    skipStatusCode: number,
  ) {
    app
      .bind(SequenceActions.LOG_ERROR)
      .to(createUnexpectedHttpErrorLogger(skipStatusCode));
  }

  /**
   * Use `invokeMiddleware` to invoke two sets of middleware
   */
  class SequenceWithOneInvokeMiddleware extends DefaultSequence {
    async handle(context: RequestContext): Promise<void> {
      try {
        const {request, response} = context;
        // The default middleware chain
        let finished = await this.invokeMiddleware(context);
        if (finished) return;
        const route = this.findRoute(request);
        const args = await this.parseParams(request, route);
        const result = await this.invoke(route, args);

        // The second middleware chain for post-invocation processing
        context.bind('invocation.result').to(result);

        // Invoke another chain of middleware
        finished = await this.invokeMiddleware(context, {
          chain: POST_INVOCATION_MIDDLEWARE,
        });
        if (finished) return;
        this.send(response, result);
      } catch (error) {
        this.reject(context, error);
      }
    }
  }

  /**
   * Use another injected `invokeMiddleware` to invoke middleware after the
   * invocation returns.
   */
  class SequenceWithTwoInvokeMiddleware extends DefaultSequence {
    /**
     * Inject another middleware chain for post invocation
     */
    @inject('middleware.postInvoke', {optional: true})
    protected invokeMiddlewareAfterInvoke: InvokeMiddleware = () => false;

    async handle(context: RequestContext): Promise<void> {
      try {
        const {request, response} = context;
        // The default middleware chain
        let finished = await this.invokeMiddleware(context);
        if (finished) return;

        const route = this.findRoute(request);
        const args = await this.parseParams(request, route);
        const result = await this.invoke(route, args);

        // The second middleware chain for post-invocation processing
        context.bind('invocation.result').to(result);
        finished = await this.invokeMiddlewareAfterInvoke(context);
        if (finished) return;
        this.send(response, result);
      } catch (error) {
        this.reject(context, error);
      }
    }
  }
});

describe('Invoke a list of Express Middleware in sequence', () => {
  let helper: TestHelper;

  beforeEach(givenTestApp);
  afterEach(() => helper?.stop());

  function runTest(action: SpyAction, fn: () => Promise<void>) {
    it(`invokes a ${action} middleware`, () => {
      helper.app.sequence(givenSequence(action));
      return fn();
    });
  }

  runTest('log', () => helper.assertSpyLog());
  runTest('mock', () => helper.assertSpyMock());
  runTest('reject', () => helper.assertSpyReject());

  function givenTestApp() {
    helper = new TestHelper();
    helper.bindController();
    return helper.start();
  }

  function givenSequence(action: SpyAction): Constructor<DefaultSequence> {
    /**
     * Use `invokeMiddleware` to invoke two sets of middleware
     */
    class SequenceWithExpressMiddleware extends DefaultSequence {
      async handle(context: RequestContext): Promise<void> {
        try {
          const {request, response} = context;
          // The default middleware chain
          const finished = await this.invokeMiddleware(context, [
            spy({action}),
          ]);
          if (finished) return;
          const route = this.findRoute(request);
          const args = await this.parseParams(request, route);
          const result = await this.invoke(route, args);

          this.send(response, result);
        } catch (error) {
          this.reject(context, error);
        }
      }
    }
    return SequenceWithExpressMiddleware;
  }
});
