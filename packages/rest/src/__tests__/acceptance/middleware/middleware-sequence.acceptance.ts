// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingScope, Constructor, CoreTags, inject} from '@loopback/core';
import {InvokeMiddleware, InvokeMiddlewareProvider} from '@loopback/express';
import {RequestContext} from '../../../request-context';
import {DefaultSequence} from '../../../sequence';
import {SpyAction} from '../../fixtures/middleware/spy-config';
import {spy, TestHelper} from './test-helpers';

const POST_INVOCATION_MIDDLEWARE = 'middleware.postInvocation';
describe('Middleware in sequence', () => {
  let helper: TestHelper;

  beforeEach(givenTestApp);
  afterEach(() => helper?.stop());

  it('registers a middleware in default slot', () => {
    const binding = helper.app.expressMiddleware(spy, undefined);
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
    const binding = helper.app.expressMiddleware(spy, undefined);
    return helper.testSpyLog(binding);
  });

  function givenTestApp() {
    helper = new TestHelper();
    // Create another middleware phase
    helper.app
      .bind('middleware.postInvoke')
      .toProvider(InvokeMiddlewareProvider)
      // Configure a different extension point name
      .tag({[CoreTags.EXTENSION_POINT]: POST_INVOCATION_MIDDLEWARE});
    helper.app.sequence(SequenceWithOneInvokeMiddleware);
    helper.bindController();
    return helper.start();
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
