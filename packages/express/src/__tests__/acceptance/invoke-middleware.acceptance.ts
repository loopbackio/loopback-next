// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/express
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ExpressServer, invokeExpressMiddleware} from '../../';
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

  async function givenTestApp() {
    helper = new TestHelper();
    helper.bindController();
    await helper.start();
    server = helper.app.expressServer;
  }
});
