// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Application,
  Handler,
  httpHandler,
} from '../..';
import {expect, sinon} from '@loopback/testlab';

describe('http handler', () => {
  let app: Application;
  before(givenApp);

  it('returns a Handler', () => {
    const handler: Handler = httpHandler(app);
    expect(handler).to.be.type('function');
  });

  context('Handler', () => {
    // tslint:disable-next-line
    let stub: any;
    after(() => {
      stub.restore();
    });

    it('calls the injected app\'s handler function when invoked', async () => {
      stub = sinon.stub(app, 'handleHttp', () => true);
      const handler = httpHandler(app);
      expect(stub.calledOnce).to.be.false();
      // tslint:disable-next-line
      await handler({} as any, {} as any);
      expect(stub.calledOnce).to.be.true();
    });
  });

  function givenApp() {
    app = new Application();
  }
});
