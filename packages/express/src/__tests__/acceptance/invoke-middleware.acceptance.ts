// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/express
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ExpressServer, invokeExpressMiddleware} from '../../';
import {invokeMiddleware, toMiddleware} from '../../middleware';
import spyMiddlewareFactory from '../fixtures/spy.middleware';
import {spy, TestHelper} from './test-helpers';

describe('Express middleware registry', () => {
  let helper: TestHelper;
  let server: ExpressServer;

  beforeEach(givenTestApp);
  afterEach(() => helper?.stop());

  it('invokes Express middleware', async () => {
    server.middleware(
      async (ctx, next) => {
        const finished = await invokeExpressMiddleware(
          ctx,
          spy({action: 'log'}),
        );
        if (finished) return;
        return next();
      },
      {key: 'middleware.listOfExpressHandlers'},
    );
    await helper.assertSpyLog();
  });

  it('invokes middleware', async () => {
    const logMiddleware = toMiddleware(spyMiddlewareFactory({action: 'log'}));
    const mockMiddleware = toMiddleware(spyMiddlewareFactory({action: 'mock'}));

    server.middleware(logMiddleware, {chain: 'log'});
    server.middleware(mockMiddleware, {chain: 'mock'});

    server.middleware(async (ctx, next) => {
      invokeMiddleware(ctx, {
        chain: 'log',
        next: () => {
          return invokeMiddleware(ctx, {chain: 'mock', next});
        },
      });
    });
    await helper.client
      .post('/hello')
      .send('"World"')
      .set('content-type', 'application/json')
      .expect(200, 'Hello, Spy')
      .expect('x-spy-log', 'POST /hello')
      .expect('x-spy-mock', 'POST /hello');
  });

  async function givenTestApp() {
    helper = new TestHelper();
    helper.bindController();
    await helper.start();
    server = helper.app.expressServer;
  }
});
